import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export interface RateModel {
  reserveId: string;
  symbol: string;
  liquidityRate: string;
  variableBorrowRate: string;
  utilizationRate: string;
  stableBorrowRate: string;
  timestamp: number;
  fromReserveIndexRef: ObjectId;
}

export interface RateModelInterface extends RateModel, mongoose.Document {}

const rateSchema = new mongoose.Schema({
  reserveId: { type: String, index: true },
  symbol: { type: String },
  liquidityRate: { type: String },
  variableBorrowRate: { type: String },
  utilizationRate: { type: String },
  stableBorrowRate: { type: String },
  timestamp: { type: Number, index: true },
  // a meta reference to the reserve which was the starting point to calculate the rate
  fromReserveIndexRef: { type: ObjectId },
});
rateSchema.index({ reserveId: 1, timestamp: 1 }, { unique: true });

const rateModel: mongoose.Model<RateModelInterface> = mongoose.model<RateModelInterface>(
  'rate',
  rateSchema,
);
export default rateModel;
