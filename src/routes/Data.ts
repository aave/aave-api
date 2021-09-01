import { Router } from 'express';
import RatesHistory, { RatesHistoryInterface } from '../services/RatesHistory';
import DIContainer from '../config/DIContainer';

const data: Router = Router();

const ratesHistoryService: RatesHistoryInterface = DIContainer.resolve(
  RatesHistory,
);

data.get('/rates-history', ratesHistoryService.getRatesHistory);

export default data;
