import { create } from 'zustand';
import api from '../services/api';

interface Practical {
    practical_id: number;
    sr_no: number;
    practical_name: string;
    course_id: number;
    description: string;
    pdf_url?: string;
    prac_io: PracIO[];
    prac_language: PracLanguage[];
}

interface PracIO {
    input: string;
    output: string;
    isPublic: boolean;
}

interface PracLanguage {
    programming_language_id: number;
}

interface PracticalState {
    practicals: Practical[];
    fetchPracticals: () => Promise<void>;
    fetchPracticalByCourseID: (id: number) => Promise<void>;
    createPractical: (practicalData: Partial<Practical>) => Promise<void>;
    updatePractical: (id: number, practicalData: Partial<Practical>) => Promise<void>;
    deletePractical: (id: number) => Promise<void>;
}

export const usePracticalStore = create<PracticalState>((set) => ({
    practicals: [],
    fetchPracticals: async () => {
        try {
            const response = await api.get('/practicals');
            set({ practicals: response.data });
        } catch (error) {
            console.error('Failed to fetch practicals:', error);
        }
    },
    createPractical: async (practicalData) => {
        try {
            const response = await api.post('/practicals', practicalData);
            set((state) => ({ practicals: [...state.practicals, response.data] }));
        } catch (error) {
            console.error('Failed to create practical:', error);
            throw error;
        }
    },
    fetchPracticalByCourseID: async (id) => {
        try {
            const response = await api.put(`/practicals/${id}`);
            set((state) => ({
                practicals: state.practicals.map((practical) =>
                    practical.practical_id === id ? { ...practical, ...response.data } : practical
                ),
            }));
        } catch (error) {
            console.error('Failed to update practical:', error);
            throw error;
        }
    },
    updatePractical: async (id, practicalData) => {
        try {
            const response = await api.put(`/practicals/${id}`, practicalData);
            set((state) => ({
                practicals: state.practicals.map((practical) =>
                    practical.practical_id === id ? { ...practical, ...response.data } : practical
                ),
            }));
        } catch (error) {
            console.error('Failed to update practical:', error);
            throw error;
        }
    },
    deletePractical: async (id) => {
        try {
            await api.delete(`/practicals/${id}`);
            set((state) => ({
                practicals: state.practicals.filter((practical) => practical.practical_id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete practical:', error);
            throw error;
        }
    },
}));