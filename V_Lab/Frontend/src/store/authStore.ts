// Frontend\src\store\authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';

interface User {
    user_id: number;
    username: string;
    email: string;
    role: 'Student' | 'Faculty' | 'HOD' | 'Admin';
    department_id: number;
    batch_id?: number;
    roll_id?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    setToken: (token: string) => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: async (email, password) => {
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { user, token } = response.data;
                    set({ user, token, isAuthenticated: true });
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (error) {
                    console.error('Login failed:', error);
                    throw error;
                }
            },
            register: async (userData) => {
                try {
                    const response = await api.post('/auth/register', { ...userData, role: "Student" });
                    const { user, token } = response.data;
                    set({ user, token, isAuthenticated: true });
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (error) {
                    console.error('Registration failed:', error);
                    throw error;
                }
            },
            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                delete api.defaults.headers.common['Authorization'];
            },
            setToken: (token) => {
                set({ token, isAuthenticated: true });
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            },
            setUser: (user) => {
                set({ user });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user, token: state.token }),
        }
    )
);

// Add a function to initialize the auth state
export const initializeAuthState = () => {
    const { token, user } = useAuthStore.getState();
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (user && token) {
        useAuthStore.setState({ isAuthenticated: true });
    }
};