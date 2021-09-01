import { Router } from 'express';
import Data from './Data';
import Addresses from './Addresses';

const router = Router();

router.use('/data', Data);
router.use('/addresses', Addresses);

export default router;
