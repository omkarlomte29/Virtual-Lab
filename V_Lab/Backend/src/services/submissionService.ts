import { db } from '../config/db';
import { submissions, practicals, students, users, prac_io, prac_language, courses, batch_practical_access, batch, courses_faculty } from '../models/schema';
import { eq, and, gt } from 'drizzle-orm';
import { AppError } from '../utils/errors';
import axios from 'axios';
import redis from '../config/redis';
// import { createClient } from 'redis';

// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6380');
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
const SUBMISSION_TIMEOUT = 30000; // 30 seconds
const RESULTS_EXPIRY = 3600; // 1 hour in seconds
const SUBMISSION_RATE_LIMIT = 3; // 30 seconds between submissions
const RUN_RATE_LIMIT = 1; // 15 seconds between code runs
const SUBMISSION_BATCH_SIZE = 5; // Process submissions in batches
const BATCH_SIZE = 5; // Process submissions in batches
const MAX_POLL_ATTEMPTS = 6; // Maximum number of polling attempts
const POLL_INTERVAL = 5000; // 5 seconds between polls


interface SubmissionResult {
    token: string;
    input: string;
    expectedOutput: string;
    status?: string;
    actualOutput?: string;
}

interface SubmissionResult {
    token: string;
    input: string;
    expectedOutput: string;
    status?: string;
    actualOutput?: string;
}

// export async function createSubmission(submissionData: any) {
//     try {
//         // Check existing submission
//         const existingSubmission = await checkExistingSubmission(submissionData);
//         if (existingSubmission) {
//             throw new AppError(400, 'You have already submitted successfully for this practical');
//         }

//         // Fetch IO pairs
//         const ioData = await fetchIOPairs(submissionData.practicalId);

//         // Create batch submissions
//         const submissionResults = await createBatchSubmissions(submissionData, ioData);

//         // Store submission data in Redis
//         const submissionId = await storeSubmissionData(submissionData, submissionResults);

//         return { submissionId };
//     } catch (error) {
//         console.error('Error in createSubmission:', error);
//         throw new AppError(500, 'Failed to create submission');
//     }
// }

// async function createBatchSubmissions(submissionData: any, ioData: any[]) {
//     const submissions = ioData.map(io => ({
//         source_code: submissionData.code,
//         language_id: submissionData.language,
//         stdin: io.input,
//         redirect_stderr_to_stdout: true,
//         expected_output: io.output
//     }));

//     try {
//         const response = await axios.post(`${JUDGE0_API_URL}/submissions/batch`, {
//             submissions
//         });

//         return response.data.map((result: any, index: number) => ({
//             token: result.token,
//             input: ioData[index].input,
//             expectedOutput: ioData[index].output
//         }));
//     } catch (error) {
//         console.error('Error creating batch submissions:', error);
//         throw new AppError(500, 'Failed to create Judge0 submissions');
//     }
// }

// async function storeSubmissionData(submissionData: any, submissionResults: SubmissionResult[]) {
//     const submissionId = Date.now().toString();
//     const redisKey = `submission:${submissionId}`;

//     await redis.setex(redisKey, RESULTS_EXPIRY, JSON.stringify({
//         results: submissionResults,
//         status: 'processing',
//         practicalId: submissionData.practicalId,
//         studentId: submissionData.studentId,
//         code: submissionData.code
//     }));

//     // Start processing the results asynchronously
//     processSubmissionResults(submissionId, submissionResults).catch(console.error);

//     return submissionId;
// }

// async function processSubmissionResults(submissionId: string, submissionResults: SubmissionResult[]) {
//     const redisKey = `submission:${submissionId}`;
//     const batchCount = Math.ceil(submissionResults.length / BATCH_SIZE);

//     for (let i = 0; i < batchCount; i++) {
//         const batch = submissionResults.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
//         const tokens = batch.map(result => result.token).join(',');

//         try {
//             const response = await axios.get(`${JUDGE0_API_URL}/submissions/batch`, {
//                 params: {
//                     tokens,
//                     fields: 'status,stdout,stderr'
//                 }
//             });

//             // Update results in Redis
//             const storedData = JSON.parse(await redis.get(redisKey) || '{}');
//             response.data.submissions.forEach((result: any, index: number) => {
//                 const resultIndex = i * BATCH_SIZE + index;
//                 storedData.results[resultIndex].status = result.status.description;
//                 storedData.results[resultIndex].actualOutput = result.stdout || result.stderr;
//             });

//             const allProcessed = storedData.results.every((result: any) => result.status);
//             if (allProcessed) {
//                 storedData.status = 'completed';

//                 // Save to database if all tests passed
//                 const allPassed = storedData.results.every((result: any) => result.status === 'Accepted');
//                 if (allPassed) {
//                     await saveSubmissionToDatabase(storedData);
//                 }
//             }

//             await redis.setex(redisKey, RESULTS_EXPIRY, JSON.stringify(storedData));
//         } catch (error) {
//             console.error(`Error processing batch ${i + 1}:`, error);
//         }

//         // Add a small delay between batches to prevent overwhelming the Judge0 API
//         if (i < batchCount - 1) {
//             await new Promise(resolve => setTimeout(resolve, 1000));
//         }
//     }
// }

export async function getSubmissionResults(submissionId: string) {
    const redisKey = `submission:${submissionId}`;
    const submissionData = await redis.get(redisKey);

    if (!submissionData) {
        throw new AppError(404, 'Submission not found');
    }

    const data = JSON.parse(submissionData);
    return {
        status: data.status,
        testResults: data.results,
        allPassed: data.status === 'completed' &&
            data.results.every((result: any) => result.status === 'Accepted')
    };
}

// // Helper functions
// async function checkExistingSubmission(submissionData: any) {
//     return db
//         .select()
//         .from(submissions)
//         .where(
//             and(
//                 eq(submissions.practical_id, submissionData.practicalId),
//                 eq(submissions.student_id, submissionData.studentId),
//                 eq(submissions.status, 'Accepted')
//             )
//         )
//         .limit(1);
// }


// async function saveSubmissionToDatabase(submissionData: any) {
//     return db.insert(submissions).values({
//         practical_id: submissionData.practicalId,
//         student_id: submissionData.studentId,
//         code_submitted: submissionData.code,
//         submission_time: new Date(),
//         status: 'Accepted',
//         marks: 15
//     });
// }

// async function createJudge0Submission(sourceCode: string, languageId: number, stdin: string, expectedOutput: string) {
//     try {
//         const response = await axios.post(`${JUDGE0_BASE_URL}/submissions`, {
//             source_code: sourceCode,
//             language_id: languageId,
//             stdin: stdin,
//             expected_output: expectedOutput
//         });
//         return response.data.token;
//     } catch (error) {
//         console.error('Error creating Judge0 submission:', error);
//         throw new AppError(500, 'Failed to create Judge0 submission');
//     }
// }

// async function getJudge0SubmissionResult(token: string) {
//     try {
//         const response = await axios.get(`${JUDGE0_BASE_URL}/submissions/${token}`);
//         return response.data;
//     } catch (error) {
//         console.error('Error getting Judge0 submission result:', error);
//         throw new AppError(500, 'Failed to get Judge0 submission result');
//     }
// }

// export async function createSubmission(submissionData: any) {
//     try {
//         // Check if the student has already submitted successfully for this practical
//         const existingSubmission = await db
//             .select()
//             .from(submissions)
//             .where(
//                 and(
//                     eq(submissions.practical_id, submissionData.practicalId),
//                     eq(submissions.student_id, submissionData.studentId),
//                     eq(submissions.status, 'Accepted')
//                 )
//             )
//             .limit(1);

//         if (existingSubmission.length > 0) {
//             throw new AppError(400, 'You have already submitted successfully for this practical');
//         }

