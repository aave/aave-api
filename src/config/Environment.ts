import { Network } from '@aave/protocol-js';

export const PORT = process.env.PORT || 3000;
export const MONGO_URL = process.env.MONGO_URL || '';
export const JSONRPC_URL = process.env.JSONRPC_URL || '';
export const NETWORK = (process.env.NETWORK || '') as Network;
export const THE_GRAPH_URI = process.env.THE_GRAPH_URI || '';

if (!Object.values(Network).includes(NETWORK))
  throw new Error(
    `the provided NETWORK env has to be one of [${Object.values(Network).join(
      ',',
    )}]`,
  );
