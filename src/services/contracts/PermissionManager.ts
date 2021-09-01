import { BigNumber } from 'ethers';
import { inject, injectable } from 'inversify';
import { addresses } from '../../config/Addresses';
import {
  IPermissionManager,
  IPermissionManager__factory,
} from '../../contract-types';
import BaseService from './BaseService';

export interface PermissionManagerInterface {
  getAddressPermissions: (address: string) => Promise<number[]>;
}

@injectable()
export default class PermissionManagerService
  extends BaseService<IPermissionManager>
  implements PermissionManagerInterface {
  readonly permisssionManagerAddress: string;

  constructor() {
    super(IPermissionManager__factory);
    this.permisssionManagerAddress = addresses.PERMISSION_MANAGER;
  }

  public async getAddressPermissions(address: string): Promise<number[]> {
    if (this.permisssionManagerAddress === '') return [];
    const permissionsContract: IPermissionManager = this.getContractInstance(
      this.permisssionManagerAddress,
    );

    const [permissions, permissionsNumber]: [
      BigNumber[],
      BigNumber,
    ] = await permissionsContract.getUserPermissions(address);
    const parsedPermissions: number[] = [];
    permissions.forEach((permission: BigNumber, index: number) => {
      if (index < permissionsNumber.toNumber()) {
        parsedPermissions[index] = permission.toNumber();
      }
    });
    return parsedPermissions;
  }
}
