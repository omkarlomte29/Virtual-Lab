import express from 'express';
import { getBatches, createBatch, updateBatch, deleteBatch, getBatchesByDepartmentAndSemester } from 'controllers/batchController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

router.get('/', getBatches);
router.post('/', authMiddleware, roleMiddleware(['HOD', 'Faculty', 'Admin']), createBatch);
router.put('/:id', authMiddleware, roleMiddleware(['HOD', 'Faculty', 'Admin']), updateBatch);
router.delete('/:id', authMiddleware, roleMiddleware(['HOD', 'Faculty', 'Admin']), deleteBatch);
// router.post('/batches', authMiddleware, addBatch);
router.post('/batches', authMiddleware, createBatch);
router.get('/batches', authMiddleware, getBatches);
router.get('/department/:departmentId/semester/:semester', getBatchesByDepartmentAndSemester);

export default router;