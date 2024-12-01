import React from 'react';
import { useThemeStore } from '../store/themeStore';

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white"
    >
      {isDarkMode ? '🌞' : '🌙'}
    </button>
  );
};

export default DarkModeToggle;