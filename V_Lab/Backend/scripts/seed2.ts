import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";
import * as schema from "../src/models/schema";
import { db, poolConnection } from "../src/config/db";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function seed(): Promise<void> {
  try {
    // Disable foreign key checks
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

    // Truncate tables
    await db.execute(sql`TRUNCATE TABLE batch`);
    await db.execute(sql`TRUNCATE TABLE batch_practical_access`);
    await db.execute(sql`TRUNCATE TABLE courses`);
    await db.execute(sql`TRUNCATE TABLE courses_faculty`);
    await db.execute(sql`TRUNCATE TABLE departments`);
    await db.execute(sql`TRUNCATE TABLE faculty`);
    await db.execute(sql`TRUNCATE TABLE practicals`);
    await db.execute(sql`TRUNCATE TABLE prac_io`);
    await db.execute(sql`TRUNCATE TABLE prac_language`);
    await db.execute(sql`TRUNCATE TABLE programming_language`);
    await db.execute(sql`TRUNCATE TABLE reports`);
    await db.execute(sql`TRUNCATE TABLE students`);
    await db.execute(sql`TRUNCATE TABLE submissions`);
    await db.execute(sql`TRUNCATE TABLE users`);

    // Enable foreign key checks
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

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

    // Helper function to hash passwords
    const hashPassword = async (password: string): Promise<string> => {
      return await bcrypt.hash(password, 10);
    };

    // Seed departments table
    const departments = [
      { name: "Computer Science" },
      { name: "Information Technology" },
      { name: "Artificial Intelligence and Data Science" },
    ];

    for (const department of departments) {
      await db.insert(schema.departments).values(department);
    }

    console.log("Departments seeded successfully");

    // Fetch inserted departments
    const insertedDepartments = await db.select().from(schema.departments);

    // Seed users table with 1 Admin, 1 HOD for each department, and 5 Faculty members per department
    const adminInserts: any[] = [];
    const hodInserts: any[] = [];
    const facultyInserts: any[] = [];

    // Fetch the maximum user_id from the users table
    const [maxUserIdResult] = await db.execute(sql`SELECT MAX(user_id) as maxUserId FROM users`);
    let nextUserId = maxUserIdResult[0].maxUserId + 1;

    for (const dept of insertedDepartments) {
      const admin = {
        username: `admin_${dept.name.replace(/\s+/g, "_").toLowerCase()}`,
        password: await hashPassword("123456"),
        email: `admin_${dept.name.toLowerCase()}@example.com`.replace(/\s/g, ''),
        role: "Admin",
      };

      const hod = {
        username: `hod_${dept.name.replace(/\s+/g, "_").toLowerCase()}`,
        password: await hashPassword("123456"),
        email: `hod_${dept.name.toLowerCase()}@example.com`.replace(/\s/g, ''),
        role: "HOD",
      };

      adminInserts.push(admin);
      hodInserts.push(hod);

      // Insert 5 Faculty members for each department
      for (let i = 1; i <= 5; i++) {
        const facultyUsername = `${dept.name.replace(/\s+/g, "_").toLowerCase()}_faculty${i}`;
        const facultyEmail = `${facultyUsername}@example.com`;

        // Insert into users table first
        const [userResult] = await db.insert(schema.users).values({
          user_id: nextUserId,
          username: facultyUsername,
          password: await bcrypt.hash("123456", 10),
          email: facultyEmail,
          role: "Faculty",
        });
        try {

          // Insert into faculty table
          await db.insert(schema.faculty).values({
            faculty_id: nextUserId,
            department_id: dept.department_id,
          });
        } catch (error) {
          console.log(error)
        }

        nextUserId++;
      }
    }

    // Insert Admins and HODs
    await db.insert(schema.users).values([...adminInserts, ...hodInserts]);

    console.log("Admins, HODs, and Faculty seeded successfully");

    // Fetch inserted faculty
    const insertedFaculty = await db.select().from(schema.faculty);

    // Fetch inserted users (Admins, HODs, Faculty)
    const insertedUsers = await db.select().from(schema.users);

    // Mapping Departments to HODs and Faculty
    const deptToHODMap: Record<number, number> = {};
    const deptToFacultyMap: Record<number, number[]> = {};

    insertedDepartments.forEach((dept, index) => {
      deptToHODMap[dept.department_id] = insertedUsers[adminInserts.length + index].user_id;
      deptToFacultyMap[dept.department_id] = insertedUsers
        .filter((user) => user.role === "Faculty")
        .slice(index * 5, (index + 1) * 5)
        .map((faculty) => faculty.user_id);
    });

    // Create deptToFacultyMap
    for (const faculty of insertedFaculty) {
      if (!deptToFacultyMap[faculty.department_id]) {
        deptToFacultyMap[faculty.department_id] = [];
      }
      deptToFacultyMap[faculty.department_id].push(faculty.faculty_id);
    }

    // Seed batches
    const batchInserts: any[] = [];
    for (const dept of insertedDepartments) {
      for (let semester = 1; semester <= 8; semester++) {
        for (const division of ["A", "B"]) {
          for (let batchNum = 1; batchNum <= 4; batchNum++) {
            batchInserts.push({
              department_id: dept.department_id,
              semester,
              division,
              batch: batchNum.toString(),
            });
          }
        }
      }
    }
    await db.insert(schema.batch).values(batchInserts);
    console.log("Batches seeded successfully");

    // Fetch inserted batches
    const insertedBatches = await db.select().from(schema.batch);

    // Seed students
    for (const batch of insertedBatches) {
      for (let i = 1; i <= 5; i++) {
        const studentUsername = `student_${batch.department_id}_${batch.semester}_${batch.division}_${batch.batch}_${i}`;
        const studentEmail = `${studentUsername}@example.com`;

        // Create a new user entry for the student
        const student = {
          username: studentUsername,
          password: await hashPassword("123456"),
          email: studentEmail,
          role: "Student",
        };

        try {
          // Insert the user into the `users` table and get the inserted ID
          const [result] = await db.insert(schema.users).values(student);
          const studentId = result.insertId;

          // Add the student to the `students` table, using the inserted user_id
          await db.insert(schema.students).values({
            student_id: studentId,
            batch_id: batch.batch_id,
            roll_id: `ROLL${batch.semester}${batch.division}${batch.batch}${i}`,
          });

          console.log(`Student ${studentUsername} inserted successfully.`);
        } catch (error) {
          console.error(`Error inserting student ${studentUsername}:`, error);
        }
      }
    }

    // Seed courses table
    const courseInserts = [];
    const courseNames = [
      "Data Structures",
      "Database Management",
      "Operating Systems",
      "Artificial Intelligence",
      "Machine Learning",
    ];

    for (const dept of insertedDepartments) {
      for (let semester = 1; semester <= 8; semester++) {
        for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
          courseInserts.push({
            course_name: `${courseNames[i % courseNames.length]} Sem ${semester}`,
            course_code: `${dept.name.charAt(0).toUpperCase()}S${semester}C${i + 1}`,
            semester: semester,
            department_id: dept.department_id,
          });
        }
      }
    }

    await db.insert(schema.courses).values(courseInserts);
    console.log("Courses seeded successfully");

    // Fetch inserted courses
    const insertedCourses = await db.select().from(schema.courses);

    if (!insertedCourses || insertedCourses.length === 0) {
      throw new Error("No courses were inserted. Please check the seeding process.");
    }

    // Seed courses_faculty table
    const coursesFacultyInserts = [];

    for (const course of insertedCourses) {
      const departmentFaculties = deptToFacultyMap[course.department_id];
      if (!departmentFaculties || departmentFaculties.length === 0) {
        console.warn(`No faculties found for department ${course.department_id}`);
        continue;
      }
      const faculty = departmentFaculties[Math.floor(Math.random() * departmentFaculties.length)];
      const batches = insertedBatches.filter(
        (batch) =>
          batch.department_id === course.department_id &&
          batch.semester === course.semester
      );

      for (const batch of batches) {
        coursesFacultyInserts.push({
          course_id: course.course_id,
          faculty_id: faculty,
          batch_id: batch.batch_id,
        });
      }
    }

    await db.insert(schema.courses_faculty).values(coursesFacultyInserts);
    console.log("Courses-Faculty-Batch associations seeded successfully");

    // Seed practicals, prac_io, prac_language, batch_practical_access, and submissions
    const practicalNames = [
      "Practical 1",
      "Practical 2",
      "Practical 3",
      "Practical 4",
      "Practical 5",
    ];

    for (const course of insertedCourses) {
      for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
        // Insert the practical
        const practical = {
          practical_name: `${practicalNames[i % practicalNames.length]}`,
          course_id: course.course_id,
          description: `Description for ${practicalNames[i % practicalNames.length]} of ${course.course_name}`,
          pdf_url: `http://example.com/pdfs/${course.course_code}_${practicalNames[i % practicalNames.length].replace(/\s+/g, "_").toLowerCase()}.pdf`,
          sr_no: i + 1,
          department_id: course.department_id,  // Inherit department_id from the course
        };

        const [practicalResult] = await db.insert(schema.practicals).values(practical);
        const practicalId = practicalResult.insertId;

        // 1. Insert into prac_io
        const pracIoInserts = [];
        for (let j = 0; j < 3; j++) {  // Assuming 3 IO pairs for each practical
          pracIoInserts.push({
            practical_id: practicalId,
            input: `Input for practical ${practical.practical_name} ${j + 1}`,
            output: `Output for practical ${practical.practical_name} ${j + 1}`,
            isPublic: Math.random() > 0.5,  // Randomly set isPublic to true or false
          });
        }
        await db.insert(schema.prac_io).values(pracIoInserts);

        // 2. Insert into prac_language
        const languagesForPractical = languages.slice(0, 3); // Assuming each practical supports 3 languages
        const pracLanguageInserts = [];
        for (const lang of languagesForPractical) {
          pracLanguageInserts.push({
            practical_id: practicalId,
            programming_language_id: lang.id,
          });
        }
        await db.insert(schema.prac_language).values(pracLanguageInserts);

        // 3. Insert into batch_practical_access
        const batchesForPractical = insertedBatches.filter(
          (batch) => batch.department_id === course.department_id && batch.semester === course.semester
        );

        const batchPracticalAccessInserts = [];
        const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days later

        for (const batch of batchesForPractical) {
          batchPracticalAccessInserts.push({
            practical_id: practicalId,
            batch_id: batch.batch_id,
            lock: false, // Always set to false
            deadline: oneMonthLater, // Set to 30 days after the current date
          });
        }

        await db.insert(schema.batch_practical_access).values(batchPracticalAccessInserts);

      }
    }

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await poolConnection.end();
  }
}

seed();