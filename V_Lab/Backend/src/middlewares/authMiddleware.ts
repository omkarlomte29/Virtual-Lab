import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import { AppError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import { getUserById } from 'services/userService';

export interface AuthenticatedRequest extends Request {
    user?: any;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return next(new AppError(401, 'No token provided'));
    }

    try {
        const decoded = verifyToken(token);
        const user = await getUserById(decoded.id);
        if (!user) {
            return next(new AppError(401, 'User not found'));
        }
        req.user = user;
        next();
    } catch (error) {
        next(new AppError(401, 'Invalid token'));
    }
}

export function roleMiddleware(roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(401, 'Authentication required'));
        }
        if (roles.includes(req.user.role)) {
            next();
        } else {
            next(new AppError(403, 'Access denied'));
        }
    };
}