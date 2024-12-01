import { Request, Response, NextFunction } from 'express';
import * as practicalService from '../services/practicalService';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export async function createPractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        console.log(req.body)
        const practical = await practicalService.createPractical(req.body);

        res.status(201).json(practical);
    } catch (error) {
        next(error);
    }
}



// export async function updatePractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     try {
//         const practical = await practicalService.updatePractical(parseInt(req.params.id), req.body);
//         res.json(practical);
//     } catch (error) {
//         next(error);
//     }
// }

export async function deletePractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        await practicalService.deletePractical(parseInt(req.params.id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}


export async function getPracticals(req: Request, res: Response, next: NextFunction) {
    try {
        const practicals = await practicalService.getPracticals();
        res.json(practicals);
    } catch (error) {
        next(error);
    }
}

// export async function getPracticalById(req: Request, res: Response, next: NextFunction) {
//     try {
//         const practical = await practicalService.getPracticalById(parseInt(req.params.id));
//         if (!practical) {
//             throw new AppError(404, 'Practical not found');
//         }
//         res.json(practical);
//     } catch (error) {
//         next(error);
//     }
// }

export async function getPracticalByCourse(req: Request, res: Response, next: NextFunction) {
    try {
        const practicals = await practicalService.getPracticalByCourse(parseInt(req.params.courseId));
        res.json(practicals);
    } catch (error) {
        next(error);
    }
}

export async function getPracticalById(req: Request, res: Response, next: NextFunction) {
    try {
        const practical = await practicalService.getPracticalById(parseInt(req.params.id));
        if (!practical) {
            throw new AppError(404, 'Practical not found');
        }
        res.json(practical);
    } catch (error) {
        next(error);
    }
}

export async function getPracticalLanguages(req: Request, res: Response, next: NextFunction) {
    try {
        const practicalId = parseInt(req.params.id);
        if (isNaN(practicalId)) {
            throw new AppError(400, 'Invalid practical ID');
        }

        const languages = await practicalService.getPracticalLanguages(practicalId);

        if (!languages) {
            throw new AppError(404, 'No languages found for the specified practical');
        }

        res.json(languages);
    } catch (error) {
        next(error);
    }
}

// export async function updatePractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     try {
//         const practical = await practicalService.updatePractical(parseInt(req.params.id), req.body);
//         res.json(practical);
//     } catch (error) {
//         next(error);
//     }
// }


interface PracticalUpdateData {
    sr_no: number;
    practical_name: string;
    description: string;
    pdf_url?: string;
    course_id: number;
    prac_io: Array<{
        input: string;
        output: string;
        isPublic: boolean;
    }>;
    prac_language: Array<{
        programming_language_id: number;
    }>;
}

function validatePracticalData(data: any): PracticalUpdateData {
    const errors: string[] = [];

    // Validate required fields
    if (!data.sr_no || isNaN(Number(data.sr_no))) {
        errors.push('Valid sr_no is required');
    }
    if (!data.practical_name || typeof data.practical_name !== 'string') {
        errors.push('Practical name is required');
    }
    if (!data.description || typeof data.description !== 'string') {
        errors.push('Description is required');
    }
    if (!data.course_id || isNaN(Number(data.course_id))) {
        errors.push('Valid course_id is required');
    }

    // Validate test cases
    if (!Array.isArray(data.prac_io)) {
        errors.push('Test cases must be an array');
    } else {
        // @ts-ignore
        data.prac_io.forEach((io, index) => {
            if (typeof io.input !== 'string') {
                errors.push(`Test case ${index + 1}: Input must be a string`);
            }
            if (typeof io.output !== 'string') {
                errors.push(`Test case ${index + 1}: Output must be a string`);
            }
            if (typeof io.isPublic !== 'boolean') {
                errors.push(`Test case ${index + 1}: isPublic must be a boolean`);
            }
        });
    }

    // Validate programming languages
    if (!Array.isArray(data.prac_language)) {
        errors.push('Programming languages must be an array');
    } else {
        // @ts-ignore
        data.prac_language.forEach((lang, index) => {
            if (!lang.programming_language_id || isNaN(Number(lang.programming_language_id))) {
                errors.push(`Programming language ${index + 1}: Valid programming_language_id is required`);
            }
        });
    }

    if (errors.length > 0) {
        throw new AppError(400, `Validation failed: ${errors.join(', ')}`);
    }

    return {
        ...data,
        sr_no: Number(data.sr_no),
        course_id: Number(data.course_id),
        // @ts-ignore
        prac_language: data.prac_language.map(lang => ({
            programming_language_id: Number(lang.programming_language_id)
        }))
    };
}

export async function updatePractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const practicalId = parseInt(req.params.id);
        if (isNaN(practicalId)) {
            throw new AppError(400, 'Invalid practical ID');
        }

        // Validate the request body
        const validatedData = validatePracticalData(req.body);

        // Check if practical exists
        const existingPractical = await practicalService.getPracticalById(practicalId);
        if (!existingPractical) {
            throw new AppError(404, 'Practical not found');
        }

        // Check if user has permission to update this practical
        if (req.user.role === 'Faculty') {
            const hasPermission = await practicalService.checkFacultyPracticalPermission(
                req.user.user_id,
                // @ts-ignore
                existingPractical.course_id
            );
            if (!hasPermission) {
                throw new AppError(403, 'You do not have permission to update this practical');
            }
        }

        // Perform the update
        const updatedPractical = await practicalService.updatePractical(practicalId, validatedData);

        res.json({
            status: 'success',
            data: updatedPractical
        });
    } catch (error) {
        next(error);
    }
}

// export async function getPracticalById(req: Request, res: Response, next: NextFunction) {
//     try {
//         const practicalId = parseInt(req.params.id);
//         if (isNaN(practicalId)) {
//             throw new AppError(400, 'Invalid practical ID');
//         }

//         const practical = await practicalService.getPracticalById(practicalId);
//         if (!practical) {
//             throw new AppError(404, 'Practical not found');
//         }
        
//         // Include all related data
//         const practicalWithDetails = {
//             ...practical,
//             prac_io: await practicalService.getPracticalTestCases(practical.practical_id),
//             prac_language: await practicalService.getPracticalLanguages(practical.practical_id)
//         };
        
//         res.json(practicalWithDetails);
//     } catch (error) {
//         next(error);
//     }
// }