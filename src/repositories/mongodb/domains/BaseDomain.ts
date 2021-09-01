import mongoose from 'mongoose';
import { injectable } from 'inversify';

export interface BaseDomainInterface<
  Data,
  Model extends mongoose.Document & Data
> {
  getRecord: () => Promise<Model | null>;
  insertRecord: (data: Data) => Promise<Model>;
  updateRecord: (data: Data) => Promise<Model | null>;
}
@injectable()
export default class BaseDomain<Data, Document extends mongoose.Document & Data>
  implements BaseDomainInterface<Data, Document> {
  constructor(readonly DataModel: mongoose.Model<Document>) {}

  public async getRecord(): Promise<Document | null> {
    return this.DataModel.findOne().select({ __v: 0, _id: 0, createdAt: 0 });
  }

  public async insertRecord(data: Data): Promise<Document> {
    const newRecord = new this.DataModel(data);
    return newRecord.save();
  }

  public async updateRecord(data: Data): Promise<Document | null> {
    return this.DataModel.findOneAndUpdate({}, data, { upsert: true });
  }
}
