// import { Request, Response, NextFunction } from 'express';
// import redis from '../config/redis';
// import { AppError } from '../utils/errors';

// interface RateLimitOptions {
//     windowMs: number;
//     max: number;
//     keyGenerator?: (req: Request) => string;
// }

// export const createRateLimiter = (options: RateLimitOptions) => {
//     const {
//         windowMs,
//         max,
//         keyGenerator = (req: Request) => {
//             const userId = req.user?.user_id || 'anonymous';
//             return `ratelimit:${req.path}:${userId}`;
//         }
//     } = options;

//     return async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const key = keyGenerator(req);

//             const current = await redis.get(key);
//             if (!current) {
//                 await redis.set(key, '1', { EX: Math.floor(windowMs / 1000) });
//                 return next();
//             }

//             const count = parseInt(current, 10);
//             if (count >= max) {
//                 throw new AppError(429, 'Too many requests, please try again later');
//             }

//             await redis.set(key, (count + 1).toString(), {
//                 KEEPTTL: true // Keep the existing TTL
//             });

//             next();
//         } catch (error) {
//             if (error instanceof AppError) {
//                 next(error);
//             } else {
//                 // If Redis fails, we'll let the request through
//                 console.error('Rate limit check failed:', error);
//                 next();
//             }
//         }
//     };
// };

import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

interface RateLimitOptions {
    windowMs: number;
    max: number;
    keyPrefix?: string;
}

export const createRateLimiter = (options: RateLimitOptions) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.user_id;
        if (!userId) {
            return next(new AppError(401, 'Unauthorized'));
        }

        const key = `${options.keyPrefix || 'ratelimit'}:${userId}`;

        try {
            const current = await redis.get(key);

            if (current) {
                return next(new AppError(429, 'Too many requests. Please try again later.'));
            }

            await redis.set(key, '1', { EX: Math.floor(options.windowMs / 1000) });
            next();
        } catch (error) {
            console.error('Rate limiter error:', error);
            // Continue if Redis fails
            next();
        }
    };
};