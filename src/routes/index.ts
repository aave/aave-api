import { Router } from 'express';
import Data from './Data';

const router = Router();

router.use('/data', Data);

export default router;
