export interface User {
    user_id: number;
    username: string;
    email: string;
    role: 'Student' | 'Faculty' | 'HOD';
    department_id?: number;
    photo_url?: string;
    batch_id?: number;
    roll_id?: string;
}

export interface Department {
    department_id: number;
    name: string;
}

export interface Batch {
    batch_id: number;
    department_id: number;
    semester: number;
    division: string;
    batch: string;
}

export interface Course {
    course_id: number;
    course_name: string;
    course_code: string;
    semester: number;
    department_id: number;
}

export interface Practical {
    practical_id: number;
    sr_no: number;
    practical_name: string;
    course_id: number;
    description: string;
    pdf_url?: string;
    prac_io: PracIO[];
    prac_language: PracLanguage[];
}

export interface PracIO {
    input: string;
    output: string;
    isPublic: boolean;
}

export interface PracLanguage {
    programming_language_id: number;
}

export interface UserPracticalAccess {
    user_practical_access_id: number;
    practical_id: number;
    batch: string;
    division: string;
    lock: boolean;
    deadline: string;
}

export interface Student extends User {
    semester: number;
    batch: string;
    roll_id: string;
    division: string;
}

export interface ProgrammingLanguage {
    programming_language_id: number;
    language_name: string;
}

export interface CourseFaculty {
    course_id: number;
    faculty_id: number;
    batch_id: number;
}

export interface Submission {
    submission_id: number;
    practical_id: number;
    student_id: number;
    submission_time: string;
    code_submitted: string;
}

export interface Report {
    report_id: number;
    report_name: string;
    student_id: number;
    generated_at: string;
    report_data: any;
}