import express from 'express';
import { register, login } from 'controllers/authController';
import { validateRequestBody } from 'middlewares/validationMiddleware';
import { insertUserSchema, loginSchema } from 'src/schemas';
import logger from '../../src/utils/logger';

const router = express.Router();

router.post('/register', (req, res, next) => {
    logger.info('Register route accessed' + req.body);
    register(req, res, next);
});

router.post('/login', (req, res, next) => {
    logger.info('Login route accessed' + req.body);
    login(req, res, next);
});

export default router;