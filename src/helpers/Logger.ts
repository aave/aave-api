/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json, errors, splat } = format;

class Logger {
  readonly serviceName: string;

  private logger: any;

  readonly transports: any;

  readonly exceptionHandlers: any;

  public constructor({ serviceName }: { serviceName: string }) {
    this.serviceName = serviceName;

    this.transports = [];
    this.exceptionHandlers = [];
    this.createExceptionHandlers();
    this.createTransports();
    this.createLogger();
  }

  public getLogger() {
    return this.logger;
  }

  public getStreamMorgan() {
    return this.logger.streamMorgan;
  }

  public getTransportsList() {
    return this.transports;
  }

  public getExceptionHandlerList() {
    return this.exceptionHandlers;
  }

  private createLogger() {
    this.logger = createLogger({
      level: 'info',
      defaultMeta: { service: this.serviceName },
      transports: this.transports,
      exitOnError: false,
      exceptionHandlers: this.exceptionHandlers,
    });

    this.logger.streamMorgan = {
      write: (message: any) => {
        this.logger.info(message);
      },
    };
  }

  private createExceptionHandlers() {
    const consoleException = new transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        splat(),
        errors(),
        json(),
      ),
    });
    this.exceptionHandlers.push(consoleException);
  }

  private createTransports() {
    const consoleTransport = new transports.Console({
      level: 'info',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        splat(),
        errors(),
        json(),
      ),
    });
    this.transports.push(consoleTransport);
  }
}

export const loggerInstance = new Logger({
  serviceName: process.env.npm_package_name || 'Aave-api',
});

const logger = loggerInstance.getLogger();

export default logger;
