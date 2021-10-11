import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { inject, injectable } from 'inversify';
import ApiInterface from './interfaces/Api';
import MongoDBInterface from './interfaces/MongoDB';
import routes from './routes';
import ErrorHandler, { notFound } from './helpers/ErrorHandlers';
import { loggerInstance } from './helpers/Logger';

@injectable()
export default class Api implements ApiInterface {
  private express: express.Application;

  readonly mongoDB: MongoDBInterface;

  constructor(@inject('MongoDBClient') mongoDB: MongoDBInterface) {
    this.mongoDB = mongoDB;
  }

  public async init(): Promise<express.Application> {
    this.express = express();

    await this.mongoDB.connect();

    this.initMiddlewares();
    this.logRequests();
    this.initEndpointRoutes();
    this.catchErrors();

    return this.express;
  }

  private initMiddlewares() {
    this.express.use(cors());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
    this.express.use(helmet());
  }

  private initEndpointRoutes() {
    this.express.use('/', routes);
  }

  private logRequests(): void {
    this.express.use(
      morgan('common', { stream: loggerInstance.getStreamMorgan() }),
    );
  }

  private catchErrors(): void {
    this.express.use(notFound);
    this.express.use(ErrorHandler.allErrors);
  }
}
