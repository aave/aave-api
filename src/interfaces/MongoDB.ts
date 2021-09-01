import * as mongoose from 'mongoose';

export default interface MongoDBInterface {
  connect: () => Promise<void>;
  getConnection: () => typeof mongoose;
  closeConnection: () => Promise<void>;
}
