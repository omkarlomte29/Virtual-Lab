import { db } from 'config/db';
import { programming_language } from 'models/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export async function getProgrammingLanguages() {
    return await db.select({ "programming_language_id": programming_language.programming_language_id, "language_name": programming_language.language_name }).from(programming_language);
}

export async function createProgrammingLanguage(languageData: any) {
    const result = await db.insert(programming_language).values(languageData);
    return await db.select().from(programming_language).where(eq(programming_language.programming_language_id, result[0].insertId)).limit(1);
}

export async function updateProgrammingLanguage(languageId: number, languageData: any) {
    await db.update(programming_language)
        .set(languageData)
        .where(eq(programming_language.programming_language_id, languageId));

    const updatedLanguage = await db.select().from(programming_language).where(eq(programming_language.programming_language_id, languageId)).limit(1);

    if (!updatedLanguage[0]) {
        throw new AppError(404, 'Programming language not found');
    }

    return updatedLanguage[0];
}

export async function deleteProgrammingLanguage(languageId: number) {
    const result = await db.delete(programming_language)
        .where(eq(programming_language.programming_language_id, languageId));

    if (result[0].affectedRows === 0) {
        throw new AppError(404, 'Programming language not found');
    }
}