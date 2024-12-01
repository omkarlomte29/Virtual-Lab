import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';
import * as schema from '../src/models/schema';
import { db, poolConnection } from '../src/config/db';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

async function seed() {
    try {
        // Drop all tables
        // await db.execute(sql`TRUNCATE TABLE reports`);
        // await db.execute(sql`TRUNCATE TABLE submissions`);
        // await db.execute(sql`TRUNCATE TABLE batch_practical_access`);
        // await db.execute(sql`TRUNCATE TABLE prac_language`);
        // await db.execute(sql`TRUNCATE TABLE prac_io`);
        // await db.execute(sql`TRUNCATE TABLE practicals`);
        // await db.execute(sql`TRUNCATE TABLE courses_faculty`);
        // await db.execute(sql`TRUNCATE TABLE courses`);
        // await db.execute(sql`TRUNCATE TABLE faculty`);
        // await db.execute(sql`TRUNCATE TABLE students`);
        // await db.execute(sql`TRUNCATE TABLE batch`);
        // await db.execute(sql`TRUNCATE TABLE users`);
        // await db.execute(sql`TRUNCATE TABLE departments`);
        // await db.execute(sql`TRUNCATE TABLE programming_language`);

        // console.log('All tables dropped successfully');

        // Helper function to hash passwords
        const hashPassword = async (password) => await bcrypt.hash(password, 10);

        // Seed programming_language table
        const languages = [
            { "id": 45, "name": "Assembly (NASM 2.14.02)" }, { "id": 46, "name": "Bash (5.0.0)" }, { "id": 47, "name": "Basic (FBC 1.07.1)" },
            { "id": 75, "name": "C (Clang 7.0.1)" }, { "id": 76, "name": "C++ (Clang 7.0.1)" }, { "id": 48, "name": "C (GCC 7.4.0)" },
            { "id": 52, "name": "C++ (GCC 7.4.0)" }, { "id": 49, "name": "C (GCC 8.3.0)" }, { "id": 53, "name": "C++ (GCC 8.3.0)" },
            { "id": 50, "name": "C (GCC 9.2.0)" }, { "id": 54, "name": "C++ (GCC 9.2.0)" }, { "id": 86, "name": "Clojure (1.10.1)" },
            { "id": 51, "name": "C# (Mono 6.6.0.161)" }, { "id": 77, "name": "COBOL (GnuCOBOL 2.2)" }, { "id": 55, "name": "Common Lisp (SBCL 2.0.0)" },
            { "id": 90, "name": "Dart (2.19.2)" }, { "id": 56, "name": "D (DMD 2.089.1)" }, { "id": 57, "name": "Elixir (1.9.4)" },
            { "id": 58, "name": "Erlang (OTP 22.2)" }, { "id": 44, "name": "Executable" }, { "id": 87, "name": "F# (.NET Core SDK 3.1.202)" },
            { "id": 59, "name": "Fortran (GFortran 9.2.0)" }, { "id": 60, "name": "Go (1.13.5)" }, { "id": 95, "name": "Go (1.18.5)" },
            { "id": 88, "name": "Groovy (3.0.3)" }, { "id": 61, "name": "Haskell (GHC 8.8.1)" }, { "id": 96, "name": "JavaFX (JDK 17.0.6, OpenJFX 22.0.2)" },
            { "id": 91, "name": "Java (JDK 17.0.6)" }, { "id": 62, "name": "Java (OpenJDK 13.0.1)" }, { "id": 63, "name": "JavaScript (Node.js 12.14.0)" },
            { "id": 93, "name": "JavaScript (Node.js 18.15.0)" }, { "id": 78, "name": "Kotlin (1.3.70)" }, { "id": 64, "name": "Lua (5.3.5)" },
            { "id": 89, "name": "Multi-file program" }, { "id": 79, "name": "Objective-C (Clang 7.0.1)" }, { "id": 65, "name": "OCaml (4.09.0)" },
            { "id": 66, "name": "Octave (5.1.0)" }, { "id": 67, "name": "Pascal (FPC 3.0.4)" }, { "id": 85, "name": "Perl (5.28.1)" },
            { "id": 68, "name": "PHP (7.4.1)" }, { "id": 43, "name": "Plain Text" }, { "id": 69, "name": "Prolog (GNU Prolog 1.4.5)" },
            { "id": 70, "name": "Python (2.7.17)" }, { "id": 92, "name": "Python (3.11.2)" }, { "id": 71, "name": "Python (3.8.1)" },
            { "id": 80, "name": "R (4.0.0)" }, { "id": 72, "name": "Ruby (2.7.0)" }, { "id": 73, "name": "Rust (1.40.0)" },
            { "id": 81, "name": "Scala (2.13.2)" }, { "id": 82, "name": "SQL (SQLite 3.27.2)" }, { "id": 83, "name": "Swift (5.2.3)" },
            { "id": 74, "name": "TypeScript (3.7.4)" }, { "id": 94, "name": "TypeScript (5.0.3)" }, { "id": 84, "name": "Visual Basic.Net (vbnc 0.0.0.5943)" }
        ];

        for (const lang of languages) {
            await db.insert(schema.programming_language).values({
                programming_language_id: lang.id,
                language_name: lang.name
            });
        }

        console.log('Programming languages seeded successfully');

        // Seed departments table
        await db.insert(schema.departments).values([
            { name: 'Computer Science' },
            { name: 'Information Technology' },
            { name: 'Electronics' },
            { name: 'Mechanical Engineering' },
        ]);

        // Seed users table
        const userInserts = [
            { username: 'john_doe', password: await hashPassword('123456'), email: 'john.doe@example.com', role: 'Student' },
            { username: 'jane_smith', password: await hashPassword('123456'), email: 'jane.smith@example.com', role: 'Faculty' },
            { username: 'alice_johnson', password: await hashPassword('123456'), email: 'alice.johnson@example.com', role: 'HOD' },
            { username: 'bob_wilson', password: await hashPassword('123456'), email: 'bob.wilson@example.com', role: 'Admin' },
            { username: 'emma_brown', password: await hashPassword('123456'), email: 'emma.brown@example.com', role: 'Student' },
            { username: 'michael_davis', password: await hashPassword('123456'), email: 'michael.davis@example.com', role: 'Faculty' },
        ];

        for (const user of userInserts) {
            await db.insert(schema.users).values(user);
        }

        // Fetch inserted users
        const insertedUsers = await db.select().from(schema.users);

        // Seed batch table
        const batchInserts = [
            { department_id: 1, semester: 3, division: 'A', batch: '1' },
            { department_id: 1, semester: 3, division: 'B', batch: '1' },
            { department_id: 2, semester: 4, division: 'A', batch: '2' },
            { department_id: 3, semester: 5, division: 'A', batch: '1' },
        ];

        for (const batch of batchInserts) {
            await db.insert(schema.batch).values(batch);
        }

        // Fetch inserted batches
        const insertedBatches = await db.select().from(schema.batch);

        // Seed students table
        await db.insert(schema.students).values([
            { student_id: insertedUsers[0].user_id, batch_id: insertedBatches[0].batch_id, roll_id: 'CS2101' },
            { student_id: insertedUsers[4].user_id, batch_id: insertedBatches[1].batch_id, roll_id: 'IT2201' },
        ]);

        // Seed faculty table
        await db.insert(schema.faculty).values([
            { faculty_id: insertedUsers[1].user_id, department_id: 1 },
            { faculty_id: insertedUsers[5].user_id, department_id: 2 },
        ]);

        // Seed courses table
        const courseInserts = [
            { course_name: 'Data Structures', course_code: 'CS201', semester: 3, department_id: 1 },
            { course_name: 'Database Management', course_code: 'IT202', semester: 4, department_id: 2 },
            { course_name: 'Digital Electronics', course_code: 'EC301', semester: 5, department_id: 3 },
            { course_name: 'Web Development', course_code: 'CS301', semester: 3, department_id: 1 },
        ];

        for (const course of courseInserts) {
            await db.insert(schema.courses).values(course);
        }

        // Fetch inserted courses
        const insertedCourses = await db.select().from(schema.courses);

        // Seed courses_faculty table
        await db.insert(schema.courses_faculty).values([
            { course_id: insertedCourses[0].course_id, faculty_id: insertedUsers[1].user_id, batch_id: insertedBatches[0].batch_id },
            { course_id: insertedCourses[1].course_id, faculty_id: insertedUsers[5].user_id, batch_id: insertedBatches[2].batch_id },
            { course_id: insertedCourses[3].course_id, faculty_id: insertedUsers[1].user_id, batch_id: insertedBatches[1].batch_id },
        ]);

        // Seed practicals table
        const practicalInserts = [
            { sr_no: 1, practical_name: 'Implement Linked List', course_id: insertedCourses[0].course_id, description: 'Create a linked list data structure and perform basic operations.' },
            { sr_no: 2, practical_name: 'SQL Queries', course_id: insertedCourses[1].course_id, description: 'Write SQL queries for various database operations.' },
            { sr_no: 3, practical_name: 'HTML/CSS Layout', course_id: insertedCourses[3].course_id, description: 'Create a responsive web page layout using HTML and CSS.' },
        ];

        for (const practical of practicalInserts) {
            await db.insert(schema.practicals).values(practical);
        }

        // Fetch inserted practicals
        const insertedPracticals = await db.select().from(schema.practicals);

        // Seed prac_io table
        await db.insert(schema.prac_io).values([
            { practical_id: insertedPracticals[0].practical_id, input: 'Insert 5, 10, 15', output: 'Linked List: 5 -> 10 -> 15', isPublic: true },
            { practical_id: insertedPracticals[1].practical_id, input: 'SELECT * FROM users', output: 'Table with user data', isPublic: true },
            { practical_id: insertedPracticals[2].practical_id, input: 'N/A', output: 'A responsive webpage', isPublic: false },
        ]);

        // Seed prac_language table
        await db.insert(schema.prac_language).values([
            { practical_id: insertedPracticals[0].practical_id, programming_language_id: 71 }, // Python (3.8.1)
            { practical_id: insertedPracticals[0].practical_id, programming_language_id: 62 }, // Java (OpenJDK 13.0.1)
            { practical_id: insertedPracticals[1].practical_id, programming_language_id: 82 }, // SQL (SQLite 3.27.2)
            { practical_id: insertedPracticals[2].practical_id, programming_language_id: 63 }, // JavaScript (Node.js 12.14.0)
        ]);

        // Seed batch_practical_access table
        await db.insert(schema.batch_practical_access).values([
            { practical_id: insertedPracticals[0].practical_id, batch_id: insertedBatches[0].batch_id, lock: false, deadline: new Date('2024-09-15T23:59:59') },
            { practical_id: insertedPracticals[1].practical_id, batch_id: insertedBatches[2].batch_id, lock: false, deadline: new Date('2024-09-20T23:59:59') },
            { practical_id: insertedPracticals[2].practical_id, batch_id: insertedBatches[1].batch_id, lock: false, deadline: new Date('2024-09-25T23:59:59') },
        ]);

        // Seed submissions table
        await db.insert(schema.submissions).values([
            {
                practical_id: insertedPracticals[0].practical_id,
                student_id: insertedUsers[0].user_id,
                submission_time: new Date('2024-09-10T14:30:00'),
                code_submitted: `
    class Node:
        def __init__(self, data):
            self.data = data
            self.next = None
    
    class LinkedList:
        def __init__(self):
            self.head = None
    
        def insert(self, data):
            new_node = Node(data)
            if not self.head:
                self.head = new_node
            else:
                current = self.head
                while current.next:
                    current = current.next
                current.next = new_node
    
    # Usage
    ll = LinkedList()
    ll.insert(5)
    ll.insert(10)
    ll.insert(15)
            `
            },
            {
                practical_id: insertedPracticals[1].practical_id,
                student_id: insertedUsers[4].user_id,
                submission_time: new Date('2024-09-18T16:45:00'),
                code_submitted: `
    SELECT * FROM users WHERE role = 'Student';
    SELECT course_name, faculty.name FROM courses
    JOIN courses_faculty ON courses.course_id = courses_faculty.course_id
    JOIN faculty ON courses_faculty.faculty_id = faculty.faculty_id;
            `
            },
        ]);

        // Seed reports table
        await db.insert(schema.reports).values([
            {
                report_name: 'Semester Progress Report',
                student_id: insertedUsers[0].user_id,
                generated_at: new Date('2024-12-15T10:00:00'),
                report_data: JSON.stringify({
                    courses: [
                        { name: 'Data Structures', grade: 'A' },
                        { name: 'Web Development', grade: 'B+' }
                    ],
                    gpa: 3.7
                })
            },
            {
                report_name: 'Practical Submission Report',
                student_id: insertedUsers[4].user_id,
                generated_at: new Date('2024-12-20T11:30:00'),
                report_data: JSON.stringify({
                    practicals: [
                        { name: 'SQL Queries', submission_date: '2024-09-18', score: 90 }
                    ],
                    total_score: 90,
                    max_score: 100
                })
            },
        ]);

        console.log('Seed data inserted successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await poolConnection.end();
    }
}

seed();