import mongoose from 'mongoose';

export type AddressListingType = {
  address: string;
  permissions: number[];
  bcTimestamp: number;
};

export interface AddressListingInterface
  extends AddressListingType,
    mongoose.Document {}

const addressListingSchema = new mongoose.Schema<AddressListingInterface>(
  {
    address: { type: String },
    permissions: [{ type: Number }],
    bcTimestamp: { type: Number },
  },
  { timestamps: true },
);

const addressListingModel: mongoose.Model<AddressListingInterface> = mongoose.model(
  'addressListing',
  addressListingSchema,
);

export default addressListingModel;
