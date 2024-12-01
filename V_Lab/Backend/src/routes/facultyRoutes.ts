import express from 'express';
import {
    addFaculty,
    getFacultyByDepartment_tanish, getFacultyByDepartment_omkar,
    getAllFaculty,
    getFacultyBatches,
    deleteFaculty, getFacultyDetails,
} from '../controllers/facultyController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Create a new faculty member (Admin/HOD access)
router.post('/', authMiddleware, roleMiddleware(['Admin', 'HOD']), addFaculty);
router.get('/batches', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getFacultyBatches);
router.get('/:facultyId', authMiddleware, getFacultyDetails);


// Get faculty by department
router.get('/department/:departmentId', authMiddleware, getFacultyByDepartment_omkar);
router.get('/department2/:departmentId', authMiddleware, getFacultyByDepartment_tanish);

// Get faculty batches
router.get('/batches/:facultyId', authMiddleware, getFacultyBatches);

// Delete a faculty member (Admin/HOD access)
router.delete('/:facultyId', authMiddleware, roleMiddleware(['Admin', 'HOD']), deleteFaculty);

// Get all faculty members (Admin/HOD access)
router.get('/all', authMiddleware, roleMiddleware(['Admin', 'HOD']), getAllFaculty);

export default router;
