// import { db } from '../config/db';
// import { departments } from '../models/schema';
// import { eq } from 'drizzle-orm';
// import { AppError } from '../utils/errors';

// export async function getAllDepartments() {
//     return await db.select().from(departments);
// }

// export async function createDepartment(departmentData: any) {
//     const result = await db.insert(departments).values(departmentData);
//     return await db.select().from(departments).where(eq(departments.department_id, result[0].insertId)).limit(1);
// }

// export async function updateDepartment(id: number, departmentData: any) {
//     await db.update(departments)
//         .set(departmentData)
//         .where(eq(departments.department_id, id));

//     const updatedDepartment = await db.select().from(departments).where(eq(departments.department_id, id)).limit(1);

//     if (!updatedDepartment[0]) {
//         throw new AppError(404, 'Department not found');
//     }

//     return updatedDepartment[0];
// }

// export async function deleteDepartment(id: number) {
//     const result = await db.delete(departments)
//         .where(eq(departments.department_id, id));

//     if (result[0].affectedRows === 0) {
//         throw new AppError(404, 'Department not found');
//     }
// }   

import { db } from '../config/db';
import { departments } from '../models/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export async function getAllDepartments() {
    return await db.select().from(departments);
}

export async function createDepartment(departmentData: { name: string }) {
    // @ts-ignore
    const result = await db.insert(departments).values(departmentData.name);
    return await db.select().from(departments).where(eq(departments.department_id, result[0].insertId)).limit(1);
}

export async function updateDepartment(id: number, departmentData: { name: string }) {
    const department = await db.select().from(departments).where(eq(departments.department_id, id)).limit(1);

    if (!department[0]) {
        throw new AppError(404, 'Department not found');
    }

    await db.update(departments)
        // @ts-ignore
        .set(departmentData.name)
        .where(eq(departments.department_id, id));

    return await db.select().from(departments).where(eq(departments.department_id, id)).limit(1);
}

export async function deleteDepartment(id: number) {
    const department = await db.select().from(departments).where(eq(departments.department_id, id)).limit(1);

    if (!department[0]) {
        throw new AppError(404, 'Department not found');
    }

    await db.delete(departments).where(eq(departments.department_id, id));
}

export async function getDepartmentById(departmentId: number) {
    return await db.select()
        .from(departments)
        .where(
            eq(departments.department_id, departmentId)
        )
        .limit(1);
}
