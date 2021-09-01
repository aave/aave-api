import { GraphQLClient } from 'graphql-request';
import { THE_GRAPH_URI } from '../../config/Environment';
import { getSdk as getSdkV2, Sdk as SdkV2 } from './v2Client';

export const gqlSdkV2: SdkV2 = getSdkV2(new GraphQLClient(THE_GRAPH_URI));

export { SdkV2 };
