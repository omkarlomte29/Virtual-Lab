import { Request, Response, NextFunction } from 'express';
import * as studentService from 'services/studentService';
import * as submissionService from 'services/submissionService';
import { AppError } from '../../src/utils/errors';

export async function getStudentsByDepartment(req: Request, res: Response, next: NextFunction) {
    try {
        const departmentId = req.params.department;
        const students = await studentService.getStudentsByDepartment(departmentId);  // Assuming this exists in services
        res.json(students);
    } catch (error) {
        next(error);
    }
}

export async function getStudentsByBatch(req: Request, res: Response, next: NextFunction) {
    try {
        const students = await studentService.getStudentsByBatch(parseInt(req.params.batchId));
        res.json(students);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}
export async function getStudentSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
        const { studentId } = req.params;
        const submissions = await submissionService.getStudentSubmissions(parseInt(studentId));
        res.json(submissions);
    } catch (error) {
        next(error);
    }
}
export async function getStudentByRollId(req: Request, res: Response, next: NextFunction) {
    try {
        const student = await studentService.getStudentByRollId(req.params.rollId);
        res.json(student);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function getStudentsByDepartmentAndSemester(req: Request, res: Response, next: NextFunction) {
    try {
        const students = await studentService.getStudentsByDepartmentAndSemester(parseInt(req.params.departmentId), parseInt(req.params.semester));
        res.json(students);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function getStudentsWithFilters(req: Request, res: Response, next: NextFunction) {
    try {
        const { department, semester, division, batch } = req.query;

        // Call the service to get students with these filters
        const students = await studentService.getStudentsWithFilters({
            department: department as string,
            semester: semester as string,
            division: division as string,
            batch: batch as string,
        });

        res.json(students);
    } catch (error) {
        next(error instanceof AppError ? res.status(error.statusCode).json({ error: error.message }) : next(error));
    }
}

export async function getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
        const departments = await studentService.getDepartments();
        res.json(departments);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function getSemesters(req: Request, res: Response, next: NextFunction) {
    try {
        const semesters = await studentService.getSemesters();
        res.json(semesters);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function getDivisions(req: Request, res: Response, next: NextFunction) {
    try {
        const divisions = await studentService.getDivisions();
        res.json(divisions);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function getBatches(req: Request, res: Response, next: NextFunction) {
    try {
        const batches = await studentService.getBatchesByDepartmentAndSemester(parseInt(req.params.depID), parseInt(req.params.sem));
        res.json(batches);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}