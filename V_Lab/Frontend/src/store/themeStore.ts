import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface ThemeState {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isDarkMode: false,
            toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);