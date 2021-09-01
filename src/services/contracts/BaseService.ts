import { Provider } from '@ethersproject/providers';
import { Signer, Contract } from 'ethers';
import { injectable, unmanaged } from 'inversify';
import { provider } from '../../repositories/blockchain/connection';

export interface ContractsFactory {
  connect: (address: string, signerOrProvider: Signer | Provider) => Contract;
}

@injectable()
export default class BaseService<T extends Contract> {
  readonly contractInstances: { [address: string]: T };

  readonly contractFactory: ContractsFactory;

  constructor(@unmanaged() contractFactory: ContractsFactory) {
    this.contractFactory = contractFactory;
    this.contractInstances = {};
  }

  public getContractInstance = (address: string): T => {
    if (!this.contractInstances[address]) {
      this.contractInstances[address] = this.contractFactory.connect(
        address,
        provider,
      ) as T;
    }

    return this.contractInstances[address];
  };
}
