import { db } from 'config/db';
import { courses_faculty, faculty, courses, batch, users } from 'models/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../utils/errors';

// export async function assignCourseToFaculty(assignmentData: any) {
//     const { course_id, faculty_id, batch_id } = assignmentData;
//     // Check if the faculty exists and belongs to the same department as the course
//     const facultyExists = await db.select().from(faculty).where(eq(faculty.faculty_id, faculty_id)).limit(1);
//     if (facultyExists.length === 0) {
//         throw new AppError(404, 'Faculty not found');
//     }
//     const courseExists = await db.select().from(courses).where(eq(courses.course_id, course_id)).limit(1);
//     if (courseExists.length === 0) {
//         throw new AppError(404, 'Course not found');
//     }
//     if (facultyExists[0].department_id !== courseExists[0].department_id) {
//         throw new AppError(400, 'Faculty and course must belong to the same department');
//     }
//     const result = await db.insert(courses_faculty).values(assignmentData);
//     return await db.select().from(courses_faculty)
//         .where(
//             and(
//                 eq(courses_faculty.course_id, course_id),
//                 eq(courses_faculty.batch_id, batch_id)))
//         .limit(1);
// }

// export async function updateCourseFacultyAssignment(courseId: number, batchId: number, facultyId: number) {
//     const result = await db.update(courses_faculty)
//         .set({ faculty_id: facultyId })
//         .where(and(
//             eq(courses_faculty.course_id, courseId),
//             eq(courses_faculty.batch_id, batchId)
//         ));

//     if (result[0].affectedRows === 0) {
//         throw new AppError(404, 'Assignment not found');
//     }

//     return await db.select().from(courses_faculty)
//         .where(and(
//             eq(courses_faculty.course_id, courseId),
//             eq(courses_faculty.batch_id, batchId)
//         ))
//         .limit(1);
// }

export async function deleteCourseFacultyAssignment(courseId: number, batchId: number) {
    const result = await db.delete(courses_faculty)
        .where(and(
            eq(courses_faculty.course_id, courseId),
            eq(courses_faculty.batch_id, batchId)
        ));
    if (result[0].affectedRows === 0) {
        throw new AppError(404, 'Assignment not found');
    }
}

// export async function getFacultyByCourse(courseId: number) {
//     return await db.select({
//         course_id: courses_faculty.course_id,
//         faculty_id: courses_faculty.faculty_id,
//         batch_id: courses_faculty.batch_id,
//         // faculty_name: users.username,
//         batch_name: batch.batch,
//         division: batch.division
//     })
//         .from(courses_faculty)
//         .innerJoin(faculty, eq(courses_faculty.faculty_id, faculty.faculty_id))
//         .innerJoin(batch, eq(courses_faculty.batch_id, batch.batch_id))
//         .where(eq(courses_faculty.course_id, courseId));
// }

export async function getCoursesByFaculty(facultyId: number) {
    return await db.select().from(courses_faculty)
        .innerJoin(courses, eq(courses_faculty.course_id, courses.course_id))
        .where(eq(courses_faculty.faculty_id, facultyId));
}

export async function assignCourseToFaculty(assignmentData: any) {
    const { course_id, faculty_id, batch_id } = assignmentData;

    try {
        // Check if the faculty exists and belongs to the same department as the course
        const facultyMember = await db
            .select()
            .from(faculty)
            .where(eq(faculty.faculty_id, faculty_id))
            .limit(1);

        const courseDetails = await db
            .select()
            .from(courses)
            .where(eq(courses.course_id, course_id))
            .limit(1);

        if (!facultyMember.length) {
            throw new AppError(404, 'Faculty not found');
        }
        if (!courseDetails.length) {
            throw new AppError(404, 'Course not found');
        }

        // Check if this batch already has a faculty assigned for this course
        const existingAssignment = await db
            .select()
            .from(courses_faculty)
            .where(
                and(
                    eq(courses_faculty.course_id, course_id),
                    eq(courses_faculty.batch_id, batch_id)
                )
            )
            .limit(1);

        if (existingAssignment.length > 0) {
            // Update existing assignment
            const result = await db
                .update(courses_faculty)
                .set({ faculty_id })
                .where(
                    and(
                        eq(courses_faculty.course_id, course_id),
                        eq(courses_faculty.batch_id, batch_id)
                    )
                );

            if (!result[0].affectedRows) {
                throw new AppError(500, 'Failed to update faculty assignment');
            }
        } else {
            // Create new assignment
            await db.insert(courses_faculty).values(assignmentData);
        }

        return await getFacultyAssignment(course_id, batch_id);
    } catch (error) {
        console.error("Error in assignCourseToFaculty:", error);
        throw error;
    }
}

export async function updateCourseFacultyAssignment(
    courseId: number,
    batchId: number,
    facultyId: number
) {
    try {
        const existingAssignment = await getFacultyAssignment(courseId, batchId);

        if (!existingAssignment) {
            // If no existing assignment, create new one
            return await assignCourseToFaculty({
                course_id: courseId,
                faculty_id: facultyId,
                batch_id: batchId
            });
        }

        const result = await db
            .update(courses_faculty)
            .set({ faculty_id: facultyId })
            .where(
                and(
                    eq(courses_faculty.course_id, courseId),
                    eq(courses_faculty.batch_id, batchId)
                )
            );

        if (!result[0].affectedRows) {
            throw new AppError(404, 'Assignment not found');
        }

        return await getFacultyAssignment(courseId, batchId);
    } catch (error) {
        console.error("Error in updateCourseFacultyAssignment:", error);
        throw error;
    }
}

export async function getFacultyByCourse(courseId: number) {
    try {
        return await db
            .select({
                course_id: courses_faculty.course_id,
                faculty_id: courses_faculty.faculty_id,
                batch_id: courses_faculty.batch_id,
                faculty_name: users.username,
                batch_name: batch.batch,
                division: batch.division
            })
            .from(courses_faculty)
            .innerJoin(faculty, eq(courses_faculty.faculty_id, faculty.faculty_id))
            .innerJoin(users, eq(faculty.faculty_id, users.user_id))
            .innerJoin(batch, eq(courses_faculty.batch_id, batch.batch_id))
            .where(eq(courses_faculty.course_id, courseId));
    } catch (error) {
        console.error("Error in getFacultyByCourse:", error);
        throw error;
    }
}

async function getFacultyAssignment(courseId: number, batchId: number) {
    try {
        const assignment = await db
            .select()
            .from(courses_faculty)
            .where(
                and(
                    eq(courses_faculty.course_id, courseId),
                    eq(courses_faculty.batch_id, batchId)
                )
            )
            .limit(1);

        return assignment[0];
    } catch (error) {
        console.error("Error in getFacultyAssignment:", error);
        throw error;
    }
}