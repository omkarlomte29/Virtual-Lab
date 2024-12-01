import { Request, Response, NextFunction } from 'express';
import * as facultyService from '../services/facultyService';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// Add a new faculty member
export async function addFaculty(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, email, password, department_id, role } = req.body;
        const newFaculty = await facultyService.createFaculty({ username, email, password, department_id, role });
        res.status(201).json(newFaculty);
    } catch (error) {
        console.error('Error in addFaculty:', error);
        next(new AppError(500, 'Failed to create faculty'));
    }
}

// Get faculty by department
export async function getFacultyByDepartment_omkar(req: Request, res: Response, next: NextFunction) {
    try {
        const departmentId = parseInt(req.params.departmentId, 10);
        const faculty = await facultyService.getFacultyByDepartment_omkar(departmentId);
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty by department:', error);
        next(error);
    }
}

export async function getFacultyByDepartment_tanish(req: Request, res: Response, next: NextFunction) {
    try {
        const departmentId = parseInt(req.params.departmentId);
        const faculty = await facultyService.getFacultyByDepartment_tanish(departmentId);
        res.json(faculty);
    } catch (error) {
        next(error);
    }
}

// Get all faculty members
export async function getAllFaculty(req: Request, res: Response, next: NextFunction) {
    try {
        const faculty = await facultyService.getAllFaculty();
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching all faculty:', error);
        next(error);
    }
}

// Get faculty batches
export async function getFacultyBatches(req: Request, res: Response, next: NextFunction) {
    try {
        const facultyId = parseInt(req.params.facultyId, 10);
        const batches = await facultyService.getFacultyBatches(facultyId);
        res.json(batches);
    } catch (error) {
        next(error);
    }
}

// Delete a faculty member
export async function deleteFaculty(req: Request, res: Response, next: NextFunction) {
    try {
        const facultyId = parseInt(req.params.facultyId, 10);

        // Call the service to delete the faculty and the user
        await facultyService.deleteFaculty(facultyId);

        res.status(200).json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        next(new AppError(500, 'Failed to delete faculty'));
    }
}



// // Fetch faculty by department
// export async function getFacultyByDepartment(req: Request, res: Response, next: NextFunction) {
//     try {
//         const faculty = await facultyService.getFacultyByDepartment(parseInt(req.params.departmentId));
//         res.json(faculty);
//     } catch (error) {
//         if (error instanceof AppError) {
//             res.status(error.statusCode).json({ error: error.message });
//         } else {
//             next(error);
//         }
//     }
// }

// // Fetch all faculty
// export async function getAllFaculty(req: Request, res: Response, next: NextFunction) {
//     try {
//         console.log("hi")
//         const faculty = await facultyService.getAllFaculty();
//         console.log(faculty)
//         res.json(faculty);
//     } catch (error) {
//         console.error("Error fetching all faculty:", error); // Log the actual error
//         if (error instanceof AppError) {
//             res.status(error.statusCode).json({ error: error.message });
//         } else {
//             res.status(500).json({ error: "An unexpected error occurred" });
//         }
//     }
// }

// Get faculty details for the profile view (for specific faculty by ID)
export async function getFacultyDetails(req: Request, res: Response, next: NextFunction) {
    try {
        const facultyId = parseInt(req.params.facultyId);
        const facultyDetails = await facultyService.getFacultyDetails(facultyId);
        res.json(facultyDetails);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

// export async function getFacultyBatches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     try {

//         const facultyId = req.user!.user_id;
//         const batches = await facultyService.getFacultyBatches(facultyId);
//         res.json(batches);
//     } catch (error) {
//         next(error);
//     }
// }