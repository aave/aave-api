/**
 * Mirror collection for thegraph ReserveParamsHistoryItems
 */
import * as mongoose from 'mongoose';

export interface ReserveParamsHistoryItemModel {
  reserve: {
    id: string;
    symbol: string;
  };
  liquidityIndex: string;
  variableBorrowIndex: string;
  utilizationRate: string;
  stableBorrowRate: string;
  timestamp: number;
}

export interface ReserveParamsHistoryItemModelInterface
  extends mongoose.Document,
    ReserveParamsHistoryItemModel {}

const reserveParamsHistoryItemSchema = new mongoose.Schema({
  reserve: {
    id: { type: String, index: true },
    symbol: { type: String },
  },
  liquidityIndex: { type: String },
  variableBorrowIndex: { type: String },
  timestamp: { type: Number, index: true },
  utilizationRate: { type: String },
  stableBorrowRate: { type: String }
});
reserveParamsHistoryItemSchema.index(
  { 'reserve.id': 1, timestamp: 1 },
  { unique: true },
);

const reserveParamsHistoryItemModel: mongoose.Model<ReserveParamsHistoryItemModelInterface> = mongoose.model<ReserveParamsHistoryItemModelInterface>(
  'reserveParamsHistoryItem',
  reserveParamsHistoryItemSchema,
);

export default reserveParamsHistoryItemModel;
