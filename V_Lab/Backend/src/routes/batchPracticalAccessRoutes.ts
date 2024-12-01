import express from 'express';
import { getBatchPracticalAccess, createOrUpdateBatchPracticalAccess } from '../controllers/batchPracticalAccessController';
// import { createBatchPracticalAccess, deleteBatchPracticalAccess, updateBatchPracticalAccess} from 'src/controllers/batchPracticalAccessController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';
import { validateRequestBody } from 'middlewares/validationMiddleware';
import { insertBatchPracticalAccessSchema, updateBatchPracticalAccessSchema } from 'src/schemas';

const router = express.Router();

// router.post('/', authMiddleware, roleMiddleware(['Faculty', 'HOD']), validateRequestBody(insertBatchPracticalAccessSchema), createBatchPracticalAccess);
// router.delete('/:id', authMiddleware, roleMiddleware(['Faculty', 'HOD']), deleteBatchPracticalAccess);
// router.put('/:id', authMiddleware, roleMiddleware(['Faculty', 'HOD']), validateRequestBody(updateBatchPracticalAccessSchema), updateBatchPracticalAccess);
// router.get('/:id', authMiddleware, getBatchPracticalAccess);
router.get('/:practicalId/:courseId/:facultyId', getBatchPracticalAccess);
router.get('/:practicalId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getBatchPracticalAccess);
router.get('/:practicalId/:facultyId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getBatchPracticalAccess);
router.post('/', authMiddleware, roleMiddleware(['Faculty', 'HOD']), createOrUpdateBatchPracticalAccess);

export default router;