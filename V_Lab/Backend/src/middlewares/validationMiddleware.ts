import { type TSchema } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Request, Response, NextFunction } from 'express';
import * as schemas from 'src/schemas';

export function validateRequestBody<T extends TSchema>(schema: T) {
    const check = TypeCompiler.Compile(schema);
    return (req: Request, res: Response, next: NextFunction) => {
        const { body } = req;
        if (check.Check(body)) {
            next();
        } else {
            res.status(400).json({ error: 'Invalid request body', details: check.Errors(body) });
        }
    };
}

export function validateResponseData<T extends TSchema>(schema: T) {
    const check = TypeCompiler.Compile(schema);
    return (req: Request, res: Response, next: NextFunction) => {
        const originalJson = res.json;
        res.json = function (data) {
            if (check.Check(data)) {
                return originalJson.call(this, data);
            } else {
                console.error('Invalid response data', data, check.Errors(data));
                return res.status(500).json({ error: 'Internal server error' });
            }
        };
        next();
    };
}

// User
export const validateUserInsert = validateRequestBody(schemas.insertUserSchema);
export const validateUserUpdate = validateRequestBody(schemas.updateUserSchema);
export const validateUserSelect = validateResponseData(schemas.selectUserSchema);

// Department
export const validateDepartmentInsert = validateRequestBody(schemas.insertDepartmentSchema);
export const validateDepartmentUpdate = validateRequestBody(schemas.updateDepartmentSchema);
export const validateDepartmentSelect = validateResponseData(schemas.selectDepartmentSchema);

// Batch
export const validateBatchInsert = validateRequestBody(schemas.insertBatchSchema);
export const validateBatchUpdate = validateRequestBody(schemas.updateBatchSchema);
export const validateBatchSelect = validateResponseData(schemas.selectBatchSchema);

// Course
export const validateCourseInsert = validateRequestBody(schemas.insertCourseSchema);
export const validateCourseUpdate = validateRequestBody(schemas.updateCourseSchema);
export const validateCourseSelect = validateResponseData(schemas.selectCourseSchema);

// Practical
export const validatePracticalInsert = validateRequestBody(schemas.insertPracticalSchema);
export const validatePracticalUpdate = validateRequestBody(schemas.updatePracticalSchema);
export const validatePracticalSelect = validateResponseData(schemas.selectPracticalSchema);

// Batch Practical Access
export const validateBatchPracticalAccessInsert = validateRequestBody(schemas.insertBatchPracticalAccessSchema);
export const validateBatchPracticalAccessUpdate = validateRequestBody(schemas.updateBatchPracticalAccessSchema);
export const validateBatchPracticalAccessSelect = validateResponseData(schemas.selectBatchPracticalAccessSchema);

// Student
export const validateStudentInsert = validateRequestBody(schemas.insertStudentSchema);
export const validateStudentUpdate = validateRequestBody(schemas.updateStudentSchema);
export const validateStudentSelect = validateResponseData(schemas.selectStudentSchema);

// Faculty
export const validateFacultyInsert = validateRequestBody(schemas.insertFacultySchema);
export const validateFacultyUpdate = validateRequestBody(schemas.updateFacultySchema);
export const validateFacultySelect = validateResponseData(schemas.selectFacultySchema);

// Programming Language
export const validateProgrammingLanguageInsert = validateRequestBody(schemas.insertProgrammingLanguageSchema);
export const validateProgrammingLanguageUpdate = validateRequestBody(schemas.updateProgrammingLanguageSchema);
export const validateProgrammingLanguageSelect = validateResponseData(schemas.selectProgrammingLanguageSchema);

// Course Faculty
export const validateCourseFacultyInsert = validateRequestBody(schemas.insertCourseFacultySchema);
export const validateCourseFacultyUpdate = validateRequestBody(schemas.updateCourseFacultySchema);
export const validateCourseFacultySelect = validateResponseData(schemas.selectCourseFacultySchema);

// Submission
export const validateSubmissionInsert = validateRequestBody(schemas.insertSubmissionSchema);
export const validateSubmissionUpdate = validateRequestBody(schemas.updateSubmissionSchema);
export const validateSubmissionSelect = validateResponseData(schemas.selectSubmissionSchema);

// Report
export const validateReportInsert = validateRequestBody(schemas.insertReportSchema);
export const validateReportUpdate = validateRequestBody(schemas.updateReportSchema);
export const validateReportSelect = validateResponseData(schemas.selectReportSchema);

// Complex select schemas
export const validateCourseWithFacultySelect = validateResponseData(schemas.selectCourseWithFacultySchema);
export const validatePracticalWithDetailsSelect = validateResponseData(schemas.selectPracticalWithDetailsSchema);
export const validateStudentWithBatchSelect = validateResponseData(schemas.selectStudentWithBatchSchema);