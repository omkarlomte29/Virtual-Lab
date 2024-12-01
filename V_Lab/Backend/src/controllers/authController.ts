import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AppError } from 'src/utils/errors';

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { user, token } = await authService.registerUser(req.body);
        res.status(201).json({ user, token });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { token, user } = await authService.loginUser(req.body);
        res.json({ token, user });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}