//         // Fetch all input-output pairs for the practical
//         const ioData = await db
//             .select()
//             .from(prac_io)
//             .where(eq(prac_io.practical_id, submissionData.practicalId));

//         // Create Judge0 submissions for each test case
//         const submissionTokens = await Promise.all(
//             ioData.map(io => createJudge0Submission(submissionData.code, submissionData.language, io.input, io.output))
//         );

//         // Wait for all submissions to complete (you might want to implement a more sophisticated polling mechanism)
//         await new Promise(resolve => setTimeout(resolve, 5000));

//         // Get results for all submissions
//         const submissionResults = await Promise.all(
//             submissionTokens.map(token => getJudge0SubmissionResult(token))
//         );

//         // Check if all test cases passed
//         const allTestsPassed = submissionResults.every(result => result.status.id === 3); // 3 is the status ID for "Accepted"

//         // Insert the submission into the database
//         const result = await db.insert(submissions).values({
//             practical_id: submissionData.practicalId,
//             student_id: submissionData.studentId,
//             code_submitted: submissionData.code,
//             submission_time: new Date(),
//             status: allTestsPassed ? 'Pending' : 'Rejected',
//             marks: allTestsPassed ? 15 : 0
//         });

//         return result;
//     } catch (error) {
//         console.error('Error in createSubmission:', error);
//         throw new AppError(500, 'Failed to create submission');
//     }
// }
// export async function getSubmissionStatus(practicalId: number, studentId: number) {
//     const submission = await db.select({
//         status: submissions.status,
//         marks: submissions.marks,
//     })
//         .from(submissions)
//         .where(and(
//             eq(submissions.practical_id, practicalId),
//             eq(submissions.student_id, studentId)
//         ))
//         .limit(1);

//     return submission[0] || { status: 'Not Submitted', marks: 0 };
// }

export async function getPracticalWithSubmissionStatus(courseId: number, studentId: number) {
    const result = await db.select({
        practical_id: practicals.practical_id,
        sr_no: practicals.sr_no,
        practical_name: practicals.practical_name,
        description: practicals.description,
        pdf_url: practicals.pdf_url,
        status: submissions.status,
        marks: submissions.marks,
        deadline: batch_practical_access.deadline,
        lock: batch_practical_access.lock,
    })
        .from(practicals)
        .leftJoin(submissions, and(
            eq(submissions.practical_id, practicals.practical_id),
            eq(submissions.student_id, studentId)
        ))
        .leftJoin(batch_practical_access, eq(batch_practical_access.practical_id, practicals.practical_id))
        .leftJoin(students, eq(students.student_id, studentId))
        .leftJoin(batch, eq(batch.batch_id, students.batch_id))
        .where(and(
            eq(practicals.course_id, courseId),
            eq(batch_practical_access.batch_id, batch.batch_id)
        ));

    return result;
}


export async function getSubmissionsByPractical(practicalId: number, batchId: number, facultyId: number) {
    try {
        const submissionsList = await db
            .select({
                submission_id: submissions.submission_id,
                roll_id: students.roll_id,
                student_name: users.username,
                code: submissions.code_submitted,
                status: submissions.status,
                submission_time: submissions.submission_time,
                marks: submissions.marks,
                batch: students.batch_id
            })
            .from(submissions)
            .innerJoin(students, eq(submissions.student_id, students.student_id))
            .innerJoin(users, eq(students.student_id, users.user_id))
            .where(and(
                eq(submissions.practical_id, practicalId),
                eq(students.batch_id, batchId)
            ));

        return submissionsList;
    } catch (error) {
        console.error('Error in getSubmissionsByPractical:', error);
        throw new AppError(500, 'Failed to fetch submissions for practical');
    }
}

export async function getSubmissionById(submissionId: number) {
    try {
        const submission = await db
            .select({
                submission_id: submissions.submission_id,
                practical_sr_no: practicals.sr_no,
                practical_name: practicals.practical_name,
                course_name: courses.course_name,
                prac_io: prac_io.input,
                submission_status: submissions.status,
                code_submitted: submissions.code_submitted,
                marks: submissions.marks,
                student_name: users.username,
                roll_id: students.roll_id,
                submission_time: submissions.submission_time,
                batch_name: batch.batch
            })
            .from(submissions)
            .innerJoin(practicals, eq(submissions.practical_id, practicals.practical_id))
            .innerJoin(prac_io, eq(practicals.practical_id, prac_io.practical_id))
            .innerJoin(courses, eq(practicals.course_id, courses.course_id))
            .innerJoin(students, eq(submissions.student_id, students.student_id))
            .innerJoin(users, eq(students.student_id, users.user_id))
            .innerJoin(batch, eq(students.batch_id, batch.batch_id))
            .where(eq(submissions.submission_id, submissionId))
            .limit(1);

        return submission[0];
    } catch (error) {
        console.error('Error in getSubmissionById:', error);
        throw new AppError(500, 'Failed to fetch submission');
    }
}

export async function updateSubmission(submissionId: number, updateData: { status: string; marks: number }) {
    try {
        await db.update(submissions)
            .set({
                // @ts-ignore
                status: updateData.status,
                marks: updateData.marks,
            })
            .where(eq(submissions.submission_id, submissionId));

        // Fetch the updated submission to return
        const updatedSubmission = await getSubmissionById(submissionId);
        return updatedSubmission;
    } catch (error) {
        console.error('Error in updateSubmission:', error);
        throw new AppError(500, 'Failed to update submission');
    }
}

export async function getFacultyBatches(facultyId: number) {
    try {
        const facultyBatches = await db
            .select({
                batch_id: batch.batch_id,
                division: batch.division,
                batch_name: batch.batch
            })
            .from(batch)
            .innerJoin(courses_faculty, eq(batch.batch_id, courses_faculty.batch_id))
            .where(eq(courses_faculty.faculty_id, facultyId));

        return facultyBatches;
    } catch (error) {
        console.error('Error in getFacultyBatches:', error);
        throw new AppError(500, 'Failed to fetch faculty batches');
    }
}

// export async function getStudentSubmissions(studentId: number) {
//     try {
//         const studentSubmissions = await db
//             .select({
//                 submission_id: submissions.submission_id,
//                 practical_id: submissions.practical_id,
//                 practical_sr_no: practicals.sr_no,
//                 practical_name: practicals.practical_name,
//                 course_name: courses.course_name,
//                 submission_time: submissions.submission_time,
//                 status: submissions.status,
//                 marks: submissions.marks,
//             })
//             .from(submissions)
//             .innerJoin(practicals, eq(submissions.practical_id, practicals.practical_id))
//             .innerJoin(courses, eq(practicals.course_id, courses.course_id))
//             .where(eq(submissions.student_id, studentId));

//         return studentSubmissions;
//     } catch (error) {
//         console.error('Error in getStudentSubmissions:', error);
//         throw new AppError(500, 'Failed to fetch student submissions');
//     }
// }

// export async function getStudentDetails(studentId: number) {
//     try {
//         const studentDetails = await db
//             .select({
//                 student_id: students.student_id,
//                 name: users.username,
//                 email: users.email,
//                 roll_id: students.roll_id,
//                 semester: batch.semester,
//                 division: batch.division,
//                 batch: batch.batch,
//             })
//             .from(students)
//             .innerJoin(users, eq(students.student_id, users.user_id))
//             .innerJoin(batch, eq(students.batch_id, batch.batch_id))
//             .where(eq(students.student_id, studentId))
//             .limit(1);

//         return studentDetails[0];
//     } catch (error) {
//         console.error('Error in getStudentDetails:', error);
//         throw new AppError(500, 'Failed to fetch student details');
//     }
// }

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

