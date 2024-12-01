import express from 'express';
import {
    getSubmissionsByPractical,
    getSubmissionById,
    updateSubmission,
    getStudentSubmissions,
    getStudentDetails,
    updateStudent,
    deleteStudent, getPreviousSubmission,
    submitCode, runCode, getRunResult, getSubmissionStatus
} from '../controllers/submissionController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { createRateLimiter } from '../middlewares/createRateLimiter';

const router = express.Router();

// router.post('/', authMiddleware, createSubmission);
router.post('/submit-code', authMiddleware, createRateLimiter({
    windowMs: 3 * 1000, // 30 seconds
    max: 1,
    keyPrefix: 'submit'
}), submitCode);
router.get('/practical/:practicalId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getSubmissionsByPractical);
router.get('/:submissionId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getSubmissionById);
router.put('/:submissionId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), updateSubmission);
// router.get('/student/:studentId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentSubmissions);
// router.get('/student-details/:studentId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentDetails);
router.put('/student/:studentId', authMiddleware, roleMiddleware(['HOD']), updateStudent);
router.delete('/student/:studentId', authMiddleware, roleMiddleware(['HOD']), deleteStudent);
router.post('/run', authMiddleware, createRateLimiter({
    windowMs: 15 * 1000, // 15 seconds
    max: 1 // 1 request per window
}), runCode);
router.get('/run/:token', authMiddleware, getRunResult);
router.get('/:submissionId/status', authMiddleware, getSubmissionStatus);

router.get('/previous/:practicalId', authMiddleware, getPreviousSubmission);

router.get('/student/:studentId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentSubmissions);
router.get('/student-details/:studentId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentDetails);


export default router;