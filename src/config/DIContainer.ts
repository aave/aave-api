import 'reflect-metadata';
import { Container } from 'inversify';
import MongoDB from '../repositories/mongodb/connection';
import MongoDBInterface from '../interfaces/MongoDB';

import { MONGO_URL } from './Environment';
import { gqlSdkV2 } from '../repositories/subgraph';
import RateDomain, {
  RatesDomainInterface,
} from '../repositories/mongodb/domains/Rate';
import rateModel from '../repositories/mongodb/models/Rate';

// load everything needed to the Container
const container = new Container();

const mongoDBInstance: MongoDBInterface = new MongoDB({ url: MONGO_URL });

const rateDomain: RatesDomainInterface = new RateDomain(rateModel);

container.bind('SubgraphClientV2').toConstantValue(gqlSdkV2);
container.bind('MongoDBClient').toConstantValue(mongoDBInstance);
container.bind('RateDomain').toConstantValue(rateDomain);

export default container;
