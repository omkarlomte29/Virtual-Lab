import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import DarkModeToggle from "./DarkModeToggle";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuthStore();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              V-Lab
            </Link>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/courses"
                  className="text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                >
                  Courses
                </Link>
                {user?.role != 'Student' && (  // Check if user is admin
                  <Link
                    to="/students"
                    className="text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                  >
                    Students
                  </Link>
                )}
                {(user?.role === 'Admin' || user?.role === 'HOD') && (  // Check if user is admin
                  <Link
                    to="/faculty"
                    className="text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                  >
                    Faculty
                  </Link>
                )}
                {user?.role != 'Student' && ( // Check if user is admin
                  <Link
                  to="/division"
                  className="text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                  >
                    Division
                  </Link>
                )}
                {user?.role === 'Admin' && (  // Check if user is admin
                  <Link
                    to="/departments"
                    className="text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                  >
                    Department
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            <DarkModeToggle />
            <div className="ml-3 relative">
              {isAuthenticated ? (
                <div>
                  <span className="text-gray-900 mr-2 dark:text-white">
                    {user?.username}
                  </span>
                  <Link
                    to="/login"
                    className="text-gray-900 dark:text-white"
                    onClick={logout}
                  >
                    Logout
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="text-gray-900 dark:text-white">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
