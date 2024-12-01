import express from 'express';
import { getProgrammingLanguages, createProgrammingLanguage, updateProgrammingLanguage, deleteProgrammingLanguage } from 'controllers/programmingLanguageController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

router.get('/', getProgrammingLanguages);
router.post('/', authMiddleware, roleMiddleware(['Admin']), createProgrammingLanguage);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), updateProgrammingLanguage);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), deleteProgrammingLanguage);

export default router;