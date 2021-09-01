import { utils } from 'ethers';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { successHandler } from '../helpers/ResponseHandler';
import { AddressListingType } from '../repositories/mongodb/models/AddressListings';
import { AddressListingsDomainInterface } from '../repositories/mongodb/domains/addressListings';
import { PermissionManagerInterface } from './contracts/PermissionManager';

export interface AddressListingsInterface {
  getAddressStatus: (req: Request, res: Response) => Promise<void>;
}

@injectable()
export default class AddressListings implements AddressListingsInterface {
  readonly sdnURL: string;

  readonly addressListingDomain: AddressListingsDomainInterface;

  readonly permissionManagerService: PermissionManagerInterface;

  constructor(
    @inject('AddressListingDomain')
    addressListingDomain: AddressListingsDomainInterface,
    @inject('PermissionManagerService')
    permissionManagerService: PermissionManagerInterface,
  ) {
    this.addressListingDomain = addressListingDomain;
    this.permissionManagerService = permissionManagerService;
  }

  public getAddressStatus = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { address } = req.params;
      if (!utils.isAddress(address)) {
        res.status(400).send({
          error: 'URI parameter is not a valid eth address',
        });
        return;
      }

      const listing = await this.addressListingDomain.getRecordByAddress(
        address,
      );

      const permissions: number[] = await this.getPermissions(listing, address);

      successHandler(
        {
          permissions,
        },
        { res, swr: true, cacheSeconds: 60 },
      );
    } catch (error) {
      res.status(500).send({
        error:
          'Something failed in the Service. Please contact the Aave team !',
      });
    }
  };

  readonly getPermissions = async (
    listing: AddressListingType | null,
    address: string,
  ): Promise<number[]> => {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (
      listing &&
      listing.bcTimestamp &&
      currentTimestamp < listing.bcTimestamp + 60
    ) {
      return listing.permissions;
    }
    // if not check blockchain and store
    const permissions: number[] = await this.permissionManagerService.getAddressPermissions(
      address,
    );

    await this.addressListingDomain.updatePermissions(address, permissions);
    return permissions;
  };
}
