import { db } from 'config/db';
import { submissions, practicals, students, users, prac_io, prac_language, courses, batch_practical_access, batch, courses_faculty, departments } from '../models/schema';
import { eq, and } from 'drizzle-orm';

import { AppError } from '../utils/errors';
export async function getStudentSubmissions(studentId: number) {
    try {
        const studentSubmissions = await db
            .select({
                submission_id: submissions.submission_id,
                practical_id: submissions.practical_id,
                practical_sr_no: practicals.sr_no,
                practical_name: practicals.practical_name,
                course_name: courses.course_name,
                submission_time: submissions.submission_time,
                status: submissions.status,
                marks: submissions.marks,
            })
            .from(submissions)
            .innerJoin(practicals, eq(submissions.practical_id, practicals.practical_id))
            .innerJoin(courses, eq(practicals.course_id, courses.course_id))
            .where(eq(submissions.student_id, studentId));

        return studentSubmissions;
    } catch (error) {
        console.error('Error in getStudentSubmissions:', error);
        throw new AppError(500, 'Failed to fetch student submissions');
    }
}

export async function getStudentsWithFilters(filters: {
    department?: string;
    semester?: string;
    division?: string;
    batch?: string;
}) {
    try {
        let query = db
            .select({
                student_id: students.student_id,
                name: users.username,
                roll_id: students.roll_id,
                email: users.email,
                semester: batch.semester,
                division: batch.division,
                batch: batch.batch,
                department_name: departments.name,
            })
            .from(students)
            .innerJoin(users, eq(students.student_id, users.user_id))
            .innerJoin(batch, eq(students.batch_id, batch.batch_id))
            .innerJoin(departments, eq(batch.department_id, departments.department_id));

        // Apply filters dynamically based on the incoming request
        if (filters.department) {
            // @ts-ignore
            query = query.where(eq(departments.name, filters.department));
        }
        if (filters.semester) {
            // @ts-ignore
            query = query.where(eq(batch.semester, parseInt(filters.semester)));
        }
        if (filters.division) {
            // @ts-ignore
            query = query.where(eq(batch.division, filters.division));
        }
        if (filters.batch) {
            // @ts-ignore
            query = query.where(eq(batch.batch, filters.batch));
        }

        return await query;
    } catch (error) {
        console.error('Error in getStudentsWithFilters:', error);
        throw new AppError(500, 'Failed to fetch students');
    }
}

export async function getStudentsWithDepartment() {
    return await db.select({
        user_id: users.user_id,
        username: users.username,
        email: users.email,
        department_name: departments.name,
        semester: batch.semester,
        batch: batch.batch,
        roll_id: students.roll_id,
        division: batch.division
    })
        .from(users)
        .innerJoin(students, eq(users.user_id, students.student_id))
        .innerJoin(batch, eq(students.batch_id, batch.batch_id))
        .innerJoin(departments, eq(batch.department_id, departments.department_id))
        .where(eq(users.role, 'Student'));
}


// export async function getStudentsWithFilters(filters: {
//     department?: string;
//     semester?: string;
//     division?: string;
//     batch?: string;
// }) {
//     try {
//         let query = db
//             .select({
//                 student_id: students.student_id,
//                 name: users.username,
//                 roll_id: students.roll_id,
//                 email: users.email,
//                 semester: batch.semester,
//                 division: batch.division,
//                 batch: batch.batch,
//                 department_name: departments.name,
//             })
//             .from(students)
//             .innerJoin(users, eq(students.student_id, users.user_id))
//             .innerJoin(batch, eq(students.batch_id, batch.batch_id))
//             .innerJoin(departments, eq(batch.department_id, departments.department_id));

//         if (filters.department) query = query.where(eq(departments.name, filters.department));
//         if (filters.semester) query = query.where(eq(batch.semester, parseInt(filters.semester)));
//         if (filters.division) query = query.where(eq(batch.division, filters.division));
//         if (filters.batch) query = query.where(eq(batch.batch, filters.batch));

//         return await query;
//     } catch (error) {
//         console.error('Error in getStudentsWithFilters:', error);
//         throw new AppError(500, 'Failed to fetch students');
//     }
// }

export async function getDepartments() {
    try {
        return await db
            .select({
                id: departments.department_id,
                name: departments.name,
            })
            .from(departments);
    } catch (error) {
        console.error('Error in getDepartments:', error);
        throw new AppError(500, 'Failed to fetch departments');
    }
}