export async function getStudentDetails(studentId: number) {
    try {
        const studentDetails = await db
            .select({
                student_id: students.student_id,
                name: users.username,
                email: users.email,
                roll_id: students.roll_id,
                semester: batch.semester,
                division: batch.division,
                batch: batch.batch,
            })
            .from(students)
            .innerJoin(users, eq(students.student_id, users.user_id))
            .innerJoin(batch, eq(students.batch_id, batch.batch_id))
            .where(eq(students.student_id, studentId))
            .limit(1);

        if (studentDetails.length === 0) {
            throw new AppError(404, 'Student not found');
        }

        return studentDetails[0];
    } catch (error) {
        console.error('Error in getStudentDetails:', error);
        throw error instanceof AppError ? error : new AppError(500, 'Failed to fetch student details');
    }
}

export async function updateStudent(studentId: number, updateData: Partial<typeof students.$inferSelect>) {
    try {
        await db.update(students)
            .set(updateData)
            .where(eq(students.student_id, studentId));

        // Fetch and return the updated student details
        const updatedStudent = await getStudentDetails(studentId);
        return updatedStudent;
    } catch (error) {
        console.error('Error in updateStudent:', error);
        throw new AppError(500, 'Failed to update student');
    }
}

export async function deleteStudent(studentId: number) {
    try {
        await db.delete(students)
            .where(eq(students.student_id, studentId));
    } catch (error) {
        console.error('Error in deleteStudent:', error);
        throw new AppError(500, 'Failed to delete student');
    }
}

// export async function runCode(runData: { code: string; language: string; input: string; userId: number }) {
//     const canRun = await checkRateLimit(runData.userId, 'run');
//     if (!canRun) {
//         throw new AppError(429, `Please wait ${RUN_RATE_LIMIT} seconds before running code again`);
//     }

//     try {
//         const response = await axios.post(`${JUDGE0_API_URL}/submissions`, {
//             source_code: runData.code,
//             language_id: runData.language,
//             stdin: runData.input,
//             redirect_stderr_to_stdout: true
//         });

//         const { token } = response.data;
//         const result = await waitForResult(token);
//         return {
//             output: result.stdout || result.stderr || 'No output',
//             status: result.status.description,
//             time: result.time,
//             memory: result.memory
//         };
//     } catch (error) {
//         console.error('Error in runCode:', error);
//         throw new AppError(500, 'Failed to run code');
//     }
// }

// export async function submitCode(submissionData: {
//     code: string;
//     language: string;
//     practicalId: number;
//     studentId: number;
// }) {
//     // Check rate limit
//     const canSubmit = await checkRateLimit(submissionData.studentId, 'submit');
//     if (!canSubmit) {
//         throw new AppError(429, `Please wait ${SUBMISSION_RATE_LIMIT} seconds before submitting again`);
//     }

//     // Check for existing accepted submission
//     const existingSubmission = await db
//         .select()
//         .from(submissions)
//         .where(
//             and(
//                 eq(submissions.practical_id, submissionData.practicalId),
//                 eq(submissions.student_id, submissionData.studentId),
//                 eq(submissions.status, 'Accepted')
//             )
//         )
//         .limit(1);

//     if (existingSubmission.length > 0) {
//         return { alreadySubmitted: true };
//     }

//     // Fetch test cases
//     const testCases = await db
//         .select()
//         .from(prac_io)
//         .where(eq(prac_io.practical_id, submissionData.practicalId));

//     // Create batch submissions
//     const batchResults = await createBatchSubmissions(submissionData, testCases);

//     // Store initial submission data
//     const submissionId = await storeSubmissionData(submissionData, batchResults);

//     return { submissionId };
// }

// export async function createSubmission(submissionData: any) {
//     try {
//         // Check for rate limiting
//         const rateLimitKey = `ratelimit:${submissionData.studentId}`;
//         const lastSubmission = await redis.get(rateLimitKey);

//         if (lastSubmission) {
//             throw new AppError(429, 'Please wait before submitting again');
//         }

//         // Check for existing successful submission
//         const existingSubmission = await db
//             .select()
//             .from(submissions)
//             .where(
//                 and(
//                     eq(submissions.practical_id, submissionData.practicalId),
//                     eq(submissions.student_id, submissionData.studentId),
//                     eq(submissions.status, 'Accepted')
//                 )
//             )
//             .limit(1);

//         if (existingSubmission.length > 0) {
//             return { alreadySubmitted: true };
//         }

//         // Set rate limit
//         await redis.set(rateLimitKey, Date.now(), 'EX', RATE_LIMIT_WINDOW);

//         // Fetch IO pairs
//         const ioData = await db
//             .select()
//             .from(prac_io)
//             .where(eq(prac_io.practical_id, submissionData.practicalId));

//         // Create batch submissions
//         const submissions_ = ioData.map(io => ({
//             source_code: submissionData.code,
//             language_id: submissionData.language,
//             stdin: io.input,
//             redirect_stderr_to_stdout: true,
//             expected_output: io.output
//         }));

//         const batchResponse = await axios.post(`${JUDGE0_API_URL}/submissions/batch`, {
//             submissions_
//         });

//         // Store submission data
//         const submissionId = Date.now().toString();
//         await redis.setex(
//             `submission:${submissionId}`,
//             300, // 5 minutes expiry
//             JSON.stringify({
//                 tokens: batchResponse.data.map((r: any) => r.token),
//                 practicalId: submissionData.practicalId,
//                 studentId: submissionData.studentId,
//                 code: submissionData.code
//             })
//         );

//         return { submissionId };
//     } catch (error) {
//         if (error instanceof AppError) throw error;
//         console.error('Error in createSubmission:', error);
//         throw new AppError(500, 'Failed to create submission');
//     }
// }

// export async function getSubmissionStatus(submissionId: string) {
//     try {
//         const submissionData = await redis.get(`submission:${submissionId}`);
//         if (!submissionData) {
//             throw new AppError(404, 'Submission not found');
//         }

//         const { tokens, practicalId, studentId, code } = JSON.parse(submissionData);

//         // Get all results
//         const results = await Promise.all(
//             tokens.map(async (token: string) => {
//                 const result = await waitForResult(token);
//                 return result.status.id === 3; // 3 is "Accepted"
//             })
//         );

//         const allAccepted = results.every(r => r);

//         // If all tests passed, save to database
//         if (allAccepted) {
//             await db.insert(submissions).values({
//                 practical_id: practicalId,
//                 student_id: studentId,
//                 code_submitted: code,
//                 submission_time: new Date(),
//                 status: 'Accepted',
//                 marks: 15
//             });
//         }

//         return {
//             status: allAccepted ? 'Accepted' : 'Rejected'
//         };
//     } catch (error) {
//         console.error('Error in getSubmissionStatus:', error);
//         throw new AppError(500, 'Failed to get submission status');
//     }
// }

// async function waitForResult(token: string, timeout = SUBMISSION_TIMEOUT) {
//     const startTime = Date.now();

//     while (Date.now() - startTime < timeout) {
//         try {
//             const response = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`);
//             if (response.data.status.id !== 1 && response.data.status.id !== 2) { // Not In Queue or Processing
//                 return response.data;
//             }
//             await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before next attempt
//         } catch (error) {
//             console.error('Error fetching result:', error);
//             throw new AppError(500, 'Failed to get result');
//         }
//     }

//     throw new AppError(504, 'Submission processing timeout');
// }

export async function getRunResult(token: string) {
    try {
        const response = await axios.get(`${JUDGE0_API_URL}/submissions/${token}?fields=status,stdout,stderr,time,memory`);
        return response.data;
    } catch (error) {
        console.error('Error in getRunResult:', error);
        throw new AppError(500, 'Failed to get run result');
    }
}

