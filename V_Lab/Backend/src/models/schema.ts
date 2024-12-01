import { mysqlTable, int, varchar, text, boolean, datetime, json, primaryKey, mysqlEnum, tinyint, smallint, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
dotenv.config();

export const programming_language = mysqlTable('programming_language', {
    programming_language_id: smallint('programming_language').primaryKey().autoincrement(),
    language_name: varchar('language_name', { length: 40 }).notNull(),
}, (table) => ({
    languageNameIndex: index('language_name_idx').on(table.language_name),
}));

export const departments = mysqlTable('departments', {
    department_id: int('department_id').primaryKey().autoincrement(),
    name: varchar('name', { length: 225 }).notNull(),
}, (table) => ({
    nameIndex: index('name_idx').on(table.name),
}));

export const users = mysqlTable('users', {
    user_id: int('user_id').primaryKey().autoincrement(),
    username: varchar('username', { length: 225 }).notNull(),
    password: varchar('password', { length: 225 }).notNull(),
    email: varchar('email', { length: 225 }).notNull(),
    role: mysqlEnum('role', ['Student', 'Faculty', 'HOD', 'Admin']).notNull(),
    // photo_url: varchar('pdf_url', { length: 255 }), // Added field for storing PDF URL
}, (table) => ({
    usernameIndex: index('username_idx').on(table.username),
    emailIndex: index('email_idx').on(table.email),
    roleIndex: index('role_idx').on(table.role),
}));

export const batch = mysqlTable('batch', {
    batch_id: int('batch_id').primaryKey().autoincrement(),
    department_id: int('department_id').notNull().references(() => departments.department_id),
    semester: tinyint('semester').notNull(),
    division: varchar('division', { length: 2 }).notNull(),
    batch: varchar('batch', { length: 2 }).notNull(),
}, (table) => ({
    departmentIdIndex: index('department_id_idx').on(table.department_id),
    semesterIndex: index('semester_idx').on(table.semester),
    divisionIndex: index('division_idx').on(table.division),
    batchIndex: index('batch_idx').on(table.batch),
}));

export const students = mysqlTable('students', {
    student_id: int('student_id').primaryKey().references(() => users.user_id),
    batch_id: int('batch_id').notNull().references(() => batch.batch_id),
    roll_id: varchar('roll_id', { length: 20 }).notNull(),
}, (table) => ({
    batchIdIndex: index('batch_id_idx').on(table.batch_id),
}));

export const faculty = mysqlTable('faculty', {
    faculty_id: int('faculty_id').primaryKey().references(() => users.user_id),
    department_id: int('department_id').notNull().references(() => departments.department_id),
}, (table) => ({
    departmentIdIndex: index('department_id_idx').on(table.department_id),
}));

export const courses = mysqlTable('courses', {
    course_id: int('course_id').primaryKey().autoincrement(),
    course_name: varchar('course_name', { length: 225 }).notNull(),
    course_code: varchar('course_code', { length: 225 }).notNull(),
    semester: tinyint('semester').notNull(),
    department_id: int('department_id').notNull().references(() => departments.department_id),
}, (table) => ({
    courseNameIndex: index('course_name_idx').on(table.course_name),
    semesterIndex: index('semester_idx').on(table.semester),
    departmentIdIndex: index('department_id_idx').on(table.department_id),
}));

export const courses_faculty = mysqlTable('courses_faculty', {
    course_id: int('course_id').notNull().references(() => courses.course_id),
    faculty_id: int('faculty_id').notNull().references(() => faculty.faculty_id),
    batch_id: int('batch_id').notNull().references(() => batch.batch_id),
}, (table) => ({
    pk: primaryKey({ columns: [table.course_id, table.faculty_id, table.batch_id] }),
    courseIdIndex: index('course_id_idx').on(table.course_id),
    facultyIdIndex: index('faculty_id_idx').on(table.faculty_id),
    batchIdIndex: index('batch_id_idx').on(table.batch_id),
}));

export const practicals = mysqlTable('practicals', {
    practical_id: int('practical_id').primaryKey().autoincrement(),
    sr_no: int('sr_no').notNull(),
    practical_name: varchar('practical_name', { length: 225 }).notNull(),
    course_id: int('course_id')
        .notNull()
        .references(() => courses.course_id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    pdf_url: varchar('pdf_url', { length: 255 }),
}, (table) => ({
    practicalNameIndex: index('practical_name_idx').on(table.practical_name),
    courseIdIndex: index('course_id_idx').on(table.course_id),
}));

export const prac_io = mysqlTable('prac_io', {
    prac_io_id: int('prac_io_id').primaryKey().autoincrement(),
    practical_id: int('practical_id')
        .notNull()
        .references(() => practicals.practical_id, { onDelete: 'cascade' }),
    input: text('input').notNull(),
    output: text('output').notNull(),
    isPublic: boolean('is_public').notNull().default(false),
}, (table) => ({
    practicalIdIndex: index('practical_id_idx').on(table.practical_id),
    isPublicIndex: index('is_public_idx').on(table.isPublic),
}));

export const prac_language = mysqlTable('prac_language', {
    prac_language_id: int('prac_language_id').primaryKey().autoincrement(),
    practical_id: int('practical_id')
        .notNull()
        .references(() => practicals.practical_id, { onDelete: 'cascade' }),
    programming_language_id: smallint('programming_language_id')
        .notNull()
        .references(() => programming_language.programming_language_id)
}, (table) => ({
}));

export const batch_practical_access = mysqlTable('batch_practical_access', {
    batch_practical_access_id: int('batch_practical_access_id').primaryKey().autoincrement(),
    practical_id: int('practical_id')
        .notNull()
        .references(() => practicals.practical_id, { onDelete: 'cascade' }),
    batch_id: int('batch_id')
        .notNull()
        .references(() => batch.batch_id),
    lock: boolean('lock').notNull(),
    deadline: datetime('deadline'),
}, (table) => ({
    practicalIdIndex: index('practical_id_idx').on(table.practical_id),
    batchIdIndex: index('batch_id_idx').on(table.batch_id),
    lockIndex: index('lock_idx').on(table.lock),
    deadlineIndex: index('deadline_idx').on(table.deadline),
}));

export const submissions = mysqlTable('submissions', {
    submission_id: int('submission_id').primaryKey().autoincrement(),
    practical_id: int('practical_id')
        .notNull()
        .references(() => practicals.practical_id, { onDelete: 'cascade' }),
    student_id: int('student_id')
        .notNull()
        .references(() => students.student_id),
    code_submitted: text('code_submitted').notNull(),
    status: mysqlEnum('status', ['Accepted', 'Rejected', 'Pending']).notNull().default('Pending'),
    marks: int('marks').default(0),
    submission_time: datetime('submission_time').default(sql`now(3)`),
}, (table) => ({
    practicalIndex: index('practical_idx').on(table.practical_id),
    studentIndex: index('student_idx').on(table.student_id),
}));

// export const practicals = mysqlTable('practicals', {
//     practical_id: int('practical_id').primaryKey().autoincrement(),
//     sr_no: int('sr_no').notNull(),
//     practical_name: varchar('practical_name', { length: 225 }).notNull(),
//     course_id: int('course_id').notNull().references(() => courses.course_id),
//     description: text('description').notNull(),
//     pdf_url: varchar('pdf_url', { length: 255 }), // Added field for storing PDF URL
// }, (table) => ({
//     practicalNameIndex: index('practical_name_idx').on(table.practical_name),
//     courseIdIndex: index('course_id_idx').on(table.course_id),
// }));

// export const prac_io = mysqlTable('prac_io', {
//     prac_io_id: int('prac_io_id').primaryKey().autoincrement(),
//     practical_id: int('practical_id').notNull().references(() => practicals.practical_id),
//     input: text('input').notNull(),
//     output: text('output').notNull(),
//     isPublic: boolean('is_public').notNull().default(false), // Added isPublic field
// }, (table) => ({
//     practicalIdIndex: index('practical_id_idx').on(table.practical_id),
//     isPublicIndex: index('is_public_idx').on(table.isPublic), // Added index for isPublic
// }));

// export const prac_language = mysqlTable('prac_language', {
//     prac_language_id: int('prac_language_id').primaryKey().autoincrement(),
//     practical_id: int('practical_id').notNull().references(() => practicals.practical_id),
//     programming_language_id: smallint('programming_language_id').notNull().references(() => programming_language.programming_language_id)
// }, (table) => ({
//     // practicalIdIndex: index('practical_id_idx').on(table.practical_id),
// }));

// export const batch_practical_access = mysqlTable('batch_practical_access', {
//     batch_practical_access_id: int('batch_practical_access_id').primaryKey().autoincrement(),
//     practical_id: int('practical_id').notNull().references(() => practicals.practical_id),
//     batch_id: int('batch_id').notNull().references(() => batch.batch_id),
//     lock: boolean('lock').notNull(),
//     deadline: datetime('deadline'),
// }, (table) => ({
//     practicalIdIndex: index('practical_id_idx').on(table.practical_id),
//     batchIdIndex: index('batch_id_idx').on(table.batch_id),
//     lockIndex: index('lock_idx').on(table.lock),
//     deadlineIndex: index('deadline_idx').on(table.deadline),
// }));


// export const submissions = mysqlTable('submissions', {
//     submission_id: int('submission_id').primaryKey().autoincrement(),
//     practical_id: int('practical_id')
//         .notNull()
//         .references(() => practicals.practical_id),
//     student_id: int('student_id')
//         .notNull()
//         .references(() => students.student_id),
//     // programming_language_id: int('programming_language_id')
//     //     .notNull()
//     //     .references(() => programming_language.programming_language_id),
//     code_submitted: text('code_submitted').notNull(),
//     status: mysqlEnum('status', ['Accepted', 'Rejected', 'Pending']).notNull().default('Pending'),
//     marks: int('marks').default(0),
//     submission_time: datetime('submission_time').default(sql`now(3)`),
// },
//     (table) => ({
//         practicalIndex: index('practical_idx').on(table.practical_id),
//         studentIndex: index('student_idx').on(table.student_id),
//     }));


export const reports = mysqlTable('reports', {
    report_id: int('report_id').primaryKey().autoincrement(),
    report_name: text('report_name').notNull(),
    student_id: int('student_id').notNull().references(() => users.user_id),
    generated_at: datetime('generated_at').notNull(),
    report_data: json('report_data').notNull(),
}, (table) => ({
    studentIdIndex: index('student_id_idx').on(table.student_id),
    generatedAtIndex: index('generated_at_idx').on(table.generated_at),
}));


// relations
export const departmentsRelations = relations(departments, ({ many }) => ({
    faculty: many(faculty),
    courses: many(courses),
    batches: many(batch),
}));

export const usersRelations = relations(users, ({ one }) => ({
    student: one(students, {
        fields: [users.user_id],
        references: [students.student_id],
    }),
    faculty: one(faculty, {
        fields: [users.user_id],
        references: [faculty.faculty_id],
    }),
}));

export const batchRelations = relations(batch, ({ one, many }) => ({
    department: one(departments, {
        fields: [batch.department_id],
        references: [departments.department_id],
    }),
    students: many(students),
    coursesFaculty: many(courses_faculty),
}));

export const studentsRelations = relations(students, ({ one }) => ({
    user: one(users, {
        fields: [students.student_id],
        references: [users.user_id],
    }),
    batch: one(batch, {
        fields: [students.batch_id],
        references: [batch.batch_id],
    }),
}));

export const facultyRelations = relations(faculty, ({ one, many }) => ({
    user: one(users, {
        fields: [faculty.faculty_id],
        references: [users.user_id],
    }),
    department: one(departments, {
        fields: [faculty.department_id],
        references: [departments.department_id],
    }),
    coursesFaculty: many(courses_faculty),
}));

export const coursesRelations = relations(courses, ({ many, one }) => ({
    department: one(departments, {
        fields: [courses.department_id],
        references: [departments.department_id],
    }),
    faculty: many(courses_faculty),
    practicals: many(practicals),
}));

export const coursesFacultyRelations = relations(courses_faculty, ({ one }) => ({
    course: one(courses, {
        fields: [courses_faculty.course_id],
        references: [courses.course_id],
    }),
    faculty: one(faculty, {
        fields: [courses_faculty.faculty_id],
        references: [faculty.faculty_id],
    }),
    batch: one(batch, {
        fields: [courses_faculty.batch_id],
        references: [batch.batch_id],
    }),
}));

export const practicalsRelations = relations(practicals, ({ one, many }) => ({
    course: one(courses, {
        fields: [practicals.course_id],
        references: [courses.course_id],
    }),
    pracIo: many(prac_io),
    pracLanguage: many(prac_language),
    batchPracticalAccess: many(batch_practical_access),
    submissions: many(submissions),
}));

export const pracIoRelations = relations(prac_io, ({ one }) => ({
    practical: one(practicals, {
        fields: [prac_io.practical_id],
        references: [practicals.practical_id],
    }),
}));

export const pracLanguageRelations = relations(prac_language, ({ one }) => ({
    practical: one(practicals, {
        fields: [prac_language.practical_id],
        references: [practicals.practical_id],
    }),
    programmingLanguage: one(programming_language, {
        fields: [prac_language.programming_language_id],
        references: [programming_language.programming_language_id],
    }),
}));

export const batchPracticalAccessRelations = relations(batch_practical_access, ({ one }) => ({
    practical: one(practicals, {
        fields: [batch_practical_access.practical_id],
        references: [practicals.practical_id],
    }),
    batch: one(batch, {
        fields: [batch_practical_access.batch_id],
        references: [batch.batch_id],
    }),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
    practical: one(practicals, {
        fields: [submissions.practical_id],
        references: [practicals.practical_id],
    }),
    student: one(students, {
        fields: [submissions.student_id],
        references: [students.student_id],
    }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
    student: one(students, {
        fields: [reports.student_id],
        references: [students.student_id],
    }),
}));