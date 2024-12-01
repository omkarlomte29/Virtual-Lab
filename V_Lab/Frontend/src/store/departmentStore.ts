import { create } from 'zustand';
import api from '../services/api';

export interface Department {
    department_id: number;
    name: string;
}

interface DepartmentState {
    departments: Department[];
    fetchDepartments: () => Promise<void>;
    createDepartment: (name: string) => Promise<void>;
    updateDepartment: (id: number, name: string) => Promise<void>;
    deleteDepartment: (id: number) => Promise<void>;
}

export const useDepartmentStore = create<DepartmentState>((set) => ({
    departments: [],
    fetchDepartments: async () => {
        try {
            const response = await api.get('/departments');
            set({ departments: response.data });
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    },
    createDepartment: async (name) => {
        try {
            const response = await api.post('/departments', { name });
            set((state) => ({ departments: [...state.departments, response.data] }));
        } catch (error) {
            console.error('Failed to create department:', error);
            throw error;
        }
    },
    updateDepartment: async (id, name) => {
        try {
            const response = await api.put(`/departments/${id}`, { name });
            set((state) => ({
                departments: state.departments.map((department) =>
                    department.department_id === id ? { ...department, ...response.data } : department
                ),
            }));
        } catch (error) {
            console.error('Failed to update department:', error);
            throw error;
        }
    },
    deleteDepartment: async (id) => {
        try {
            await api.delete(`/departments/${id}`);
            set((state) => ({
                departments: state.departments.filter((department) => department.department_id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete department:', error);
            throw error;
        }
    },
}));

// import { create } from 'zustand';
// import axios from 'axios';

// export interface Department {
//   department_id: number;
//   name: string;
// }

// interface DepartmentState {
//   departments: Department[];
//   fetchDepartments: () => Promise<void>;
//   createDepartment: (department: Omit<Department, 'department_id'>) => Promise<void>;
//   updateDepartment: (id: number, department: Partial<Department>) => Promise<void>;
//   deleteDepartment: (id: number) => Promise<void>;
// }

// export const useDepartmentStore = create<DepartmentState>((set) => ({
//   departments: [],
//   fetchDepartments: async () => {
//     const response = await fetch('/api/departments');
//     const data = await response.json();
//     set({ departments: data });
//   },
//   createDepartment: async (department) => {
//     await axios.post('/api/departments', department);
//   },
//   updateDepartment: async (id, department) => {
//     await axios.put(`/api/departments/${id}`, department);
//   },
//   deleteDepartment: async (id) => {
//     await axios.delete(`/api/departments/${id}`);
//   },
// }));
