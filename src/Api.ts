import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { inject, injectable } from 'inversify';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import ApiInterface from './interfaces/Api';
import MongoDBInterface from './interfaces/MongoDB';
import routes from './routes';
import ErrorHandler, { notFound } from './helpers/ErrorHandlers';
import { loggerInstance } from './helpers/Logger';
import swaggerDocument from './swagger.json';

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
    this.serveSwaggerApiDocs();
    this.catchErrors();

    return this.express;
  }

  private serveSwaggerApiDocs() {
    const options = {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Aave API Documentation',
      customfavIcon: '/assets/favicon.ico',
    };

    const assetPath = path.join(__dirname, '../assets');
    this.express.use('/assets', express.static(assetPath));

    this.express.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, options),
    );
    this.express.use(
      '/',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, options),
    );
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
