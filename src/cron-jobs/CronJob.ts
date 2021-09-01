import { injectable } from 'inversify';
import MongoDBInterface from '../interfaces/MongoDB';

export interface JobInterface {
  execute: () => Promise<void>;
}

@injectable()
// TODO find correct typing
// eslint-disable-next-line @typescript-eslint/ban-types
export default class CronJob<J extends Function> {
  readonly mongoDB: MongoDBInterface;

  constructor(mongoDB: MongoDBInterface) {
    this.mongoDB = mongoDB;
  }

  readonly executeJob = async (job: J): Promise<void> => {
    await this.mongoDB.connect();
    await job();
    await this.mongoDB.closeConnection();
  };
}
