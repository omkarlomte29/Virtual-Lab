import { Request, Response, NextFunction } from 'express';
import * as courseService from '../services/courseService';
import { AppError } from '../../src/utils/errors';
import { AuthenticatedRequest } from '../../src/middlewares/authMiddleware';

export async function getCourses(req: Request, res: Response, next: NextFunction) {
    try {
        const courses = await courseService.getAllCourses();
        res.json(courses);
    } catch (error) {
        next(error);
    }
}

export async function createCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        // const hodDepartmentId = req.user.faculty.department_id;
        const newCourse = await courseService.createCourse(req.body);
        res.status(201).json(newCourse);
    } catch (error) {
        next(error);
    }
}

export async function updateCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        // const hodDepartmentId = req.user.faculty.department_id;
        const updatedCourse = await courseService.updateCourse(parseInt(req.params.id), req.body);
        res.json(updatedCourse);
    } catch (error) {
        next(error);
    }
}

export async function deleteCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        // const hodDepartmentId = req.user.faculty.department_id;
        await courseService.deleteCourse(parseInt(req.params.id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function getCoursesBySemesterAndDepartment(req: Request, res: Response, next: NextFunction) {
    try {
        const { semester, departmentId } = req.params;
        const courses = await courseService.getCoursesBySemesterAndDepartment(parseInt(semester), parseInt(departmentId));
        res.json(courses);
    } catch (error) {
        next(error);
    }
}

export async function getCoursesByDepartment(req: Request, res: Response, next: NextFunction) {
    try {
        const { departmentId } = req.params;
        const courses = await courseService.getCoursesByDepartment(parseInt(departmentId));
        res.json(courses);
    } catch (error) {
        next(error);
    }
}

export async function getCoursesById(req: Request, res: Response, next: NextFunction) {
    try {
        const { courseId } = req.params;
        const courses = await courseService.getCoursesById(parseInt(courseId));
        res.json(courses);
    } catch (error) {
        next(error);
    }
}