export async function getSubmissionStatus_(submissionId: string) {
    try {
        const submissionData = await redis.get(`submission:${submissionId}`);
        if (!submissionData) {
            throw new AppError(404, 'Submission not found');
        }

        const data = JSON.parse(submissionData);
        const completed = data.status === 'completed';

        return {
            status: completed ? data.results.every((r: any) => r.status === 'Accepted') ? 'Accepted' : 'Rejected' : 'Processing',
            completed
        };
    } catch (error) {
        console.error('Error in getSubmissionStatus:', error);
        throw new AppError(500, 'Failed to get submission status');
    }
}

// export async function createSubmission(submissionData: any) {
//     try {
//         // Check rate limiting
//         const rateLimitKey = `ratelimit:${submissionData.studentId}`;
//         const lastSubmission = await executeRedisOperation(() =>
//             redis.get(rateLimitKey)
//         );

//         if (lastSubmission) {
//             throw new AppError(429, 'Please wait before submitting again');
//         }

//         // Check existing submission
//         const existingSubmission = await db
//             .select()
//             .from(submissions)
//             .where(
//                 and(
//                     eq(submissions.practical_id, submissionData.practicalId),
//                     eq(submissions.student_id, submissionData.studentId),
//                     eq(submissions.status, 'Accepted')
//                 )
//             )
//             .limit(1);

//         if (existingSubmission.length > 0) {
//             return { alreadySubmitted: true };
//         }

//         // Set rate limit
//         await executeRedisOperation(() =>
//             redis.set(rateLimitKey, Date.now().toString(), {
//                 EX: RATE_LIMIT_WINDOW
//             })
//         );

//         // Fetch IO pairs
//         const ioData = await db
//             .select()
//             .from(prac_io)
//             .where(eq(prac_io.practical_id, submissionData.practicalId));

//         // Create batch submissions
//         const submissionResults = await createBatchSubmissions(submissionData, ioData);

//         // Store submission data
//         const submissionId = await storeSubmissionData(submissionData, submissionResults);

//         return { submissionId };
//     } catch (error) {
//         if (error instanceof AppError) throw error;
//         console.error('Error in createSubmission:', error);
//         throw new AppError(500, 'Failed to create submission');
//     }
// }

// async function processSubmissionResults(submissionId: string, results: SubmissionResult[]) {
//     const redisKey = `submission:${submissionId}`;
//     const batches = [];

//     for (let i = 0; i < results.length; i += SUBMISSION_BATCH_SIZE) {
//         batches.push(results.slice(i, i + SUBMISSION_BATCH_SIZE));
//     }

//     for (const batch of batches) {
//         try {
//             const tokens = batch.map(result => result.token).join(',');
//             const response = await axios.get(`${JUDGE0_API_URL}/submissions/batch`, {
//                 params: { tokens, fields: 'status,stdout,stderr' }
//             });

//             const data = JSON.parse(await redis.get(redisKey) || '{}');
//             if (!data.results) continue;

//             response.data.submissions.forEach((result: any, index: number) => {
//                 const batchIndex = batches.indexOf(batch);
//                 const resultIndex = batchIndex * SUBMISSION_BATCH_SIZE + index;

//                 if (data.results[resultIndex]) {
//                     data.results[resultIndex].status = result.status.description;
//                     data.results[resultIndex].actualOutput = result.stdout || result.stderr;
//                 }
//             });

//             const allProcessed = data.results.every((result: any) => result.status);
//             if (allProcessed) {
//                 data.status = 'completed';
//                 const allPassed = data.results.every((result: any) => result.status === 'Accepted');

//                 if (allPassed) {
//                     await saveSubmissionToDatabase(data);
//                 }
//             }

//             await redis.set(redisKey, JSON.stringify(data), { EX: RESULTS_EXPIRY });
//         } catch (error) {
//             console.error('Error processing batch:', error);
//         }

//         // Add delay between batches to prevent overloading
//         await new Promise(resolve => setTimeout(resolve, 1000));
//     }
// }

// async function createBatchSubmissions(submissionData: any, testCases: any[]): Promise<SubmissionResult[]> {
//     const batches = [];
//     for (let i = 0; i < testCases.length; i += SUBMISSION_BATCH_SIZE) {
//         const batch = testCases.slice(i, i + SUBMISSION_BATCH_SIZE);
//         batches.push(batch);
//     }

//     const results: SubmissionResult[] = [];
//     for (const batch of batches) {
//         const submissions = batch.map(testCase => ({
//             source_code: submissionData.code,
//             language_id: submissionData.language,
//             stdin: testCase.input,
//             expected_output: testCase.output
//         }));

//         const response = await axios.post(`${JUDGE0_API_URL}/submissions/batch`, { submissions });

//         results.push(...response.data.map((result: any, index: number) => ({
//             token: result.token,
//             input: batch[index].input,
//             expectedOutput: batch[index].output
//         })));
//     }

//     return results;
// }

// async function storeSubmissionData(submissionData: any, results: SubmissionResult[]) {
//     const submissionId = Date.now().toString();
//     const redisKey = `submission:${submissionId}`;

//     await redis.set(redisKey, JSON.stringify({
//         results,
//         status: 'processing',
//         practicalId: submissionData.practicalId,
//         studentId: submissionData.studentId,
//         code: submissionData.code
//     }), { EX: RESULTS_EXPIRY });

//     // Start processing results asynchronously
//     processSubmissionResults(submissionId, results).catch(console.error);

//     return submissionId;
// }

// async function processSubmissionResults(submissionId: string, submissionResults: SubmissionResult[]) {
//     const redisKey = `submission:${submissionId}`;
//     const BATCH_SIZE = 5;
//     const batchCount = Math.ceil(submissionResults.length / BATCH_SIZE);

//     for (let i = 0; i < batchCount; i++) {
//         const batch = submissionResults.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
//         const tokens = batch.map(result => result.token).join(',');

//         try {
//             const response = await axios.get(`${JUDGE0_API_URL}/submissions/batch`, {
//                 params: {
//                     tokens,
//                     fields: 'status,stdout,stderr'
//                 }
//             });

//             // Update results in Redis
//             const storedData = await executeRedisOperation(async () => {
//                 const data = await redis.get(redisKey);
//                 return data ? JSON.parse(data) : null;
//             });

//             if (!storedData) {
//                 console.error('Submission data not found in Redis');
//                 continue;
//             }

//             response.data.submissions.forEach((result: any, index: number) => {
//                 const resultIndex = i * BATCH_SIZE + index;
//                 storedData.results[resultIndex].status = result.status.description;
//                 storedData.results[resultIndex].actualOutput = result.stdout || result.stderr;
//             });

//             const allProcessed = storedData.results.every((result: any) => result.status);
//             if (allProcessed) {
//                 storedData.status = 'completed';

//                 // Save to database if all tests passed
//                 const allPassed = storedData.results.every((result: any) => result.status === 'Accepted');
//                 if (allPassed) {
//                     await saveSubmissionToDatabase(storedData);
//                 }
//             }

//             await executeRedisOperation(() =>
//                 redis.set(redisKey, JSON.stringify(storedData), {
//                     EX: RESULTS_EXPIRY
//                 })
//             );
//         } catch (error) {
//             console.error(`Error processing batch ${i + 1}:`, error);
//         }

//         // Delay between batches
//         if (i < batchCount - 1) {
//             await new Promise(resolve => setTimeout(resolve, 1000));
//         }
//     }
// }

// async function saveSubmissionToDatabase(submissionData: any) {
//     await db.insert(submissions).values({
//         practical_id: submissionData.practicalId,
//         student_id: submissionData.studentId,
//         code_submitted: submissionData.code,
//         submission_time: new Date(),
//         status: 'Accepted',
//         marks: 15
//     });
// }

