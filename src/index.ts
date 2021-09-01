import express from 'express';
import DIContainer from './config/DIContainer';
import Api from './Api';
import ApiInterface from './interfaces/Api';
import Logger from './helpers/Logger';
import { PORT } from './config/Environment';

const api: ApiInterface = DIContainer.resolve(Api);

api
  .init()
  .then((express: express.Application) => {
    express.listen(PORT, () => {
      Logger.info(`🚀 Http server listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    Logger.error('express error: ', error);
    process.exit(1);
  });
