import { Request, Response, NextFunction } from 'express';
import * as submissionService from '../services/submissionService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AppError } from '../../src/utils/errors';
import { practicals, prac_io, prac_language, programming_language, batch_practical_access, submissions } from '../models/schema';
import { eq, and, or, isNull, isNotNull } from 'drizzle-orm';
import { db } from '../config/db';

export async function runCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const result = await submissionService.runCode(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}


export async function getSubmissionsByPractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { practicalId } = req.params;
        const { batchId } = req.query;
        const submissions = await submissionService.getSubmissionsByPractical(parseInt(practicalId), parseInt(batchId as string), req.user!.user_id);
        res.json(submissions);
    } catch (error) {
        next(error);
    }
}

export async function getSubmissionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const submission = await submissionService.getSubmissionById(parseInt(req.params.submissionId));
        res.json(submission);
    } catch (error) {
        next(error);
    }
}

export async function updateSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { status, marks } = req.body;
        if (typeof status !== 'string' || typeof marks !== 'number') {
            throw new AppError(400, 'Invalid input');
        }

        const updatedSubmission = await submissionService.updateSubmission(parseInt(req.params.submissionId), { status, marks });
        res.json(updatedSubmission);
    } catch (error) {
        next(error);
    }
}
// export async function getStudentSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     try {
//         const { studentId } = req.params;
//         const submissions = await submissionService.getStudentSubmissions(parseInt(studentId));
//         res.json(submissions);
//     } catch (error) {
//         next(error);
//     }
// }

// export async function getStudentDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     try {
//         const { studentId } = req.params;
//         const studentDetails = await submissionService.getStudentDetails(parseInt(studentId));
//         res.json(studentDetails);
//     } catch (error) {
//         next(error);
//     }
// }


export async function getStudentSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { studentId } = req.params;
        const submissions = await submissionService.getStudentSubmissions(parseInt(studentId));
        res.json(submissions);
    } catch (error) {
        next(error);
    }
}

export async function getStudentDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { studentId } = req.params;
        const studentDetails = await submissionService.getStudentDetails(parseInt(studentId));
        res.json(studentDetails);
    } catch (error) {
        next(error);
    }
}


export async function updateStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { studentId } = req.params;
        const updateData = req.body;
        const updatedStudent = await submissionService.updateStudent(parseInt(studentId), updateData);
        res.json(updatedStudent);
    } catch (error) {
        next(error);
    }
}

export async function deleteStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { studentId } = req.params;
        await submissionService.deleteStudent(parseInt(studentId));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

// export async function submitCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     try {
//         const { practicalId, code, language } = req.body;
//         const studentId = req.user!.user_id;

//         if (!practicalId || !code || !language) {
//             throw new AppError(400, 'Missing required fields');
//         }

//         const result = await submissionService.submitCode({
//             practicalId,
//             studentId,
//             code,
//             language
//         });

//         // res.status(201).json({
//         //     success: true,
//         //     message: 'Code submitted successfully',
//         //     data: result
//         // });
//         res.status(201).json(result);
//     } catch (error) {
//         if (error instanceof AppError) {
//             res.status(error.statusCode).json({
//                 success: false,
//                 message: error.message
//             });
//         } else {
//             next(error);
//         }
//     }
// }


// export async function getSubmissionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     try {
//         const { submissionId } = req.params;
//         const status = await submissionService.getSubmissionStatus(submissionId);
//         res.json(status);
//     } catch (error) {
//         next(error);
//     }
// }

export async function getRunResult(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { token } = req.params;
        const result = await submissionService.getRunResult(token);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function getPreviousSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { practicalId } = req.params;
        const studentId = req.user!.user_id;

        const previousSubmission = await db
            .select({
                submission_id: submissions.submission_id,
                code: submissions.code_submitted,
                status: submissions.status,
                submission_time: submissions.submission_time,
                marks: submissions.marks
            })
            .from(submissions)
            .where(
                and(
                    eq(submissions.practical_id, parseInt(practicalId)),
                    eq(submissions.student_id, studentId)
                )
            )
            // @ts-ignore
            .orderBy(submissions.submission_time, 'desc')
            .limit(1);

        if (previousSubmission.length === 0) {
            return res.status(200).json({
                message: 'No previous submission found'
            });
        }

        res.json(previousSubmission[0]);
    } catch (error) {
        next(error);
    }
}

export async function submitCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { practicalId, code, language, submissionId } = req.body;
        const studentId = req.user!.user_id;

        if (!practicalId || !code || !language) {
            throw new AppError(400, 'Missing required fields');
        }

        // Check for existing accepted submission
        const existingSubmission = await db
            .select()
            .from(submissions)
            .where(
                and(
                    eq(submissions.practical_id, practicalId),
                    eq(submissions.student_id, studentId),
                    eq(submissions.status, 'Accepted')
                )
            )
            .limit(1);

        if (existingSubmission.length > 0) {
            return res.status(200).json({
                alreadySubmitted: true,
                message: 'You have already submitted this practical successfully.',
                status: "Accepted"
            });
        }
        if (submissionId && submissionId !== -1) {
            const result = await submissionService.updateSubmissionCode({
                submissionId,
                code,
                language,
                practicalId,
                studentId
            });
            console.log("asd")
            return res.status(200).json(result);
        }
        const result = await submissionService.submitCode({
            practicalId,
            studentId,
            code,
            language
        });
        console.log("dsa")

        res.status(201).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        } else {
            next(error);
        }
    }
}

export async function getSubmissionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { submissionId } = req.params;
        const status = await submissionService.getSubmissionStatus(submissionId);
        res.json({
            completed: status.completed,
            status: status.status,
            // Don't include detailed test results
        });
    } catch (error) {
        next(error);
    }
}


// Backend service for student practical view
export async function getPracticalWithSubmissionStatus(req: AuthenticatedRequest, res: Response) {
    const courseId = parseInt(req.params.courseId);
    const studentId = req.user!.user_id;

    try {
        const result = await db
            .select({
                practical_id: practicals.practical_id,
                sr_no: practicals.sr_no,
                practical_name: practicals.practical_name,
                course_id: practicals.course_id,
                description: practicals.description,
                pdf_url: practicals.pdf_url,
                status: submissions.status,
                marks: submissions.marks,
                deadline: batch_practical_access.deadline,
                lock: batch_practical_access.lock,
            })
            .from(practicals)
            .leftJoin(
                submissions,
                and(
                    eq(submissions.practical_id, practicals.practical_id),
                    eq(submissions.student_id, studentId)
                )
            )
            .leftJoin(
                batch_practical_access,
                and(
                    eq(batch_practical_access.practical_id, practicals.practical_id),
                    eq(batch_practical_access.batch_id, req.user!.batch_id)
                )
            )
            .where(eq(practicals.course_id, courseId))
            .having(
                or(
                    // Include practicals where:
                    // 1. No batch access record exists (lock is null)
                    // isNull(batch_practical_access.lock),
                    // 2. Batch access exists and practical is not locked
                    eq(batch_practical_access.lock, false),
                    // 3. Student has already made a submission (regardless of lock status)
                    // eq(submissions.status, "Accepted"),
                    isNotNull(submissions.status)
                )
            )
            .orderBy(practicals.sr_no);

        res.json(result);
    } catch (error) {
        console.error('Error in getPracticalWithSubmissionStatus:', error);
        res.status(500).json({
            error: 'Failed to fetch practicals',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