// export async function getSubmissionStatus(submissionId: string) {
//     const data = JSON.parse(await redis.get(`submission:${submissionId}`) || '{}');
//     if (!data.results) {
//         throw new AppError(404, 'Submission not found');
//     }

//     const completed = data.status === 'completed';
//     return {
//         status: completed ?
//             data.results.every((r: any) => r.status === 'Accepted') ? 'Accepted' : 'Rejected'
//             : 'Processing',
//         completed
//     };
// }

// export async function getSubmissionStatus(submissionId: string) {
//     try {
//         const submissionData = await executeRedisOperation(() =>
//             redis.get(`submission:${submissionId}`)
//         );

//         if (!submissionData) {
//             throw new AppError(404, 'Submission not found');
//         }

//         const data = JSON.parse(submissionData);
//         const completed = data.status === 'completed';

//         return {
//             status: completed
//                 ? data.results.every((r: any) => r.status === 'Accepted')
//                     ? 'Accepted'
//                     : 'Rejected'
//                 : 'Processing',
//             completed,
//             results: data.results
//         };
//     } catch (error) {
//         console.error('Error in getSubmissionStatus:', error);
//         throw new AppError(500, 'Failed to get submission status');
//     }
// }


// export async function createSubmission(submissionData: any) {
//     try {
//         // Check rate limiting
//         const rateLimitKey = `ratelimit:${submissionData.studentId}`;
//         const lastSubmission = await executeRedisOperation(() =>
//             redis.get(rateLimitKey)
//         );

//         if (lastSubmission) {
//             throw new AppError(429, 'Please wait before submitting again');
//         }

//         // Rest of the createSubmission implementation...
//         // Use executeRedisOperation for all Redis operations
//     } catch (error) {
//         if (error instanceof AppError) throw error;
//         console.error('Error in createSubmission:', error);
//         throw new AppError(500, 'Failed to create submission');
//     }
// }


// async function checkRateLimit(userId: number, action: 'submit' | 'run'): Promise<boolean> {
//     const key = `ratelimit:${action}:${userId}`;
//     const limit = action === 'submit' ? SUBMISSION_RATE_LIMIT : RUN_RATE_LIMIT;

//     try {
//         const lastAction = await redis.get(key);
//         if (lastAction) {
//             return false;
//         }

//         await redis.set(key, Date.now().toString(), { EX: limit });
//         return true;
//     } catch (error) {
//         console.error(`Rate limit check failed for ${action}:`, error);
//         return false;
//     }
// }

// interface SubmissionResult {
//     token: string;
//     input: string;
//     expectedOutput: string;
//     status?: string;
//     actualOutput?: string;
// }

// export async function submitCode(submissionData: {
//     code: string;
//     language: string;
//     practicalId: number;
//     studentId: number;
// }) {
//     // Check for existing accepted submission
//     const existingSubmission = await db
//         .select()
//         .from(submissions)
//         .where(
//             and(
//                 eq(submissions.practical_id, submissionData.practicalId),
//                 eq(submissions.student_id, submissionData.studentId),
//                 eq(submissions.status, 'Accepted')
//             )
//         )
//         .limit(1);

//     if (existingSubmission.length > 0) {
//         return { alreadySubmitted: true };
//     }

//     // Fetch test cases
//     const testCases = await db
//         .select()
//         .from(prac_io)
//         .where(eq(prac_io.practical_id, submissionData.practicalId));

//     // Create batch submissions
//     const batchResults = await createBatchSubmissions(submissionData, testCases);

//     // Store initial submission data
//     const submissionId = await storeSubmissionData(submissionData, batchResults);

//     // Start processing results asynchronously
//     processSubmissionResults(submissionId, batchResults).catch(console.error);

//     return { submissionId };
// }

// async function createBatchSubmissions(submissionData: any, testCases: any[]): Promise<SubmissionResult[]> {
//     const batches = [];
//     for (let i = 0; i < testCases.length; i += SUBMISSION_BATCH_SIZE) {
//         const batch = testCases.slice(i, i + SUBMISSION_BATCH_SIZE);
//         batches.push(batch);
//     }

//     const results: SubmissionResult[] = [];
//     for (const batch of batches) {
//         const submissions = batch.map(testCase => ({
//             source_code: submissionData.code,
//             language_id: submissionData.language,
//             stdin: testCase.input,
//             expected_output: testCase.output
//         }));

//         // console.log(submissions)
//         const response = await axios.post(`${JUDGE0_API_URL}/submissions/batch`, { submissions });
//         // console.log(response)
//         results.push(...response.data.map((result: any, index: number) => ({
//             token: result.token,
//             input: batch[index].input,
//             expectedOutput: batch[index].output
//         })));
//     }

//     // console.log(results)

//     return results;
// }

async function storeSubmissionData(submissionData: any, results: SubmissionResult[]) {
    const [result] = await db.insert(submissions).values({
        practical_id: submissionData.practicalId,
        student_id: submissionData.studentId,
        code_submitted: submissionData.code,
        status: 'Pending',
        submission_time: new Date()
    });

    // In MySQL, the insertId is returned directly
    const submissionId = result.insertId;

    // Store additional data in Redis
    const redisKey = `submission:${submissionId}`;
    await redis.set(redisKey, JSON.stringify({
        results,
        status: 'processing',
        practicalId: submissionData.practicalId,
        studentId: submissionData.studentId,
        code: submissionData.code
    }), { EX: RESULTS_EXPIRY });

    return submissionId;
}

// async function processSubmissionResults(submissionId: number, results: SubmissionResult[]) {
//     const batches = [];
//     for (let i = 0; i < results.length; i += SUBMISSION_BATCH_SIZE) {
//         batches.push(results.slice(i, i + SUBMISSION_BATCH_SIZE));
//     }

//     let allPassed = true;

//     for (const batch of batches) {
//         try {
//             const tokens = batch.map(result => result.token).join(',');
//             const response = await axios.get(`${JUDGE0_API_URL}/submissions/batch`, {
//                 params: { tokens, fields: 'status,stdout,stderr' }
//             });

//             response.data.submissions.forEach((result: any) => {
//                 if (result.status.id !== 3) { // 3 is the status ID for "Accepted"
//                     allPassed = false;
//                 }
//             });

//             // Add delay between batches to prevent overloading
//             await new Promise(resolve => setTimeout(resolve, 1000));
//         } catch (error) {
//             console.error('Error processing batch:', error);
//             allPassed = false;
//         }
//     }

//     // Update the submission status in the database
//     await db.update(submissions)
//         .set({
//             status: allPassed ? 'Accepted' : 'Rejected',
//             marks: allPassed ? 15 : 0
//         })
//         .where(eq(submissions.submission_id, submissionId));
// }

// export async function getSubmissionStatus(submissionId: number) {
//     const result = await db
//         .select({
//             status: submissions.status,
//             marks: submissions.marks
//         })
//         .from(submissions)
//         .where(eq(submissions.submission_id, submissionId))
//         .limit(1);

//     if (result.length === 0) {
//         throw new AppError(404, 'Submission not found');
//     }

//     const submission = result[0];
//     return {
//         status: submission.status,
//         marks: submission.marks,
//         completed: submission.status !== 'Pending'
//     };
// }

// export async function createSubmission(submissionData: {
//     code: string;
//     language: string;
//     practicalId: number;
//     studentId: number;
// }) {
//     // Check rate limit
//     const canSubmit = await checkRateLimit(submissionData.studentId, 'submit');
//     if (!canSubmit) {
//         throw new AppError(429, `Please wait ${SUBMISSION_RATE_LIMIT} seconds before submitting again`);
//     }

//     // Check for existing accepted submission
//     const existingSubmission = await checkExistingSubmission(submissionData);
//     if (existingSubmission.length > 0) {
//         return { alreadySubmitted: true };
//     }

