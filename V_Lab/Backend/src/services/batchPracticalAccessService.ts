import { db } from 'config/db';
import { batch_practical_access, batch, courses_faculty } from 'models/schema';
import { eq, and } from 'drizzle-orm';

// export async function createBatchPracticalAccess(accessData: any) {
//     const result = await db.insert(batch_practical_access).values(accessData);
//     return await db.select().from(batch_practical_access)
//         .where(eq(batch_practical_access.batch_practical_access_id, result[0].insertId))
//         .limit(1);
// }

// export async function deleteBatchPracticalAccess(accessId: number) {
//     const result = await db.delete(batch_practical_access)
//         .where(eq(batch_practical_access.batch_practical_access_id, accessId));
//     if (result[0].affectedRows === 0) {
//         throw new Error('Batch Practical Access not found');
//     }
// }

// export async function updateBatchPracticalAccess(accessId: number, accessData: any) {
//     const updateResult = await db.update(batch_practical_access)
//         .set(accessData)
//         .where(eq(batch_practical_access.batch_practical_access_id, accessId));
//     if (updateResult[0].affectedRows === 0) {
//         throw new Error('Batch Practical Access not found');
//     }
//     return await getBatchPracticalAccess(accessId);
// }

// export async function getBatchPracticalAccess(practicalId: number, facultyId: number) {
//     const result = await db
//         .select({
//             batch_practical_access_id: batch_practical_access.batch_practical_access_id,
//             batch_id: batch.batch_id,
//             division: batch.division,
//             batch_name: batch.batch,
//             lock: batch_practical_access.lock,
//             deadline: batch_practical_access.deadline,
//         })
//         .from(courses_faculty)
//         .leftJoin(batch, eq(courses_faculty.batch_id, batch.batch_id))
//         .leftJoin(
//             batch_practical_access,
//             and(
//                 eq(batch_practical_access.batch_id, batch.batch_id),
//                 eq(batch_practical_access.practical_id, practicalId)
//             )
//         )
//         .where(eq(courses_faculty.faculty_id, facultyId));

//     return result;
// }

export async function createOrUpdateBatchPracticalAccess(data: {
    practical_id: number;
    batch_id: number;
    lock: boolean;
    deadline: Date;
}) {
    const existingAccess = await db
        .select()
        .from(batch_practical_access)
        .where(
            and(
                eq(batch_practical_access.practical_id, data.practical_id),
                eq(batch_practical_access.batch_id, data.batch_id)
            )
        )
        .limit(1);

    if (existingAccess.length > 0) {
        // Update existing access
        return await db
            .update(batch_practical_access)
            .set({ lock: data.lock, deadline: data.deadline })
            .where(eq(batch_practical_access.batch_practical_access_id, existingAccess[0].batch_practical_access_id));
    } else {
        // Create new access
        return await db.insert(batch_practical_access).values(data);
    }
}
export async function getBatchPracticalAccess(practicalId: number, courseId: number, facultyId: number) {
    const result = await db
        .select({
            batch_practical_access_id: batch_practical_access.batch_practical_access_id,
            batch_id: batch.batch_id,
            division: batch.division,
            batch_name: batch.batch,
            lock: batch_practical_access.lock,
            deadline: batch_practical_access.deadline,
        })
        .from(courses_faculty)
        .innerJoin(batch, eq(courses_faculty.batch_id, batch.batch_id))
        .leftJoin(
            batch_practical_access,
            and(
                eq(batch_practical_access.batch_id, batch.batch_id),
                eq(batch_practical_access.practical_id, practicalId)
            )
        )
        .where(
            and(
                eq(courses_faculty.faculty_id, facultyId),
                eq(courses_faculty.course_id, courseId),
                eq(batch.batch_id, courses_faculty.batch_id)
            )
        )
        .orderBy(batch.division, batch.batch);

    return result;
}