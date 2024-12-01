// import express from 'express';
// import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from 'controllers/departmentController';
// import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

// const router = express.Router();

// router.get('/', getDepartments);
// router.post('/', authMiddleware, roleMiddleware(['Admin']), createDepartment);
// router.put('/:id', authMiddleware, roleMiddleware(['Admin']), updateDepartment);
// router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), deleteDepartment);

// export default router;

import express from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getDepartmentById } from 'controllers/departmentController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

router.get('/', getDepartments);
router.post('/', authMiddleware, roleMiddleware(['Admin']), createDepartment);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), updateDepartment);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), deleteDepartment);
router.get('/:departmentId', getDepartmentById);

export default router;
