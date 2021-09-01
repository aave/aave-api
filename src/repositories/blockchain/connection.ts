import { providers } from 'ethers';
import { ChainId } from '@aave/protocol-js';
import { JSONRPC_URL, NETWORK } from '../../config/Environment';

export const provider = new providers.JsonRpcProvider(
  JSONRPC_URL,
  ChainId[NETWORK],
);
