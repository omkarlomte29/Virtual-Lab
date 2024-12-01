import { create } from 'zustand';
import api from '../services/api'; // Adjust the import based on your API setup

// interface Student {
//   student_id: number;
//   name: string;
//   department: string;
//   semester: string;
//   division: string;
//   batch: string;
// }

interface StudentStoreState {
  students: any[];
  departments: string[];
  semesters: string[];
  divisions: string[];
  batches: string[];
  isLoading: boolean;
  fetchStudents: (filters?: Record<string, any>) => Promise<void>;
  fetchDepartments: () => Promise<void>;
  fetchSemesters: () => Promise<void>;
  fetchDivisions: () => Promise<void>;
  fetchBatches: () => Promise<void>;
}

const useStudentStore = create<StudentStoreState>((set) => ({
  students: [],
  departments: [],
  semesters: [],
  divisions: [],
  batches: [],
  isLoading: false,
  fetchStudents: async (filters) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/students', { params: filters });
      set({ students: response.data });
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchDepartments: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/departments'); // Adjust endpoint
      set({ departments: response.data });
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchSemesters: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/semesters'); // Adjust endpoint
      set({ semesters: response.data });
    } catch (error) {
      console.error("Error fetching semesters:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchDivisions: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/divisions'); // Adjust endpoint
      set({ divisions: response.data });
    } catch (error) {
      console.error("Error fetching divisions:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchBatches: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/batches'); // Adjust endpoint
      set({ batches: response.data });
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useStudentStore;
