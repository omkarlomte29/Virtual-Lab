// import { Request, Response, NextFunction } from 'express';
// import * as departmentService from '../services/departmentService';
// import { AppError } from '../../src/utils/errors';

// export async function getDepartments(req: Request, res: Response, next: NextFunction) {
//     try {
//         const departments = await departmentService.getAllDepartments();
//         res.json(departments);
//     } catch (error) {
//         next(error);
//     }
// }

// export async function createDepartment(req: Request, res: Response, next: NextFunction) {
//     try {
//         const newDepartment = await departmentService.createDepartment(req.body);
//         res.status(201).json(newDepartment);
//     } catch (error) {
//         next(error);
//     }
// }

// export async function updateDepartment(req: Request, res: Response, next: NextFunction) {
//     try {
//         const updatedDepartment = await departmentService.updateDepartment(parseInt(req.params.id), req.body);
//         res.json(updatedDepartment);
//     } catch (error) {
//         next(error);
//     }
// }

// export async function deleteDepartment(req: Request, res: Response, next: NextFunction) {
//     try {
//         await departmentService.deleteDepartment(parseInt(req.params.id));
//         res.status(204).send();
//     } catch (error) {
//         next(error);
//     }
// }

import { Request, Response, NextFunction } from 'express';
import * as departmentService from '../services/departmentService';
import { AppError } from '../../src/utils/errors';
import { AuthenticatedRequest } from '../../src/middlewares/authMiddleware';

export async function getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
        const departments = await departmentService.getAllDepartments();
        res.json(departments);
    } catch (error) {
        next(error);
    }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
        const { name } = req.body; // Destructure the name field from the body
        console.log("dname",name);
        if (!name) {
            throw new AppError(400, 'Department name is required');
        }
        const newDepartment = await departmentService.createDepartment({ name });
        console.log("new",newDepartment);
        res.status(201).json(newDepartment);
    } catch (error) {
        next(error);
    }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
        const { name } = req.body; // Destructure name from the request body
        const updatedDepartment = await departmentService.updateDepartment(parseInt(req.params.id), { name });
        res.json(updatedDepartment);
    } catch (error) {
        next(error);
    }
}

export async function deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
        await departmentService.deleteDepartment(parseInt(req.params.id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
        const { departmentId } = req.params;
        const department = await departmentService.getDepartmentById(parseInt(departmentId));
        res.json(department);
    } catch (error) {
        next(error);
    }
}
