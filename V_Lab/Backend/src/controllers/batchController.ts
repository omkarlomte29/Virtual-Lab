import { Request, Response, NextFunction } from 'express';
import * as batchService from '../services/batchService';
import { AppError } from '../../src/utils/errors';
import { AuthenticatedRequest } from '../../src/middlewares/authMiddleware';

// Fetch batches and divisions
export async function getBatches(req: Request, res: Response) {
    const { department_id, semester } = req.query;
  
    try {
      const batches = await batchService.getBatchesByDepartmentAndSemester(
        parseInt(department_id as string),
        parseInt(semester as string),
      );
      res.status(200).json(batches);
    } catch (error) {
      console.error("Error fetching batches:", error);
      res.status(500).json({ error: "Failed to fetch batches" });
    }
  }

export async function createBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const newBatch = await batchService.createBatch(req.body);
        res.status(201).json(newBatch);
    } catch (error) {
        next(error);
    }
}

export async function updateBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const updatedBatch = await batchService.updateBatch(parseInt(req.params.id), req.body);
        res.json(updatedBatch);
    } catch (error) {
        next(error);
    }
}

export async function deleteBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        await batchService.deleteBatch(parseInt(req.params.id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function getBatchesByDepartmentAndSemester(req: Request, res: Response, next: NextFunction) {
    try {
        const { departmentId, semester } = req.params;
        const batches = await batchService.getBatchesByDepartmentAndSemester(parseInt(departmentId), parseInt(semester));
        res.json(batches);
    } catch (error) {
        next(error);
    }
}

// Add batch and division
// export async function addBatch(req: Request, res: Response) {
//     const { department_id, semester, division, batch } = req.body;
  
//     if (!department_id || !semester || !division || !batch) {
//       throw new AppError(400, 'Missing required fields');
//     }
  
//     try {
//       const newBatch = await batchService.addBatch({
//         department_id,
//         semester,
//         division,
//         batch,
//       });
//       res.status(201).json(newBatch);
//     } catch (error) {
//       console.error("Error adding batch:", error);
//       res.status(500).json({ error: "Failed to add batch" });
//     }
// }