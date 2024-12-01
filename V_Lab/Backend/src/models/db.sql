CREATE TABLE `batch` (
	`batch_id` int AUTO_INCREMENT NOT NULL,
	`department_id` int NOT NULL,
	`semester` tinyint NOT NULL,
	`division` varchar(2) NOT NULL,
	`batch` varchar(2) NOT NULL,
	CONSTRAINT `batch_batch_id` PRIMARY KEY(`batch_id`)
);

CREATE TABLE `batch_practical_access` (
	`batch_practical_access_id` int AUTO_INCREMENT NOT NULL,
	`practical_id` int NOT NULL,
	`batch_id` int NOT NULL,
	`lock` boolean NOT NULL,
	`deadline` datetime,
	CONSTRAINT `batch_practical_access_batch_practical_access_id` PRIMARY KEY(`batch_practical_access_id`)
);

CREATE TABLE `courses` (
	`course_id` int AUTO_INCREMENT NOT NULL,
	`course_name` varchar(225) NOT NULL,
	`course_code` varchar(225) NOT NULL,
	`semester` tinyint NOT NULL,
	`department_id` int NOT NULL,
	CONSTRAINT `courses_course_id` PRIMARY KEY(`course_id`)
);

CREATE TABLE `courses_faculty` (
	`course_id` int NOT NULL,
	`faculty_id` int NOT NULL,
	`batch_id` int NOT NULL,
	CONSTRAINT `courses_faculty_course_id_faculty_id_batch_id_pk` PRIMARY KEY(`course_id`,`faculty_id`,`batch_id`)
);

