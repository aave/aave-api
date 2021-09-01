import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { calculateAverageRate, normalize } from '@aave/protocol-js';
import Rate, {
  RateModel,
  RateModelInterface,
} from '../repositories/mongodb/models/Rate';
import { RatesDomainInterface } from '../repositories/mongodb/domains/Rate';
import { SdkV2 } from '../repositories/subgraph';
import ReserveParamsHistoryItem, {
  ReserveParamsHistoryItemModel,
  ReserveParamsHistoryItemModelInterface,
} from '../repositories/mongodb/models/ReserveParamsHistoryItem';
import { successHandler } from '../helpers/ResponseHandler';

// max 1000 by thegraph
const LIMIT = 1000;

type GetRatesParams = {
  from: ReserveParamsHistoryItemModelInterface;
  to: ReserveParamsHistoryItemModelInterface;
};

const INTERVAL = 5 * 60;
const INSERT_LIMIT = 3000;
if (INTERVAL % 30 !== 0)
  throw new Error(
    'the interval has to be divisible by 30 for equal distribution over days',
  );

function getStartTimestamp(refTimestamp: number) {
  const quotient = Math.floor(refTimestamp / INTERVAL);
  return quotient * INTERVAL;
}

export interface RatesHistoryInterface {
  getRatesHistory: (req: Request, resp: Response) => Promise<void>;
  updateRatesHistory: () => Promise<void>;
}

@injectable()
export default class RatesHistory implements RatesHistoryInterface {
  readonly rateDomain: RatesDomainInterface;

  readonly subgraphClientV2: SdkV2;

  constructor(
    @inject('SubgraphClientV2') subgraphClientV2: SdkV2,
    @inject('RateDomain') rateDomain: RatesDomainInterface,
  ) {
    this.rateDomain = rateDomain;
    this.subgraphClientV2 = subgraphClientV2;
  }

  private readonly fetchHistoricalRates = async (
    gqlClient: SdkV2,
    fromTimeStamp: number,
    depth = 0,
  ): Promise<Omit<ReserveParamsHistoryItemModel, 'version'>[]> => {
    try {
      const response = await gqlClient.HistoryItems({
        from: fromTimeStamp,
        first: LIMIT,
      });
      if (
        response.data?.reserveParamsHistoryItems.length === LIMIT &&
        depth <= 10 // => ~15k reserveUpdates
      ) {
        return [
          ...response.data?.reserveParamsHistoryItems,
          ...(await this.fetchHistoricalRates(
            gqlClient,
            response.data?.reserveParamsHistoryItems[
              response.data?.reserveParamsHistoryItems.length - 1
            ].timestamp,
            (depth || 0) + 1,
          )),
        ];
      }
      return response.data?.reserveParamsHistoryItems || [];
    } catch (e) {
      return [];
    }
  };

  private readonly getRatesBetween = (
    { from, to }: GetRatesParams,
    currentTimestamp: number,
  ) => {
    const rates = [];
    const liquidityRate = calculateAverageRate(
      from.liquidityIndex,
      to.liquidityIndex,
      from.timestamp,
      to.timestamp,
    );
    const variableBorrowRate = calculateAverageRate(
      from.variableBorrowIndex,
      to.variableBorrowIndex,
      from.timestamp,
      to.timestamp,
    );
    // TODO: reevaluate if it would make more sense to do a weighted average like we do with index baed rates
    const { utilizationRate, stableBorrowRate: stableBorrowRateRaw } = from;
    const stableBorrowRate = normalize(stableBorrowRateRaw, 27);

    for (
      let timestamp = currentTimestamp;
      timestamp <= to.timestamp;
      timestamp += INTERVAL
    ) {
      rates.push({
        timestamp,
        liquidityRate,
        variableBorrowRate,
        utilizationRate,
        stableBorrowRate,
      });
    }
    return rates;
  };

