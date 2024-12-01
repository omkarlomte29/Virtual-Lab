import express from 'express';
import {
    getStudentsByBatch, getStudentByRollId, getStudentsByDepartmentAndSemester, getStudentSubmissions, getStudentsWithFilters, getDepartments,
    getSemesters,
    getDivisions,
    getBatches,
    getStudentsByDepartment,
} from 'controllers/studentController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

router.get('/department/:department', authMiddleware, getStudentsByDepartment);
router.get('/batch/:batchId', authMiddleware, getStudentsByBatch);
router.get('/roll/:rollId', authMiddleware, getStudentByRollId);
router.get('/department/:departmentId/semester/:semester', authMiddleware, getStudentsByDepartmentAndSemester);
router.get('/:studentId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentSubmissions);


router.get('/', authMiddleware, roleMiddleware(['Faculty', 'HOD', 'Admin']), getStudentsWithFilters);
router.get('/:studentId/submissions', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentSubmissions);
;
router.get('/departments', authMiddleware, getDepartments);
router.get('/semesters', authMiddleware, getSemesters);
router.get('/divisions', authMiddleware, getDivisions);
router.get('/batches/:depID/:sem', authMiddleware, getBatches);

export default router;