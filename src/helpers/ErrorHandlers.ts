import { NextFunction, Request, Response } from 'express';
import Logger from './Logger';
import CustomError from './CustomError';

const MESSAGE_GENERIC_ERROR = 'Internal server error';
const MESSAGE_NOT_FOUND = 'Request resource not found';
const MESSAGE_CACHE_OUT_OF_DATE = 'Data is out of date';

const allErrors = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  Logger.error(
    `[API] Status Code : ${error.status || 500} message: ${
      error || MESSAGE_GENERIC_ERROR
    }`,
  );

  if (error.status) {
    return res.status(error.status).json({
      code: error.status,
      message: error.message || MESSAGE_GENERIC_ERROR,
      data: null,
    });
  }

  return res
    .status(500)
    .json({ code: 500, message: MESSAGE_GENERIC_ERROR, data: null });
};

// handle not found errors
export const notFound = (req: Request, res: Response): Response => {
  res.status(404);
  return res.json({
    code: 404,
    message: MESSAGE_NOT_FOUND,
    data: null,
  });
};

export default { notFound, allErrors };
