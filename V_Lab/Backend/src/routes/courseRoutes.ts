import express from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse, getCoursesBySemesterAndDepartment, getCoursesByDepartment, getCoursesById } from 'controllers/courseController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

router.get('/', getCourses);
router.post('/', authMiddleware, roleMiddleware(['HOD']), createCourse);
router.put('/:id', authMiddleware, roleMiddleware(['HOD']), updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware(['HOD']), deleteCourse);
router.get('/:courseId', getCoursesById);
router.get('/department/:departmentId', getCoursesByDepartment);
router.get('/semester/:semester/department/:departmentId', getCoursesBySemesterAndDepartment);

export default router;