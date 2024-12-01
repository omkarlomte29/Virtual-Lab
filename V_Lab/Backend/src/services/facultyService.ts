import { db } from 'config/db';
import { users, faculty, courses_faculty, batch, departments } from 'models/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../utils/errors';

// Create a new faculty member
export async function createFaculty({
    username,
    email,
    password,
    department_id,
    role,
}: {
    username: string;
    email: string;
    password: string;
    department_id: number;
    role: string;
}) {
    try {
        // @ts-ignore
        const newUser = await db.insert(users).values({
            username,
            email,
            password,
            role,
        });

        const insertedUser = await db
            .select({ user_id: users.user_id })
            .from(users)
            .where(eq(users.username, username));

        const userId = insertedUser[0]?.user_id;

        if (!userId) {
            throw new AppError(500, 'Failed to retrieve new user ID');
        }

        await db.insert(faculty).values({
            faculty_id: userId,
            department_id,
        });

        return { user_id: userId, username, email, role, department_id };
    } catch (error) {
        console.error('Error in createFaculty:', error);
        throw new AppError(500, 'Failed to create faculty');
    }
}

// // Fetch faculty by department (if departmentId is passed)
// export async function getFacultyByDepartment(departmentId: number) {
//     return await db.select({
//         user_id: faculty.faculty_id,
//         department_id: faculty.department_id,
//         username: users.username,
//         email: users.email
//     }).from(users)
//         .innerJoin(faculty, eq(users.user_id, faculty.faculty_id))
//         .where(eq(faculty.department_id, departmentId));
// }
// // Fetch all faculty members
// export async function getAllFaculty() {
//     try {
//         const facultyMembers = await db
//             .select({
//                 faculty_id: faculty.faculty_id,
//                 department_id: faculty.department_id,
//                 username: users.username,
//                 email: users.email,
//             })
//             .from(users)
//             .innerJoin(faculty, eq(users.user_id, faculty.faculty_id));

// //         if (!facultyMembers.length) {
// //             throw new AppError(404, 'No faculty members found');
// //         }

//         return facultyMembers;
//     } catch (error) {
//         console.error("Error fetching all faculty:", error);
//         throw new AppError(500, 'Failed to fetch faculty');
//     }
// }

// Fetch faculty batches
export async function getFacultyBatches(facultyId: number) {
    try {
        const facultyBatches = await db
            .select({
                batch_id: batch.batch_id,
                division: batch.division,
                batch_name: batch.batch,
            })
            .from(batch)
            .innerJoin(courses_faculty, eq(batch.batch_id, courses_faculty.batch_id))
            .where(eq(courses_faculty.faculty_id, facultyId));

        return facultyBatches;
    } catch (error: any) {
        console.error('Error fetching faculty batches:', error);
        throw new AppError(500, `Failed to fetch faculty batches: ${error.message}`);
    }
}

// Fetch all faculty members
export async function getAllFaculty() {
    try {
        // Fetch all faculty members
        const facultyMembers = await db
            .select({
                user_id: faculty.faculty_id,
                department_id: faculty.department_id,
                username: users.username,
                email: users.email,
                role: users.role,
                department: departments.name,
            })
            .from(faculty)
            .innerJoin(users, eq(faculty.faculty_id, users.user_id))
            .innerJoin(departments, eq(faculty.department_id, departments.department_id)); // Join with the departments table

        // Debugging: Log the faculty members
        console.log("Faculty Members:", facultyMembers);

        // Check if any faculty members were found
        if (!facultyMembers.length) {
            throw new AppError(404, 'No faculty members found');
        }

        return facultyMembers;
    } catch (error) {
        console.error("Error in getAllFaculty:", error);
        throw error;
    }
}
// Fetch faculty by department
export async function getFacultyByDepartment_omkar(departmentId: number) {
    try {
        return await db
            .select({
                faculty_id: faculty.faculty_id,
                department_id: faculty.department_id,
                username: users.username,
                email: users.email,
                role: users.role,
                department: departments.name
            })
            .from(users)
            .innerJoin(faculty, eq(users.user_id, faculty.faculty_id))
            .innerJoin(departments, eq(faculty.department_id, departments.department_id))
            .where(eq(faculty.department_id, departmentId));
    } catch (error) {
        console.error('Error fetching faculty by department:', error);
        throw new AppError(500, 'Failed to fetch faculty by department');
    }
}


export async function getFacultyByDepartment_tanish(departmentId: number) {
    try {
        const facultyMembers = await db
            .select({
                user_id: faculty.faculty_id,
                department_id: faculty.department_id,
                username: users.username,
                email: users.email,
            })
            .from(faculty)
            .innerJoin(users, eq(faculty.faculty_id, users.user_id))
            .where(eq(faculty.department_id, departmentId));

        if (!facultyMembers.length) {
            throw new AppError(404, 'No faculty members found in this department');
        }

        return facultyMembers;
    } catch (error) {
        console.error("Error in getFacultyByDepartment:", error);
        throw error;
    }
}

// Delete a faculty and corresponding user
export async function deleteFaculty(facultyId: number) {
    try {
        // First, retrieve the faculty record to get the faculty_id, which is also the user_id
        const facultyRecord = await db
            .select({
                user_id: faculty.faculty_id,  // user_id in `users` table is faculty_id in `faculty`
            })
            .from(faculty)
            .where(eq(faculty.faculty_id, facultyId));

        const userId = facultyRecord[0]?.user_id;

        if (!userId) {
            throw new AppError(404, 'Faculty not found');
        }

        // Delete the faculty record
        await db.delete(faculty).where(eq(faculty.faculty_id, facultyId));

        // Delete the user record from `users` table
        await db.delete(users).where(eq(users.user_id, userId));

    } catch (error) {
        console.error('Error deleting faculty:', error);
        throw new AppError(500, 'Failed to delete faculty');
    }
}


export async function getFacultyDetails(facultyId: number) {
    const facultyDetails = await db
        .select({
            user_id: users.user_id,
            username: users.username,
            email: users.email,
            department_id: faculty.department_id,
            faculty_id: faculty.faculty_id,
        })
        .from(users)
        .innerJoin(faculty, eq(users.user_id, faculty.faculty_id))  // Ensure user_id matches faculty_id
        .where(eq(faculty.faculty_id, facultyId))
        .limit(1);

    if (facultyDetails.length === 0) {
        throw new AppError(404, 'Faculty not found');
    }

    return facultyDetails[0];
}