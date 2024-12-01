import React from "react";
import Navbar from "./Navbar";
import { Toaster } from "./ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
      <Toaster />
    </div>
  );
};

export default Layout;
