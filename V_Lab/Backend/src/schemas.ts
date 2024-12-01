import { Type } from '@sinclair/typebox';

// User schemas
export const insertUserSchema = Type.Object({
    username: Type.String(),
    password: Type.String(),
    email: Type.String({ format: 'email' }),
    role: Type.Union([
        Type.Literal('Student'),
        Type.Literal('Faculty'),
        Type.Literal('HOD'),
        Type.Literal('Admin')
    ]),
    photo_url: Type.Optional(Type.String({ format: 'uri' })),
    department_id: Type.Optional(Type.Number()),
    batch_id: Type.Optional(Type.Number()),
    roll_id: Type.Optional(Type.String())
});

export const updateUserSchema = Type.Partial(insertUserSchema);

export const loginSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String()
});

// Department schema
export const insertDepartmentSchema = Type.Object({
    name: Type.String()
});

export const updateDepartmentSchema = Type.Partial(insertDepartmentSchema);

// Batch schema
export const insertBatchSchema = Type.Object({
    department_id: Type.Number(),
    semester: Type.Number(),
    division: Type.String(),
    batch: Type.String()
});

export const updateBatchSchema = Type.Partial(insertBatchSchema);

// Course schemas
export const insertCourseSchema = Type.Object({
    course_name: Type.String(),
    course_code: Type.String(),
    semester: Type.Number(),
    department_id: Type.Number()
});

export const updateCourseSchema = Type.Partial(insertCourseSchema);

// Practical schemas
export const insertPracticalSchema = Type.Object({
    sr_no: Type.Number(),
    practical_name: Type.String(),
    course_id: Type.Number(),
    description: Type.String(),
    // pdf_url: Type.Optional(Type.String({ format: 'uri' })),
    prac_io: Type.Array(Type.Object({
        input: Type.String(),
        output: Type.String(),
        isPublic: Type.Boolean()
    })),
    prac_language: Type.Array(Type.Object({
        programming_language_id: Type.Number()
    }))
});

export const updatePracticalSchema = Type.Partial(insertPracticalSchema);

// Batch Practical Access schemas
export const insertBatchPracticalAccessSchema = Type.Object({
    practical_id: Type.Number(),
    batch_id: Type.Number(),
    lock: Type.Boolean(),
    deadline: Type.String({ format: 'date-time' })
});

export const updateBatchPracticalAccessSchema = Type.Partial(insertBatchPracticalAccessSchema);

// Student schema
export const insertStudentSchema = Type.Intersect([
    insertUserSchema,
    Type.Object({
        batch_id: Type.Number(),
        roll_id: Type.String()
    })
]);

export const updateStudentSchema = Type.Partial(insertStudentSchema);

// Faculty schema
export const insertFacultySchema = Type.Intersect([
    insertUserSchema,
    Type.Object({
        department_id: Type.Number()
    })
]);

export const updateFacultySchema = Type.Partial(insertFacultySchema);

// Programming Language schema
export const insertProgrammingLanguageSchema = Type.Object({
    language_name: Type.String()
});

export const updateProgrammingLanguageSchema = Type.Partial(insertProgrammingLanguageSchema);

// Course Faculty schema
export const insertCourseFacultySchema = Type.Object({
    course_id: Type.Number(),
    faculty_id: Type.Number(),
    batch_id: Type.Number()
});

export const updateCourseFacultySchema = Type.Partial(insertCourseFacultySchema);

// Submission schema
export const insertSubmissionSchema = Type.Object({
    practical_id: Type.Number(),
    student_id: Type.Number(),
    submission_time: Type.String({ format: 'date-time' }),
    code_submitted: Type.String()
});

export const updateSubmissionSchema = Type.Partial(insertSubmissionSchema);

// Report schema
export const insertReportSchema = Type.Object({
    report_name: Type.String(),
    student_id: Type.Number(),
    generated_at: Type.String({ format: 'date-time' }),
    report_data: Type.Any()
});

export const updateReportSchema = Type.Partial(insertReportSchema);

// Select schemas

export const selectUserSchema = Type.Object({
    user_id: Type.Number(),
    username: Type.String(),
    email: Type.String({ format: 'email' }),
    role: Type.Union([
        Type.Literal('Student'),
        Type.Literal('Faculty'),
        Type.Literal('HOD'),
        Type.Literal('Admin')
    ]),
    photo_url: Type.Optional(Type.String({ format: 'uri' }))
});

export const selectDepartmentSchema = Type.Object({
    department_id: Type.Number(),
    name: Type.String()
});

export const selectBatchSchema = Type.Object({
    batch_id: Type.Number(),
    department_id: Type.Number(),
    semester: Type.Number(),
    division: Type.String(),
    batch: Type.String()
});

export const selectCourseSchema = Type.Object({
    course_id: Type.Number(),
    course_name: Type.String(),
    course_code: Type.String(),
    semester: Type.Number(),
    department_id: Type.Number()
});

export const selectPracticalSchema = Type.Object({
    practical_id: Type.Number(),
    practical_name: Type.String(),
    course_id: Type.Number(),
    description: Type.String(),
    pdf_url: Type.Optional(Type.String({ format: 'uri' }))
});

export const selectBatchPracticalAccessSchema = Type.Object({
    batch_practical_access_id: Type.Number(),
    practical_id: Type.Number(),
    batch_id: Type.Number(),
    lock: Type.Boolean(),
    deadline: Type.String({ format: 'date-time' })
});

export const selectStudentSchema = Type.Intersect([
    selectUserSchema,
    Type.Object({
        batch_id: Type.Number(),
        roll_id: Type.String()
    })
]);

export const selectFacultySchema = Type.Intersect([
    selectUserSchema,
    Type.Object({
        department_id: Type.Number()
    })
]);

export const selectProgrammingLanguageSchema = Type.Object({
    programming_language_id: Type.Number(),
    language_name: Type.String()
});

export const selectPracIOSchema = Type.Object({
    prac_io_id: Type.Number(),
    practical_id: Type.Number(),
    input: Type.String(),
    output: Type.String(),
    isPublic: Type.Boolean()
});

export const selectPracLanguageSchema = Type.Object({
    prac_language_id: Type.Number(),
    practical_id: Type.Number(),
    programming_language_id: Type.Number()
});

export const selectSubmissionSchema = Type.Object({
    submission_id: Type.Number(),
    practical_id: Type.Number(),
    student_id: Type.Number(),
    submission_time: Type.String({ format: 'date-time' }),
    code_submitted: Type.String()
});

export const selectReportSchema = Type.Object({
    report_id: Type.Number(),
    report_name: Type.String(),
    student_id: Type.Number(),
    generated_at: Type.String({ format: 'date-time' }),
    report_data: Type.Any()
});

export const selectCourseFacultySchema = Type.Object({
    course_id: Type.Number(),
    faculty_id: Type.Number(),
    batch_id: Type.Number()
});

// You might also want to create more complex select schemas for joined data

export const selectCourseWithFacultySchema = Type.Object({
    ...selectCourseSchema.properties,
    faculty: Type.Array(selectFacultySchema)
});

export const selectPracticalWithDetailsSchema = Type.Object({
    ...selectPracticalSchema.properties,
    prac_io: Type.Array(selectPracIOSchema),
    prac_language: Type.Array(selectPracLanguageSchema)
});

export const selectStudentWithBatchSchema = Type.Object({
    ...selectStudentSchema.properties,
    batch: selectBatchSchema
});