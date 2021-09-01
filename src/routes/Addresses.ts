import { Router } from 'express';
import DIContainer from '../config/DIContainer';
import AddressListings, {
  AddressListingsInterface,
} from '../services/AddressListings';

const addresses: Router = Router();

const addressesListingService: AddressListingsInterface = DIContainer.resolve(
  AddressListings,
);

addresses.get('/status/:address', addressesListingService.getAddressStatus);

export default addresses;
