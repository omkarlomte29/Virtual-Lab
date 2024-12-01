import express from 'express';
import { assignCourseToFaculty, updateCourseFacultyAssignment, deleteCourseFacultyAssignment, getFacultyByCourse, getCoursesByFaculty } from 'controllers/courseFacultyController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['HOD']), assignCourseToFaculty);
router.put('/:courseId/:batchId', authMiddleware, roleMiddleware(['HOD']), updateCourseFacultyAssignment);
router.delete('/:courseId/:batchId', authMiddleware, roleMiddleware(['HOD']), deleteCourseFacultyAssignment);
router.get('/:courseId', getFacultyByCourse);
router.get('/faculty/:facultyId/courses', getCoursesByFaculty);

export default router;