export async function getSemesters() {
    try {
        const result = await db
            .select({
                semester: courses.semester,
            })
            .from(courses)
            .groupBy(courses.semester)
            .orderBy(courses.semester);

        return result.map(row => row.semester);
    } catch (error) {
        console.error('Error in getSemesters:', error);
        throw new AppError(500, 'Failed to fetch semesters');
    }
}

export async function getDivisions() {
    try {
        const result = await db
            .select({
                division: batch.division,
            })
            .from(batch)
            .groupBy(batch.division)
            .orderBy(batch.division);

        return result.map(row => row.division);
    } catch (error) {
        console.error('Error in getDivisions:', error);
        throw new AppError(500, 'Failed to fetch divisions');
    }
}

export async function getBatches() {
    try {
        const result = await db
            .select({
                batch: batch.batch,
            })
            .from(batch)
            .groupBy(batch.batch)
            .orderBy(batch.batch);

        return result.map(row => row.batch);
    } catch (error) {
        console.error('Error in getBatches:', error);
        throw new AppError(500, 'Failed to fetch batches');
    }
}


export async function getStudentsByBatch(batchId: number) {
    try {
        const students_ = await db
            .select({
                student_id: students.student_id,
                name: users.username,
                email: users.email,
                roll_id: students.roll_id,
                batch: batch.batch,
                division: batch.division,
                semester: batch.semester
            })
            .from(students)
            .innerJoin(users, eq(users.user_id, students.student_id))
            .innerJoin(batch, eq(batch.batch_id, students.batch_id))
            .where(eq(batch.batch_id, batchId));

        return students_;
    } catch (error) {
        console.error('Error in getStudentsByBatch:', error);
        throw new AppError(500, 'Failed to fetch students by batch');
    }
}

export async function getStudentByRollId(rollId: string) {
    try {
        const student = await db
            .select({
                student_id: students.student_id,
                name: users.username,
                email: users.email,
                roll_id: students.roll_id,
                batch: batch.batch,
                division: batch.division,
                semester: batch.semester
            })
            .from(students)
            .innerJoin(users, eq(users.user_id, students.student_id))
            .innerJoin(batch, eq(batch.batch_id, students.batch_id))
            .where(eq(students.roll_id, rollId))
            .limit(1);

        if (!student.length) {
            throw new AppError(404, 'Student not found');
        }

        return student[0];
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error('Error in getStudentByRollId:', error);
        throw new AppError(500, 'Failed to fetch student');
    }
}

export async function getStudentsByDepartment(departmentId: string) {
    try {
        const students_ = await db
            .select({
                student_id: students.student_id,
                name: users.username,
                email: users.email,
                roll_id: students.roll_id,
                batch: batch.batch,
                division: batch.division,
                semester: batch.semester,
                department_name: departments.name
            })
            .from(students)
            .innerJoin(users, eq(users.user_id, students.student_id))
            .innerJoin(batch, eq(batch.batch_id, students.batch_id))
            .innerJoin(departments, eq(departments.department_id, batch.department_id))
            .where(eq(departments.department_id, parseInt(departmentId)));

        return students_;
    } catch (error) {
        console.error('Error in getStudentsByDepartment:', error);
        throw new AppError(500, 'Failed to fetch students by department');
    }
}

export async function getStudentsByDepartmentAndSemester(departmentId: number, semester: number) {
    try {
        const students_ = await db
            .select({
                student_id: students.student_id,
                name: users.username,
                email: users.email,
                roll_id: students.roll_id,
                batch: batch.batch,
                division: batch.division,
                semester: batch.semester
            })
            .from(students)
            .innerJoin(users, eq(users.user_id, students.student_id))
            .innerJoin(batch, eq(batch.batch_id, students.batch_id))
            .where(
                and(
                    eq(batch.department_id, departmentId),
                    eq(batch.semester, semester)
                )
            );

        return students_;
    } catch (error) {
        console.error('Error in getStudentsByDepartmentAndSemester:', error);
        throw new AppError(500, 'Failed to fetch students');
    }
}

// Helper function to get batches by department and semester
export async function getBatchesByDepartmentAndSemester(departmentId: number, semester: number) {
    try {
        const batches = await db
            .select({
                batch_id: batch.batch_id,
                batch: batch.batch,
                division: batch.division
            })
            .from(batch)
            .where(
                and(
                    eq(batch.department_id, departmentId),
                    eq(batch.semester, semester)
                )
            );

        return batches;
    } catch (error) {
        console.error('Error in getBatchesByDepartmentAndSemester:', error);
        throw new AppError(500, 'Failed to fetch batches');
    }
}