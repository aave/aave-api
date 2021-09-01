import mongoose from 'mongoose';
import Logger from '../../helpers/Logger';
import MongoDBInterface from '../../interfaces/MongoDB';

export default class MongoDB implements MongoDBInterface {
  private connection: typeof mongoose;

  readonly url: string;

  constructor({ url }: { url: string }) {
    this.url = url;
  }

  public async connect(): Promise<void> {
    if (!this.connection) {
      this.connection = await mongoose.connect(this.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      if (this.connection.connections[0].readyState) {
        Logger.info('🚀 Connected to MongoDB at: http://0.0.0.0:8081');
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public async closeConnection(): Promise<void> {
    await mongoose.connection.close();
  }

  public getConnection(): typeof mongoose {
    return this.connection;
  }
}
