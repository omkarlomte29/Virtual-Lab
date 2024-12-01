import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});


export const fetchDepartments = () => api.get('/students/departments');
export const fetchSemesters = () => api.get('/students/semesters');
export const fetchDivisions = () => api.get('/students/divisions');
export const fetchBatches = () => api.get('/students/batches');

export const login = async (email: string, password: string) => api.post('/auth/login', { email, password });
export const register = (userData: any) => api.post('/auth/register', userData);

export const createCourse = (courseData: any) => api.post('/courses', courseData);
export const updateCourse = (id: number, courseData: any) => api.put(`/courses/${id}`, courseData);
export const deleteCourse = (id: number) => api.delete(`/courses/${id}`);
export const getCourse = (id: number) => api.get(`/courses/${id}`);
export const createPractical = (practicalData: any) => api.post('/practicals', practicalData);
export const updatePractical = (id: number, practicalData: any) => api.put(`/practicals/${id}`, practicalData);
export const deletePractical = (id: number) => api.delete(`/practicals/${id}`);
export const getPractical = (id: number) => api.get(`/practicals/${id}`);

export const createBatchPracticalAccess = (accessData: any) => api.post('/batch-practical-access', accessData);
export const updateBatchPracticalAccess = (id: number, accessData: any) => api.put(`/batch-practical-access/${id}`, accessData);
export const deleteBatchPracticalAccess = (id: number) => api.delete(`/batch-practical-access/${id}`);
export const getBatchPracticalAccess = (id: number) => api.get(`/batch-practical-access/${id}`);

export const getAllFaculty = () => api.get('/faculty');
export const getStudentsWithDepartment = () => api.get('/students/with-department');

export const getDepartments = () => api.get('/departments');
export const getBatches = () => api.get('/batches');
export const getProgrammingLanguages = () => api.get('/programming-languages');


export const getBatchesByDepartmentAndSemeter = (departmentID: number, semester: number) => api.get(`/batches/department/${departmentID}/semester/${semester}`);


export default api;