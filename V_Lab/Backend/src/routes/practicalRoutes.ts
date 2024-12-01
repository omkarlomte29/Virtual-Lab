import express from 'express';
import {
    getPracticals,
    createPractical,
    updatePractical,
    deletePractical,
    getPracticalByCourse,
    getPracticalById, getPracticalLanguages
} from '../controllers/practicalController';
import { getPracticalWithSubmissionStatus } from 'src/controllers/submissionController';

import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getPracticals);
router.post('/', authMiddleware, roleMiddleware(['HOD', 'Faculty']), createPractical);
router.put('/:id', authMiddleware, roleMiddleware(['HOD', 'Faculty']), updatePractical);
router.delete('/:id', authMiddleware, roleMiddleware(['HOD', 'Faculty']), deletePractical);

router.get('/course/:courseId', getPracticalByCourse);
router.get('/:id', getPracticalById);
router.get('/:id/languages', getPracticalLanguages);


// router.get('/:courseId', getPracticalByCourse);
router.get('/:courseId/student-view', authMiddleware, roleMiddleware(['Student']), getPracticalWithSubmissionStatus);


export default router;