CREATE TABLE `departments` (
	`department_id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(225) NOT NULL,
	CONSTRAINT `departments_department_id` PRIMARY KEY(`department_id`)
);

CREATE TABLE `faculty` (
	`faculty_id` int NOT NULL,
	`department_id` int NOT NULL,
	CONSTRAINT `faculty_faculty_id` PRIMARY KEY(`faculty_id`)
);

CREATE TABLE `prac_io` (
	`prac_io_id` int AUTO_INCREMENT NOT NULL,
	`practical_id` int NOT NULL,
	`input` text NOT NULL,
	`output` text NOT NULL,
	`is_public` boolean NOT NULL DEFAULT false,
	CONSTRAINT `prac_io_prac_io_id` PRIMARY KEY(`prac_io_id`)
);

CREATE TABLE `prac_language` (
	`prac_language_id` int AUTO_INCREMENT NOT NULL,
	`practical_id` int NOT NULL,
	`programming_language_id` smallint NOT NULL,
	CONSTRAINT `prac_language_prac_language_id` PRIMARY KEY(`prac_language_id`)
);

CREATE TABLE `practicals` (
	`practical_id` int AUTO_INCREMENT NOT NULL,
	`sr_no` int NOT NULL,
	`practical_name` varchar(225) NOT NULL,
	`course_id` int NOT NULL,
	`description` text NOT NULL,
	`pdf_url` varchar(255),
	CONSTRAINT `practicals_practical_id` PRIMARY KEY(`practical_id`)
);

CREATE TABLE `programming_language` (
	`programming_language` smallint AUTO_INCREMENT NOT NULL,
	`language_name` varchar(40) NOT NULL,
	CONSTRAINT `programming_language_programming_language` PRIMARY KEY(`programming_language`)
);

CREATE TABLE `reports` (
	`report_id` int AUTO_INCREMENT NOT NULL,
	`report_name` text NOT NULL,
	`student_id` int NOT NULL,
	`generated_at` datetime NOT NULL,
	`report_data` json NOT NULL,
	CONSTRAINT `reports_report_id` PRIMARY KEY(`report_id`)
);

CREATE TABLE `students` (
	`student_id` int NOT NULL,
	`batch_id` int NOT NULL,
	`roll_id` varchar(20) NOT NULL,
	CONSTRAINT `students_student_id` PRIMARY KEY(`student_id`)
);

CREATE TABLE `submissions` (
	`submission_id` int AUTO_INCREMENT NOT NULL,
	`practical_id` int NOT NULL,
	`student_id` int NOT NULL,
	`code_submitted` text NOT NULL,
	`status` enum('Accepted','Rejected','Pending') NOT NULL DEFAULT 'Pending',
	`marks` int DEFAULT 0,
	`submission_time` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `submissions_submission_id` PRIMARY KEY(`submission_id`)
);

CREATE TABLE `users` (
	`user_id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(225) NOT NULL,
	`password` varchar(225) NOT NULL,
	`email` varchar(225) NOT NULL,
	`role` enum('Student','Faculty','HOD','Admin') NOT NULL,
	-- `pdf_url` varchar(255),
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`)
);

ALTER TABLE `batch` ADD CONSTRAINT `batch_department_id_departments_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `batch_practical_access` ADD CONSTRAINT `batch_practical_access_practical_id_practicals_practical_id_fk` FOREIGN KEY (`practical_id`) REFERENCES `practicals`(`practical_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `batch_practical_access` ADD CONSTRAINT `batch_practical_access_batch_id_batch_batch_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `batch`(`batch_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `courses` ADD CONSTRAINT `courses_department_id_departments_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `courses_faculty` ADD CONSTRAINT `courses_faculty_course_id_courses_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `courses_faculty` ADD CONSTRAINT `courses_faculty_faculty_id_faculty_faculty_id_fk` FOREIGN KEY (`faculty_id`) REFERENCES `faculty`(`faculty_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `courses_faculty` ADD CONSTRAINT `courses_faculty_batch_id_batch_batch_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `batch`(`batch_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `faculty` ADD CONSTRAINT `faculty_faculty_id_users_user_id_fk` FOREIGN KEY (`faculty_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `faculty` ADD CONSTRAINT `faculty_department_id_departments_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `prac_io` ADD CONSTRAINT `prac_io_practical_id_practicals_practical_id_fk` FOREIGN KEY (`practical_id`) REFERENCES `practicals`(`practical_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `prac_language` ADD CONSTRAINT `prac_language_practical_id_practicals_practical_id_fk` FOREIGN KEY (`practical_id`) REFERENCES `practicals`(`practical_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `prac_language` ADD CONSTRAINT `prac_language_programming_language_id_fk` FOREIGN KEY (`programming_language_id`) REFERENCES `programming_language`(`programming_language`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `practicals` ADD CONSTRAINT `practicals_course_id_courses_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `reports` ADD CONSTRAINT `reports_student_id_users_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `students` ADD CONSTRAINT `students_student_id_users_user_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `students` ADD CONSTRAINT `students_batch_id_batch_batch_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `batch`(`batch_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_practical_id_practicals_practical_id_fk` FOREIGN KEY (`practical_id`) REFERENCES `practicals`(`practical_id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_student_id_students_student_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE no action ON UPDATE no action;
CREATE INDEX `department_id_idx` ON `batch` (`department_id`);
CREATE INDEX `semester_idx` ON `batch` (`semester`);
CREATE INDEX `division_idx` ON `batch` (`division`);
CREATE INDEX `batch_idx` ON `batch` (`batch`);
CREATE INDEX `practical_id_idx` ON `batch_practical_access` (`practical_id`);
CREATE INDEX `batch_id_idx` ON `batch_practical_access` (`batch_id`);
CREATE INDEX `lock_idx` ON `batch_practical_access` (`lock`);
CREATE INDEX `deadline_idx` ON `batch_practical_access` (`deadline`);
CREATE INDEX `course_name_idx` ON `courses` (`course_name`);
CREATE INDEX `semester_idx` ON `courses` (`semester`);
CREATE INDEX `department_id_idx` ON `courses` (`department_id`);
CREATE INDEX `course_id_idx` ON `courses_faculty` (`course_id`);
CREATE INDEX `faculty_id_idx` ON `courses_faculty` (`faculty_id`);
CREATE INDEX `batch_id_idx` ON `courses_faculty` (`batch_id`);
CREATE INDEX `name_idx` ON `departments` (`name`);
CREATE INDEX `department_id_idx` ON `faculty` (`department_id`);
CREATE INDEX `practical_id_idx` ON `prac_io` (`practical_id`);
CREATE INDEX `is_public_idx` ON `prac_io` (`is_public`);
CREATE INDEX `practical_name_idx` ON `practicals` (`practical_name`);
CREATE INDEX `course_id_idx` ON `practicals` (`course_id`);
CREATE INDEX `language_name_idx` ON `programming_language` (`language_name`);
CREATE INDEX `student_id_idx` ON `reports` (`student_id`);
CREATE INDEX `generated_at_idx` ON `reports` (`generated_at`);
CREATE INDEX `batch_id_idx` ON `students` (`batch_id`);
CREATE INDEX `practical_idx` ON `submissions` (`practical_id`);
CREATE INDEX `student_idx` ON `submissions` (`student_id`);
CREATE INDEX `username_idx` ON `users` (`username`);
CREATE INDEX `email_idx` ON `users` (`email`);
CREATE INDEX `role_idx` ON `users` (`role`);