//     // Fetch all test cases (both public and private)
//     const testCases = await fetchAllTestCases(submissionData.practicalId);

//     // Create batch submissions
//     const batchResults = await createBatchSubmissions(submissionData, testCases);

//     // Store initial submission data
//     const submissionId = await storeSubmissionData(submissionData, batchResults);

//     // Start processing results asynchronously
//     processSubmissionResults(submissionId, batchResults).catch(console.error);

//     return { submissionId };
// }

async function checkExistingSubmission(submissionData: any) {
    return db
        .select()
        .from(submissions)
        .where(
            and(
                eq(submissions.practical_id, submissionData.practicalId),
                eq(submissions.student_id, submissionData.studentId),
                eq(submissions.status, 'Accepted')
            )
        )
        .limit(1);
}

async function fetchAllTestCases(practicalId: number) {
    return db
        .select()
        .from(prac_io)
        .where(eq(prac_io.practical_id, practicalId));
}

// async function createBatchSubmissions(submissionData: any, testCases: any[]): Promise<SubmissionResult[]> {
//     const batches = [];
//     for (let i = 0; i < testCases.length; i += SUBMISSION_BATCH_SIZE) {
//         batches.push(testCases.slice(i, i + SUBMISSION_BATCH_SIZE));
//     }

//     const results: SubmissionResult[] = [];
//     for (const batch of batches) {
//         const submissions = batch.map(testCase => ({
//             source_code: submissionData.code,
//             language_id: submissionData.language,
//             stdin: testCase.input,
//             expected_output: testCase.output
//         }));

//         const response = await axios.post(`${JUDGE0_API_URL}/submissions/batch`, { submissions });

//         results.push(...response.data.map((result: any, index: number) => ({
//             token: result.token,
//             input: batch[index].input,
//             expectedOutput: batch[index].output
//         })));
//     }

//     return results;
// }

// async function storeSubmissionData(submissionData: any, results: SubmissionResult[]) {
//     const submissionId = Date.now().toString();
//     const redisKey = `submission:${submissionId}`;

//     await redis.set(redisKey, JSON.stringify({
//         results,
//         status: 'processing',
//         practicalId: submissionData.practicalId,
//         studentId: submissionData.studentId,
//         code: submissionData.code
//     }), { EX: RESULTS_EXPIRY });

//     return submissionId;
// }

// async function processSubmissionResults(submissionId: string, results: SubmissionResult[]) {
//     const redisKey = `submission:${submissionId}`;
//     const batches = [];

//     for (let i = 0; i < results.length; i += SUBMISSION_BATCH_SIZE) {
//         batches.push(results.slice(i, i + SUBMISSION_BATCH_SIZE));
//     }

//     for (const batch of batches) {
//         try {
//             const tokens = batch.map(result => result.token).join(',');
//             const response = await axios.get(`${JUDGE0_API_URL}/submissions/batch`, {
//                 params: { tokens, fields: 'status,stdout,stderr' }
//             });

//             const data = JSON.parse(await redis.get(redisKey) || '{}');
//             if (!data.results) continue;

//             response.data.submissions.forEach((result: any, index: number) => {
//                 const batchIndex = batches.indexOf(batch);
//                 const resultIndex = batchIndex * SUBMISSION_BATCH_SIZE + index;

//                 if (data.results[resultIndex]) {
//                     data.results[resultIndex].status = result.status.description;
//                     data.results[resultIndex].actualOutput = result.stdout || result.stderr;
//                 }
//             });

//             const allProcessed = data.results.every((result: any) => result.status);
//             if (allProcessed) {
//                 data.status = 'completed';
//                 const allPassed = data.results.every((result: any) => result.status === 'Accepted');

//                 if (allPassed) {
//                     await saveSubmissionToDatabase(data);
//                 }
//             }

//             await redis.set(redisKey, JSON.stringify(data), { EX: RESULTS_EXPIRY });
//         } catch (error) {
//             console.error('Error processing batch:', error);
//         }

//         // Add delay between batches to prevent overloading
//         await new Promise(resolve => setTimeout(resolve, 1000));
//     }
// }

async function saveSubmissionToDatabase(submissionData: any) {
    await db.insert(submissions).values({
        practical_id: submissionData.practicalId,
        student_id: submissionData.studentId,
        code_submitted: submissionData.code,
        submission_time: new Date(),
        status: 'Accepted',
        marks: 15 // Assuming a fixed mark for accepted submissions
    });
}

// export async function getSubmissionStatus(submissionId: string) {
//     const data = JSON.parse(await redis.get(`submission:${submissionId}`) || '{}');
//     if (!data.results) {
//         throw new AppError(404, 'Submission not found');
//     }

//     const completed = data.status === 'completed';
//     return {
//         status: completed ?
//             data.results.every((r: any) => r.status === 'Accepted') ? 'Accepted' : 'Rejected'
//             : 'Processing',
//         completed
//     };
// }

async function checkRateLimit(userId: number, action: 'submit' | 'run'): Promise<boolean> {
    const key = `ratelimit:${action}:${userId}`;
    const limit = action === 'submit' ? SUBMISSION_RATE_LIMIT : RUN_RATE_LIMIT;

    try {
        const lastAction = await redis.get(key);
        if (lastAction) {
            return false;
        }

        await redis.set(key, Date.now().toString(), { EX: limit });
        return true;
    } catch (error) {
        console.error(`Rate limit check failed for ${action}:`, error);
        return false;
    }
}

// export async function runCode(runData: { code: string; language: string; input: string; userId: number }) {
//     const canRun = await checkRateLimit(runData.userId, 'run');
//     if (!canRun) {
//         throw new AppError(429, `Please wait ${RUN_RATE_LIMIT} seconds before running code again`);
//     }

//     try {
//         const response = await axios.post(`${JUDGE0_API_URL}/submissions`, {
//             source_code: runData.code,
//             language_id: runData.language,
//             stdin: runData.input,
//             redirect_stderr_to_stdout: true
//         });

//         const { token } = response.data;
//         const result = await waitForResult(token);
//         return {
//             output: result.stdout || result.stderr || 'No output',
//             status: result.status.description,
//             time: result.time,
//             memory: result.memory
//         };
//     } catch (error) {
//         console.error('Error in runCode:', error);
//         throw new AppError(500, 'Failed to run code');
//     }
// }

// async function waitForResult(token: string, timeout = SUBMISSION_TIMEOUT) {
//     const startTime = Date.now();

//     while (Date.now() - startTime < timeout) {
//         try {
//             const response = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`);
//             if (response.data.status.id !== 1 && response.data.status.id !== 2) { // Not In Queue or Processing
//                 return response.data;
//             }
//             await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before next attempt
//         } catch (error) {
//             console.error('Error fetching result:', error);
//             throw new AppError(500, 'Failed to get result');
//         }
//     }

//     throw new AppError(504, 'Submission processing timeout');
// }

// export async function submitCode(submissionData: {
//     code: string;
//     language: string;
//     practicalId: number;
//     studentId: number;
// }) {
//     // Check for existing accepted submission
//     const existingSubmission = await db
//         .select()
//         .from(submissions)
//         .where(
//             and(
//                 eq(submissions.practical_id, submissionData.practicalId),
//                 eq(submissions.student_id, submissionData.studentId),
//                 eq(submissions.status, 'Accepted')
//             )
//         )
//         .limit(1);

//     if (existingSubmission.length > 0) {
//         return { alreadySubmitted: true };
//     }

//     // Fetch test cases
//     const testCases = await db
//         .select()
//         .from(prac_io)
//         .where(eq(prac_io.practical_id, submissionData.practicalId));

//     // Create batch submissions
//     const batchResults = await createBatchSubmissions(submissionData, testCases);

