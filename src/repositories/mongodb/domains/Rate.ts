import { injectable } from 'inversify';
import mongoose, { FilterQuery } from 'mongoose';
import { RateModelInterface } from '../models/Rate';

type AggregatedRate = {
  liquidityRate_avg: number;
  variableBorrowRate_avg: number;
  x: {
    year: number;
    month: number;
    date: number;
    hours: number;
  };
};

export interface RatesDomainInterface {
  getRates: (
    query: FilterQuery<RateModelInterface>,
    resolutionInHours?: number,
  ) => Promise<AggregatedRate[]>;
}

@injectable()
export default class RateDomain implements RatesDomainInterface {
  readonly Rate: mongoose.Model<RateModelInterface>;

  constructor(rate: mongoose.Model<RateModelInterface>) {
    this.Rate = rate;
  }

  public async getRates(
    query: FilterQuery<RateModelInterface>,
    resolutionInHours = 6,
  ): Promise<AggregatedRate[]> {
    return this.Rate.aggregate([
      {
        $match: query,
      },
      {
        $addFields: {
          liquidityRate: {
            $convert: {
              input: '$liquidityRate',
              to: 'double',
              onError: null,
            },
          },
          variableBorrowRate: {
            $convert: {
              input: '$variableBorrowRate',
              to: 'double',
              onError: null,
            },
          },
          stableBorrowRate: {
            $convert: {
              input: '$stableBorrowRate',
              to: 'double',
              onError: null,
            },
          },
          utilizationRate: {
            $convert: {
              input: '$utilizationRate',
              to: 'double',
              onError: null,
            },
          },
          date: {
            $toDate: {
              $multiply: ['$timestamp', 1000],
            },
          },
        },
      },
      {
        $addFields: {
          x: {
            year: {
              $year: '$date',
            },
            month: {
              $subtract: [
                {
                  $month: '$date',
                },
                1,
              ],
            },
            date: {
              $dayOfMonth: '$date',
            },
            hours: {
              $floor: { $divide: [{ $hour: '$date' }, resolutionInHours] },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            x: '$x',
          },
          liquidityRate_avg: {
            $avg: '$liquidityRate',
          },
          variableBorrowRate_avg: {
            $avg: '$variableBorrowRate',
          },
          utilizationRate_avg: {
            $avg: '$utilizationRate',
          },
          stableBorrowRate_avg: {
            $avg: '$stableBorrowRate',
          },
        },
      },
      {
        $project: {
          _id: 0,
          'x.year': '$_id.x.year',
          'x.month': '$_id.x.month',
          'x.date': '$_id.x.date',
          'x.hours': { $multiply: ['$_id.x.hours', resolutionInHours] },
          liquidityRate_avg: 1,
          variableBorrowRate_avg: 1,
          utilizationRate_avg: 1,
          stableBorrowRate_avg: 1,
        },
      },
      {
        $sort: {
          'x.year': 1,
          'x.month': 1,
          'x.date': 1,
          'x.hours': 1,
        },
      },
    ]);
  }
}
