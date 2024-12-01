import React from "react";
// import { XIcon } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {/* <XIcon size={24} /> */}✖️
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