//     // Store initial submission data
//     const submissionId = await storeSubmissionData(submissionData, batchResults);

//     // Start processing results asynchronously
//     processSubmissionResults(submissionId, batchResults).catch(console.error);

//     return { submissionId };
// }


// export async function runCode(runData: { code: string; language: string; input: string; userId: number }) {
//     const canRun = await checkRateLimit(runData.userId, 'run');
//     if (!canRun) {
//         throw new AppError(429, `Please wait ${RUN_RATE_LIMIT} seconds before running code again`);
//     }

//     try {
//         const response = await axios.post(`${JUDGE0_API_URL}/submissions`, {
//             source_code: runData.code,
//             language_id: runData.language,
//             stdin: runData.input,
//             redirect_stderr_to_stdout: true
//         });

//         const { token } = response.data;
//         const result = await waitForResult(token);
//         return {
//             output: result.stdout || result.stderr || 'No output',
//             status: result.status.description,
//             time: result.time,
//             memory: result.memory
//         };
//     } catch (error) {
//         console.error('Error in runCode:', error);
//         throw new AppError(500, 'Failed to run code');
//     }
// }

export async function runCode(runData: { code: string; language: string; input: string; userId: number }) {
    const canRun = await checkRateLimit(runData.userId, 'run');
    if (!canRun) {
        throw new AppError(429, `Please wait ${RUN_RATE_LIMIT} seconds before running code again`);
    }

    try {
        const response = await axios.post(`${JUDGE0_API_URL}/submissions`, {
            source_code: runData.code,
            language_id: parseInt(runData.language, 10), // Ensure language_id is an integer
            stdin: runData.input,
            redirect_stderr_to_stdout: true
        });

        const { token } = response.data;
        const result = await waitForResult(token);
        return {
            output: result.stdout || result.stderr || 'No output',
            status: result.status.description,
            time: result.time,
            memory: result.memory
        };
    } catch (error: any) {
        console.error('Error in runCode:', error);
        if (error.response && error.response.status === 422) {
            console.error('Judge0 API Error:', error.response.data);
            throw new AppError(422, 'Invalid request payload to Judge0 API');
        }
        throw new AppError(500, 'Failed to run code');
    }
}

async function waitForResult(token: string, timeout = SUBMISSION_TIMEOUT) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        try {
            const response = await axios.get(`${JUDGE0_API_URL}/submissions/${token}`);
            if (response.data.status.id !== 1 && response.data.status.id !== 2) { // Not In Queue or Processing
                return response.data;
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before next attempt
        } catch (error) {
            console.error('Error fetching result:', error);
            throw new AppError(500, 'Failed to get result');
        }
    }

    throw new AppError(504, 'Submission processing timeout');
}



// export async function submitCode(submissionData: {
//     code: string;
//     language: string;
//     practicalId: number;
//     studentId: number;
// }) {
//     // Check for existing accepted submission
//     const existingSubmission = await db
//         .select()
//         .from(submissions)
//         .where(
//             and(
//                 eq(submissions.practical_id, submissionData.practicalId),
//                 eq(submissions.student_id, submissionData.studentId),
//                 eq(submissions.status, 'Accepted')
//             )
//         )
//         .limit(1);

//     if (existingSubmission.length > 0) {
//         return { alreadySubmitted: true };
//     }

//     // Fetch test cases
//     const testCases = await db
//         .select()
//         .from(prac_io)
//         .where(eq(prac_io.practical_id, submissionData.practicalId));

//     // Create batch submissions
//     const batchResults = await createBatchSubmissions(submissionData, testCases);

//     // Store initial submission data
//     const submissionId = await storeSubmissionData(submissionData, batchResults);

//     // Start processing results asynchronously
//     processSubmissionResults(submissionId, batchResults, submissionData).catch(console.error);

//     return { submissionId };
// }

// async function processSubmissionResults(submissionId: number, results: SubmissionResult[], submissionData: any) {
//     const batches = [];
//     for (let i = 0; i < results.length; i += SUBMISSION_BATCH_SIZE) {
//         batches.push(results.slice(i, i + SUBMISSION_BATCH_SIZE));
//     }

//     let allPassed = true;
//     let completed = false;

//     while (!completed) {
//         for (const batch of batches) {
//             try {
//                 const tokens = batch.map(result => result.token).join(',');
//                 const response = await axios.get(`${JUDGE0_API_URL}/submissions/batch`, {
//                     params: { tokens, fields: 'status,stdout,stderr' }
//                 });

//                 response.data.submissions.forEach((result: any) => {
//                     if (result.status.id === 1) { // 1 is the status ID for "In Queue"
//                         allPassed = false;
//                     } else if (result.status.id !== 3) { // 3 is the status ID for "Accepted"
//                         allPassed = false;
//                     }
//                 });

//                 // Check if all submissions are processed
//                 completed = response.data.submissions.every((result: any) => result.status.id !== 1);

//                 // Add delay between batches to prevent overloading
//                 await new Promise(resolve => setTimeout(resolve, 1000));
//             } catch (error) {
//                 console.error('Error processing batch:', error);
//                 allPassed = false;
//             }
//         }
//     }

//     // Update the submission status in the database
//     try {
//         await db.update(submissions)
//             .set({
//                 status: allPassed ? 'Accepted' : 'Rejected',
//                 marks: allPassed ? 15 : 0
//             })
//             .where(eq(submissions.submission_id, submissionId));

//         console.log(`Submission ID ${submissionId} updated to ${allPassed ? 'Accepted' : 'Rejected'}`);
//     } catch (error) {
//         console.error('Error updating submission status in the database:', error);
//     }

//     // Update Redis with the final status
//     const redisKey = `submission:${submissionId}`;
//     try {
//         await redis.set(redisKey, JSON.stringify({
//             results,
//             status: allPassed ? 'completed' : 'failed',
//             practicalId: submissionData.practicalId,
//             studentId: submissionData.studentId,
//             code: submissionData.code
//         }), { EX: RESULTS_EXPIRY });

//         console.log(`Redis key ${redisKey} updated with status ${allPassed ? 'completed' : 'failed'}`);
//     } catch (error) {
//         console.error('Error updating Redis with final status:', error);
//     }
// }

// export async function submitCode(submissionData: {
//     code: string;
//     language: string;
//     practicalId: number;
//     studentId: number;
// }) {
//     // Check for existing submission
//     const existingSubmission = await db
//         .select()
//         .from(submissions)
//         .where(
//             and(
//                 eq(submissions.practical_id, submissionData.practicalId),
//                 eq(submissions.student_id, submissionData.studentId)
//             )
//         )
//         .limit(1);

//     if (existingSubmission.length > 0) {
//         // Update the existing submission
//         await db.update(submissions)
//             .set({
//                 code_submitted: submissionData.code,
//                 status: 'Pending',
//                 submission_time: new Date()
//             })
//             .where(eq(submissions.submission_id, existingSubmission[0].submission_id));

//         // Fetch test cases
//         const testCases = await db
//             .select()
//             .from(prac_io)
//             .where(eq(prac_io.practical_id, submissionData.practicalId));

//         // Create batch submissions
//         const batchResults = await createBatchSubmissions(submissionData, testCases);

//         // Store initial submission data
//         const submissionId = existingSubmission[0].submission_id;

//         // Start processing results asynchronously
//         processSubmissionResults(submissionId, batchResults, submissionData).catch(console.error);

//         return { submissionId };
//     } else {
//         // Fetch test cases
//         const testCases = await db
//             .select()
//             .from(prac_io)
//             .where(eq(prac_io.practical_id, submissionData.practicalId));

//         // Create batch submissions
//         const batchResults = await createBatchSubmissions(submissionData, testCases);

//         // Store initial submission data
//         const submissionId = await storeSubmissionData(submissionData, batchResults);

