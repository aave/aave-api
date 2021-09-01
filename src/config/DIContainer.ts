import 'reflect-metadata';
import { Container } from 'inversify';
import MongoDB from '../repositories/mongodb/connection';
import MongoDBInterface from '../interfaces/MongoDB';

import { MONGO_URL } from './Environment';
import { gqlSdkV2 } from '../repositories/subgraph';
import addressListingModel from '../repositories/mongodb/models/AddressListings';
import AddressListingsDomain, {
  AddressListingsDomainInterface,
} from '../repositories/mongodb/domains/addressListings';
import PermissionManagerService, {
  PermissionManagerInterface,
} from '../services/contracts/PermissionManager';
import RateDomain, {
  RatesDomainInterface,
} from '../repositories/mongodb/domains/Rate';
import rateModel from '../repositories/mongodb/models/Rate';

// load everything needed to the Container
const container = new Container();

const mongoDBInstance: MongoDBInterface = new MongoDB({ url: MONGO_URL });

const rateDomain: RatesDomainInterface = new RateDomain(rateModel);
const addressListingDomain: AddressListingsDomainInterface = new AddressListingsDomain(
  addressListingModel,
);

container.bind('SubgraphClientV2').toConstantValue(gqlSdkV2);
container.bind('MongoDBClient').toConstantValue(mongoDBInstance);
container.bind('AddressListingDomain').toConstantValue(addressListingDomain);
container.bind('RateDomain').toConstantValue(rateDomain);

const permissionManagerServiceInstance: PermissionManagerInterface = container.resolve(
  PermissionManagerService,
);

container
  .bind('PermissionManagerService')
  .toConstantValue(permissionManagerServiceInstance);

export default container;