  private readonly getRates = (
    startTimestamp: number,
    reservesHistory: ReserveParamsHistoryItemModelInterface[],
  ) => {
    const ratesEntries: RateModel[] = [];
    let currentTimestamp = startTimestamp;
    for (let i = 0; i < reservesHistory.length - 1; i += 1) {
      if (reservesHistory[i + 1].timestamp <= currentTimestamp) {
        // skip till the index is the closest we can get
      } else {
        const from = reservesHistory[i];
        const to = reservesHistory.find(
          // eslint-disable-next-line no-loop-func
          (reserve) => reserve.timestamp >= currentTimestamp + INTERVAL,
        );
        if (!to) break;
        const rates = this.getRatesBetween({ from, to }, currentTimestamp);
        if (rates.length) {
          rates.forEach((rate) =>
            ratesEntries.push({
              ...rate,
              symbol: from.reserve.symbol,
              reserveId: from.reserve.id,
              fromReserveIndexRef: from.id,
            }),
          );
          if (ratesEntries.length >= INSERT_LIMIT) break;
          currentTimestamp = rates[rates.length - 1].timestamp;
        }
        currentTimestamp += INTERVAL;
      }
    }
    return ratesEntries;
  };

  private readonly updateReservesHistory = async (
    gqlClient: SdkV2,
  ): Promise<void> => {
    const lastCacheItem = await ReserveParamsHistoryItem.findOne({}, null, {
      sort: { timestamp: -1 },
    });
    const newRateParamsHistoryItems = await this.fetchHistoricalRates(
      gqlClient,
      lastCacheItem?.timestamp || 0,
    );
    const bulk = ReserveParamsHistoryItem.collection.initializeOrderedBulkOp();
    newRateParamsHistoryItems.forEach((reserveHistory) => {
      // upsert new ones
      bulk
        .find({
          'reserve.id': reserveHistory.reserve.id,
          timestamp: reserveHistory.timestamp,
        })
        .upsert()
        .updateOne({
          $setOnInsert: { ...reserveHistory },
        });
    });
    if (bulk.length) await bulk.execute();
  };

  private readonly updateRates = async (): Promise<void> => {
    const reserveIds: string[] = await ReserveParamsHistoryItem.distinct(
      'reserve.id',
    );
    const promises: Promise<RateModelInterface[]>[] = [];
    for (const reserveId of reserveIds) {
      const lastRate = await Rate.findOne({ reserveId }, null, {
        sort: { timestamp: -1 },
      });
      const reservesHistory = await ReserveParamsHistoryItem.find(
        {
          ...(lastRate ? { _id: { $gte: lastRate.fromReserveIndexRef } } : {}),
          'reserve.id': reserveId,
        },
        null,
        { sort: { timestamp: 1 }, limit: 3000 },
      );
      const startTimestamp =
        lastRate?.timestamp || getStartTimestamp(reservesHistory[0].timestamp);
      const rateEntries = this.getRates(
        startTimestamp + INTERVAL,
        reservesHistory,
      );
      if (rateEntries.length) {
        promises.push(Rate.insertMany(rateEntries, { ordered: false }));
      }
    }
    await Promise.all(promises);
  };

  public getRatesHistory = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { reserveId, from, resolutionInHours } = req.query;

    if (!reserveId) {
      res.status(500).send({
        error: 'You ned to provide a reserveId',
      });
      return;
    }
    try {
      const results = await this.rateDomain.getRates(
        {
          reserveId: (reserveId as string).toLowerCase(),
          ...(from ? { timestamp: { $gte: Number(from) } } : {}),
        },
        resolutionInHours ? Number(resolutionInHours) : undefined,
      );
      successHandler(results, { res, swr: true, cacheSeconds: 5 * 60 });
    } catch (error) {
      res.status(500).send({
        error:
          'Something failed in the Service. Please contact the Aave team !',
      });
    }
  };

  public updateRatesHistory = async (): Promise<void> => {
    await this.updateReservesHistory(this.subgraphClientV2);
    await this.updateRates();
  };
}