//         // Start processing results asynchronously
//         processSubmissionResults(submissionId, batchResults, submissionData).catch(console.error);

//         return { submissionId };
//     }
// }

// async function processSubmissionResults(submissionId: number, results: SubmissionResult[], submissionData: any) {
//     const batches = [];
//     for (let i = 0; i < results.length; i += SUBMISSION_BATCH_SIZE) {
//         batches.push(results.slice(i, i + SUBMISSION_BATCH_SIZE));
//     }

//     let allPassed = true;
//     let completed = false;
//     let attempts = 0;
//     const MAX_ATTEMPTS = 10;
//     const DELAY_BETWEEN_ATTEMPTS = 5000; // 5 seconds

//     while (!completed && attempts < MAX_ATTEMPTS) {
//         attempts++;
//         let batchCompleted = true;

//         for (const batch of batches) {
//             try {
//                 const tokens = batch.map(result => result.token).join(',');
//                 const response = await axios.get(`${JUDGE0_API_URL}/submissions/batch`, {
//                     params: { tokens, fields: 'status,stdout,stderr' }
//                 });

//                 response.data.submissions.forEach((result: any, index: number) => {
//                     if (result.status.id === 1 || result.status.id === 2) { // In Queue or Processing
//                         batchCompleted = false;
//                     } else if (result.status.id !== 3) { // Not Accepted
//                         allPassed = false;
//                     }

//                     // Update the result in the results array
//                     results[batch[index].token] = {
//                         ...results[batch[index].token],
//                         status: result.status.description,
//                         actualOutput: result.stdout || result.stderr
//                     };
//                 });

//                 if (!batchCompleted) {
//                     break; // Exit the for loop if any submission is not completed
//                 }
//             } catch (error) {
//                 console.error('Error processing batch:', error);
//                 allPassed = false;
//                 batchCompleted = false;
//             }
//         }

//         completed = batchCompleted;

//         if (!completed) {
//             console.log(`Attempt ${attempts}: Some submissions are still processing. Waiting before next attempt...`);
//             await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_ATTEMPTS));
//         }
//     }

//     const finalStatus = completed ? (allPassed ? 'Accepted' : 'Rejected') : 'Timeout';

//     // Update the submission status in the database
//     try {
//         await db.update(submissions)
//             .set({
//                 status: finalStatus,
//                 marks: finalStatus === 'Accepted' ? 15 : 0
//             })
//             .where(eq(submissions.submission_id, submissionId));

//         console.log(`Submission ID ${submissionId} updated to ${finalStatus}`);
//     } catch (error) {
//         console.error('Error updating submission status in the database:', error);
//     }

//     // Update Redis with the final status
//     const redisKey = `submission:${submissionId}`;
//     try {
//         await redis.set(redisKey, JSON.stringify({
//             results,
//             status: finalStatus,
//             practicalId: submissionData.practicalId,
//             studentId: submissionData.studentId,
//             code: submissionData.code
//         }), { EX: RESULTS_EXPIRY });

//         console.log(`Redis key ${redisKey} updated with status ${finalStatus}`);
//     } catch (error) {
//         console.error('Error updating Redis with final status:', error);
//     }
// }

async function createBatchSubmissions(code: string, language: string, testCases: any[]): Promise<SubmissionResult[]> {
    const results: SubmissionResult[] = [];

    // Process test cases in batches
    for (let i = 0; i < testCases.length; i += BATCH_SIZE) {
        const batchTestCases = testCases.slice(i, i + BATCH_SIZE);
        const submissions = batchTestCases.map(testCase => ({
            source_code: code,
            language_id: language,
            stdin: testCase.input,
            expected_output: testCase.output,
            redirect_stderr_to_stdout: true
        }));

        const response = await axios.post(`${JUDGE0_API_URL}/submissions/batch`, { submissions });

        results.push(...response.data.map((result: any, index: number) => ({
            token: result.token,
            input: batchTestCases[index].input,
            expectedOutput: batchTestCases[index].output
        })));
    }

    return results;
}

async function pollBatchResults(tokens: string[]): Promise<any[]> {
    let attempts = 0;
    const results: any[] = [];

    while (attempts < MAX_POLL_ATTEMPTS) {
        const batchTokens = tokens.join(',');
        const response = await axios.get(`${JUDGE0_API_URL}/submissions/batch`, {
            params: {
                tokens: batchTokens,
                fields: 'token,status,stdout,stderr'
            }
        });

        const allCompleted = response.data.submissions.every((sub: any) =>
            sub.status.id !== 1 && sub.status.id !== 2); // Not In Queue or Processing

        if (allCompleted) {
            return response.data.submissions;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    throw new AppError(504, 'Submission processing timeout');
}

export async function submitCode(submissionData: {
    code: string;
    language: string;
    practicalId: number;
    studentId: number;
}) {
    // Fetch all test cases
    const testCases = await db
        .select()
        .from(prac_io)
        .where(eq(prac_io.practical_id, submissionData.practicalId));

    // Create batch submissions
    const batchResults = await createBatchSubmissions(
        submissionData.code,
        submissionData.language,
        testCases
    );

    // Store initial submission
    const [result] = await db.insert(submissions).values({
        practical_id: submissionData.practicalId,
        student_id: submissionData.studentId,
        code_submitted: submissionData.code,
        status: 'Pending',
        submission_time: new Date()
    });

    const submissionId = result.insertId;

    // Start processing results asynchronously
    processSubmissionResults(submissionId, batchResults).catch(console.error);

    return { submissionId };
}

async function processSubmissionResults(submissionId: number, results: SubmissionResult[]) {
    try {
        const tokens = results.map(r => r.token);
        const batchResults = await pollBatchResults(tokens);
        console.log(batchResults)
        const allPassed = batchResults.every(result => result.status.id === 3); // 3 = Accepted
        const status = allPassed ? 'Accepted' : 'Rejected';

        // Update database
        await db.update(submissions)
            .set({
                status,
                marks: allPassed ? 15 : 0
            })
            .where(eq(submissions.submission_id, submissionId));

        // Store results in Redis (without test case details)
        await redis.set(`submission:${submissionId}`, JSON.stringify({
            status,
            completed: true
        }), { EX: RESULTS_EXPIRY });

    } catch (error) {
        console.error('Error processing submission results:', error);
        await db.update(submissions)
            .set({ status: 'Rejected' })
            .where(eq(submissions.submission_id, submissionId));
    }
}

export async function getSubmissionStatus(submissionId: string) {
    const data = await redis.get(`submission:${submissionId}`);
    console.log(data);
    if (!data) {
        const [submission] = await db
            .select()
            .from(submissions)
            .where(eq(submissions.submission_id, parseInt(submissionId)))
            .limit(1);

        if (!submission) {
            throw new AppError(404, 'Submission not found');
        }

        return {
            status: submission.status,
            completed: submission.status !== 'Pending'
        };
    }

    return JSON.parse(data);
}

export async function updateSubmissionCode(submissionData: {
    submissionId: number;
    code: string;
    language: string;
    practicalId: number;
    studentId: number;
}) {
    // Fetch all test cases
    const testCases = await db
        .select()
        .from(prac_io)
        .where(eq(prac_io.practical_id, submissionData.practicalId));

    // Create batch submissions
    const batchResults = await createBatchSubmissions(
        submissionData.code,
        submissionData.language,
        testCases
    );

    // Update existing submission
    await db.update(submissions)
        .set({
            code_submitted: submissionData.code,
            status: 'Pending',
            submission_time: new Date()
        })
        .where(eq(submissions.submission_id, submissionData.submissionId));

    // Process results asynchronously
    processSubmissionResults(submissionData.submissionId, batchResults).catch(console.error);

    return { submissionId: submissionData.submissionId };
}
