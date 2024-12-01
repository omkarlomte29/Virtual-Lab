import { create } from "zustand";
import api from "../services/api";

// interface Faculty {
//   faculty_id: number;
//   name: string;
//   department: string;
// }

interface FacultyStoreState {
  faculty: any[];
  departments: string[];
  isLoading: boolean;
  error: string | null;
  fetchDepartments: () => Promise<void>;
  fetchFaculty: (department?: string) => Promise<void>;
  addFaculty: (newFaculty: Partial<any>) => Promise<void>;
  deleteFaculty: (facultyId: number) => Promise<void>;
}

const useFacultyStore = create<FacultyStoreState>((set) => ({
  faculty: [],
  departments: [],
  isLoading: false,
  error: null,

  // Fetch departments
  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/departments");
      set({ departments: response.data });
    } catch (error) {
      set({ error: "Failed to fetch departments" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch faculty (optionally by department)
  fetchFaculty: async (department) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = department ? `/faculty/department/${department}` : "/faculty/all";
      const response = await api.get(endpoint);
      set({ faculty: response.data });
    } catch (error) {
      set({ error: "Failed to fetch faculty" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new faculty member
  addFaculty: async (newFaculty) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/faculty", newFaculty);
      set((state) => ({
        faculty: [...state.faculty, newFaculty],
      }));
    } catch (error) {
      set({ error: "Failed to add faculty" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete a faculty member
  // Delete a faculty member
  deleteFaculty: async (facultyId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/faculty/${facultyId}`);
      set((state) => ({
        faculty: state.faculty.filter((faculty) => faculty.faculty_id !== facultyId),
      }));
    } catch (error) {
      set({ error: "Failed to delete faculty" });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useFacultyStore;
