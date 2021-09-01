import { inject, injectable } from 'inversify';
import DIContainer from '../config/DIContainer';
import RateHistory, { RatesHistoryInterface } from '../services/RatesHistory';
import MongoDBInterface from '../interfaces/MongoDB';
import logger from '../helpers/Logger';
import CronJob, { JobInterface } from './CronJob';

export type jobMethodType = () => Promise<void>;

@injectable()
class UpdateRatesHistory
  extends CronJob<jobMethodType>
  implements JobInterface {
  readonly mongoDB: MongoDBInterface;

  readonly rateHistoryService: RatesHistoryInterface;

  constructor(@inject('MongoDBClient') mongoDB: MongoDBInterface) {
    super(mongoDB);
    this.rateHistoryService = DIContainer.resolve(RateHistory);
  }

  readonly updateRatesHistory = async (): Promise<void> => {
    await this.rateHistoryService.updateRatesHistory();
  };

  public execute = async (): Promise<void> => {
    await this.executeJob(this.updateRatesHistory);
  };
}

const updateRateHistoryInstance = DIContainer.resolve(UpdateRatesHistory);
updateRateHistoryInstance
  .execute()
  .then(() => {
    logger.info('Cron finished finished!');
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
