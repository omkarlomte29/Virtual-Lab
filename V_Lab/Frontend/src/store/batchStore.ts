import { create } from 'zustand';
import api from '../services/api';

export interface Batch {
    batch_id: number;
    department_id: number;
    semester: number;
    division: string;
    batch: string;
}

interface BatchState {
    batches: Batch[];
    fetchBatches: () => Promise<void>;
    createBatch: (batchData: Partial<Batch>) => Promise<void>;
    updateBatch: (id: number, batchData: Partial<Batch>) => Promise<void>;
    deleteBatch: (id: number) => Promise<void>;
    fetchBatchesByDepartmentAndSemester: (departmentID: number, semester: number) => Promise<void>;
}

export const useBatchStore = create<BatchState>((set) => ({
    batches: [],
    fetchBatches: async () => {
        try {
            const response = await api.get('/batches');
            set({ batches: response.data });
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        }
    },
    createBatch: async (batchData) => {
        try {
            const response = await api.post('/batches', batchData);
            set((state) => ({ batches: [...state.batches, response.data] }));
        } catch (error) {
            console.error('Failed to create batch:', error);
            throw error;
        }
    },
    updateBatch: async (id, batchData) => {
        try {
            const response = await api.put(`/batches/${id}`, batchData);
            set((state) => ({
                batches: state.batches.map((batch) =>
                    batch.batch_id === id ? { ...batch, ...response.data } : batch
                ),
            }));
        } catch (error) {
            console.error('Failed to update batch:', error);
            throw error;
        }
    },
    deleteBatch: async (id) => {
        try {
            await api.delete(`/batches/${id}`);
            set((state) => ({
                batches: state.batches.filter((batch) => batch.batch_id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete batch:', error);
            throw error;
        }
    },

    fetchBatchesByDepartmentAndSemester: async (departmentID, semester) => {
        try {
            const response = await api.get(`/batches/department/${departmentID}/semester/${semester}`);
            set({ batches: response.data });
        } catch (error) {
            console.error('Failed to delete batch:', error);
            throw error;
        }
    },
}));