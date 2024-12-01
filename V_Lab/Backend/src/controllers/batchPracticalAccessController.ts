import { Request, Response, NextFunction } from 'express';
import * as batchPracticalAccessService from 'src/services/batchPracticalAccessService';
import { AppError } from '../../src/utils/errors';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// export async function createBatchPracticalAccess(req: Request, res: Response, next: NextFunction) {
//     try {
//         const access = await batchPracticalAccessService.createBatchPracticalAccess(req.body);
//         res.status(201).json(access);
//     } catch (error) {
//         if (error instanceof AppError) {
//             res.status(error.statusCode).json({ error: error.message });
//         } else {
//             next(error);
//         }
//     }
// }

// export async function deleteBatchPracticalAccess(req: Request, res: Response, next: NextFunction) {
//     try {
//         await batchPracticalAccessService.deleteBatchPracticalAccess(parseInt(req.params.id));
//         res.status(204).send();
//     } catch (error) {
//         if (error instanceof AppError) {
//             res.status(error.statusCode).json({ error: error.message });
//         } else {
//             next(error);
//         }
//     }
// }

// export async function updateBatchPracticalAccess(req: Request, res: Response, next: NextFunction) {
//     try {
//         const access = await batchPracticalAccessService.updateBatchPracticalAccess(parseInt(req.params.id), req.body);
//         res.json(access);
//     } catch (error) {
//         if (error instanceof AppError) {
//             res.status(error.statusCode).json({ error: error.message });
//         } else {
//             next(error);
//         }
//     }
// }

// export async function getBatchPracticalAccess(req: Request, res: Response, next: NextFunction) {
//     try {
//         const access = await batchPracticalAccessService.getBatchPracticalAccess(parseInt(req.params.id));
//         if (access) {
//             res.json(access);
//         } else {
//             res.status(404).json({ error: 'Batch practical access not found' });
//         }
//     } catch (error) {
//         if (error instanceof AppError) {
//             res.status(error.statusCode).json({ error: error.message });
//         } else {
//             next(error);
//         }
//     }
// }

// export async function getBatchPracticalAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     try {
//         const { practicalId } = req.params;
//         const { facultyId } = req.params;
//         const batchAccess = await batchPracticalAccessService.getBatchPracticalAccess(parseInt(practicalId), parseInt(facultyId));
//         res.json(batchAccess);
//     } catch (error) {
//         next(error);
//     }
// }

export const getBatchPracticalAccess = async (req: Request, res: Response) => {
    try {
        const practicalId = parseInt(req.params.practicalId);
        const courseId = parseInt(req.params.courseId);
        const facultyId = parseInt(req.params.facultyId);

        if (isNaN(practicalId) || isNaN(courseId) || isNaN(facultyId)) {
            return res.status(400).json({ message: 'Invalid parameters' });
        }

        const batchAccess = await batchPracticalAccessService.getBatchPracticalAccess(
            practicalId,
            courseId,
            facultyId
        );

        res.json(batchAccess);
    } catch (error) {
        console.error('Error in getBatchPracticalAccess:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export async function createOrUpdateBatchPracticalAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { practical_id, batch_id, lock, deadline } = req.body;
        const result = await batchPracticalAccessService.createOrUpdateBatchPracticalAccess({
            practical_id,
            batch_id,
            lock,
            deadline: new Date(deadline),
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
}
