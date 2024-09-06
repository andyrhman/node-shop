import { Request, Response, NextFunction } from 'express';
import { AppError } from './apperror.middleware';

const sendErrorDev = (err: AppError, res: Response) => {
    console.error('ERROR 💥', err);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    });
};

const sendErrorProd = (err: AppError, res: Response) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.isOperational ? err.message : 'Something went very wrong!'
    });
};

export const globalErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        sendErrorProd(err, res);
    }
};