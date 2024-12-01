import { db } from 'config/db';
import { users, faculty, students } from 'models/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export async function getUserById(userId: number) {
    const user = await db.select().from(users).where(eq(users.user_id, userId)).limit(1);

    if (user.length === 0) {
        throw new AppError(404, 'User not found');
    }

    const userData = user[0];

    // Check if the user is a faculty member
    if (userData.role === 'Faculty' || userData.role === 'HOD') {
        const facultyData = await db.select().from(faculty).where(eq(faculty.faculty_id, userId)).limit(1);
        if (facultyData.length > 0) {
            return { ...userData, ...facultyData[0] };
        }
    }

    // Check if the user is a student
    if (userData.role === 'Student') {
        const studentData = await db.select().from(students).where(eq(students.student_id, userId)).limit(1);
        if (studentData.length > 0) {
            return { ...userData, ...studentData[0] };
        }
    }

    return userData;
}

export async function updateUser(userId: number, userData: Partial<typeof users.$inferInsert>) {
    await db.update(users)
        .set(userData)
        .where(eq(users.user_id, userId));

    const updatedUser = await db.select().from(users).where(eq(users.user_id, userId)).limit(1);

    if (!updatedUser[0]) {
        throw new AppError(404, 'User not found');
    }

    return updatedUser[0];
}

export async function deleteUser(userId: number) {
    const result = await db.delete(users)
        .where(eq(users.user_id, userId));

    if (result[0].affectedRows === 0) {
        throw new AppError(404, 'User not found');
    }
}

export async function getAllUsers() {
    return await db.select().from(users);
}