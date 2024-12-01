import { db } from 'config/db';
import { users, students, faculty, batch } from 'models/schema';
import { generateToken } from 'utils/jwtUtils';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { AppError } from 'utils/errors';
import logger from '../utils/logger';

// export async function registerUser(userData: any) {
//     logger.info('Attempting to register new user', { email: userData.email, role: userData.role });

//     const hashedPassword = await bcrypt.hash(userData.password, 10);

//     const result = await db.insert(users).values({
//         username: userData.username,
//         email: userData.email,
//         password: hashedPassword,
//         role: userData.role,
//     });

//     const newUser = await db.select().from(users).where(eq(users.user_id, result[0].insertId)).limit(1);

//     if (userData.role === 'Student') {
//         await db.insert(students).values({
//             student_id: result[0].insertId,
//             batch_id: userData.batch_id,
//             roll_id: userData.roll_id,
//         });
//     } else if (userData.role === 'Faculty' || userData.role === 'HOD' || userData.role === 'Admin') {
//         await db.insert(faculty).values({
//             faculty_id: result[0].insertId,
//             department_id: userData.department_id,
//         });
//     }

//     const token = generateToken({ id: result[0].insertId, role: userData.role });

//     logger.info('User registered successfully', { userId: result[0].insertId, role: userData.role });
//     return { user: { ...newUser[0], department_id: userData.department_id }, token };
// }

export async function registerUser(userData: any) {
    logger.info('Attempting to register new user', { email: userData.email, role: userData.role });

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insert new user into users table
    const result = await db.insert(users).values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
    });

    // Retrieve the newly created user
    const newUser = await db.select().from(users).where(eq(users.user_id, result[0].insertId)).limit(1);

    // Insert into either students or faculty table based on the role
    let additionalDetails = {};

    if (userData.role === 'Student') {
        await db.insert(students).values({
            student_id: result[0].insertId,
            batch_id: userData.batch_id,
            roll_id: userData.roll_id,
        });

        const studentDetails = await db.select({
            batch_id: students.batch_id,
            roll_id: students.roll_id,
            department_id: batch.department_id,
            semester: batch.semester,
            division: batch.division,
            batch: batch.batch,
        }).from(students)
            .innerJoin(batch, eq(students.batch_id, batch.batch_id))
            .where(eq(students.student_id, result[0].insertId));

        additionalDetails = studentDetails[0];
    } else if (userData.role === 'Faculty' || userData.role === 'HOD' || userData.role === 'Admin') {
        await db.insert(faculty).values({
            faculty_id: result[0].insertId,
            department_id: userData.department_id,
        });

        const facultyDetails = await db.select({
            department_id: faculty.department_id,
        }).from(faculty)
            .where(eq(faculty.faculty_id, result[0].insertId));

        additionalDetails = facultyDetails[0];
    }

    // Generate a JWT token for the newly registered user
    const token = generateToken({ id: result[0].insertId, role: userData.role });

    // Log success and return the combined user and token
    logger.info('User registered successfully', { userId: result[0].insertId, role: userData.role });

    return {
        token,
        user: { ...newUser[0], ...additionalDetails }
    };
}

export async function loginUser(loginData: { email: string; password: string }) {
    logger.info('User login attempt', { email: loginData.email });

    const user = await db.select().from(users).where(eq(users.email, loginData.email)).limit(1);

    if (user.length === 0) {
        logger.warn('Login failed: User not found', { email: loginData.email });
        throw new AppError(404, 'User not found');
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user[0].password);

    if (!isPasswordValid) {
        logger.warn('Login failed: Invalid password', { email: loginData.email });
        throw new AppError(401, 'Invalid credentials');
    }

    const token = generateToken({ id: user[0].user_id, role: user[0].role });

    let additionalDetails = {};

    if (user[0].role === 'Student') {
        const studentDetails = await db.select({
            batch_id: students.batch_id,
            roll_id: students.roll_id,
            department_id: batch.department_id,
            semester: batch.semester,
            division: batch.division,
            batch: batch.batch,
        }).from(students)
            .innerJoin(batch, eq(students.batch_id, batch.batch_id))
            .where(eq(students.student_id, user[0].user_id));

        // if (studentDetails.length > 0) {
        additionalDetails = studentDetails[0];
        // }
    } else if (user[0].role === 'Faculty' || user[0].role === 'HOD') {
        const facultyDetails = await db.select({
            department_id: faculty.department_id,
        }).from(faculty)
            .where(eq(faculty.faculty_id, user[0].user_id));

        // if (facultyDetails.length > 0) {
        additionalDetails = facultyDetails[0];
        // }
    }

    logger.info('User logged in successfully', { userId: user[0].user_id, role: user[0].role });
    return { token, user: { ...user[0], ...additionalDetails } };
}