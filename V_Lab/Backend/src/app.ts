import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import departmentRoutes from './routes/departmentRoutes';
import batchRoutes from './routes/batchRoutes';
import courseRoutes from './routes/courseRoutes';
import practicalRoutes from './routes/practicalRoutes';
import batchPracticalAccessRoutes from 'routes/batchPracticalAccessRoutes';
import facultyRoutes from './routes/facultyRoutes';
import studentRoutes from './routes/studentRoutes';
import programmingLanguageRoutes from './routes/programmingLanguageRoutes';
import submissionRoutes from './routes/submissionRoutes';
import courseFacultyRoutes from './routes/courseFacultyRoutes';
import { errorHandler } from 'middlewares/errorMiddleware';
import logger from './utils/logger';
dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get("/health", (req, res) => {
    logger.info('Health check endpoint accessed');
    res.json({
        message: "Working as expected🦄🌈✨👋🌎🌍🌏✨🌈🦄",
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/practicals', practicalRoutes);
app.use('/api/batch-practical-access', batchPracticalAccessRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/programming-languages', programmingLanguageRoutes);
app.use('/api/course-faculty', courseFacultyRoutes);
app.use('/api/submissions', submissionRoutes);

app.use(errorHandler);

// app.use('/api/redis', redisRoutes);

export default app;