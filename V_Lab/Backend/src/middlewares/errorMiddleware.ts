import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error('Error occurred:', { error: err, stack: err.stack });

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    // If it's not an AppError, it's an unexpected error
    res.status(500).json({ error: 'An unexpected error occurred' });
}