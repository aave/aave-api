import { injectable } from 'inversify';
import mongoose from 'mongoose';
import {
  AddressListingType,
  AddressListingInterface,
} from '../models/AddressListings';
import BaseDomain, { BaseDomainInterface } from './BaseDomain';

export interface AddressListingsDomainInterface
  extends BaseDomainInterface<AddressListingType, AddressListingInterface> {
  getRecordByAddress: (address: string) => Promise<AddressListingType | null>;
  updatePermissions: (address: string, permissions: number[]) => Promise<void>;
}

@injectable()
export default class AddressListingsDomain
  extends BaseDomain<AddressListingType, AddressListingInterface>
  implements AddressListingsDomainInterface {
  public async updatePermissions(
    address: string,
    permissions: number[],
  ): Promise<void> {
    await this.DataModel.updateOne(
      { address: address.toLowerCase() },
      { permissions, bcTimestamp: Math.floor(Date.now() / 1000) },
      { upsert: true },
    );
  }

  public async getRecordByAddress(
    address: string,
  ): Promise<AddressListingType | null> {
    const bcUser = await this.DataModel.findOne({
      address: address.toLowerCase(),
    });
    return bcUser;
  }
}
