import { Response } from 'express';

type SuccessHandlerOptions = {
  res: Response;
  cacheSeconds?: number;
  swr?: boolean;
};

export function successHandler(
  payload: any, // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  { res, swr, cacheSeconds = 10 }: SuccessHandlerOptions,
): void {
  res.setHeader(
    'Cache-Control',
    `s-maxage=${cacheSeconds}${swr ? `, stale-while-revalidate` : ''}`,
  );
  res.status(200).json(payload);
}