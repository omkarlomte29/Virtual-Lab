import { Request, Response, NextFunction } from 'express';
import * as programmingLanguageService from 'services/programmingLanguageService';
import { AppError } from '../../src/utils/errors';
import { AuthenticatedRequest } from '../../src/middlewares/authMiddleware';

export async function getProgrammingLanguages(req: Request, res: Response, next: NextFunction) {
    try {
        const languages = await programmingLanguageService.getProgrammingLanguages();
        res.json(languages);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function createProgrammingLanguage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const language = await programmingLanguageService.createProgrammingLanguage(req.body);
        res.status(201).json(language);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function updateProgrammingLanguage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const language = await programmingLanguageService.updateProgrammingLanguage(parseInt(req.params.id), req.body);
        res.json(language);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function deleteProgrammingLanguage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        await programmingLanguageService.deleteProgrammingLanguage(parseInt(req.params.id));
        res.status(204).send();
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}