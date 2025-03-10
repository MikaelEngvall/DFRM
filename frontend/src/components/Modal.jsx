import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'large', 
  onSubmit,
  submitButtonText,
  showFooter = true
}) => {
  if (!isOpen) return null;

  // Avgör vilken breddinställning som ska användas baserat på size-prop
  const sizeClasses = {
    small: 'sm:max-w-lg',
    medium: 'sm:max-w-2xl',
    large: 'sm:max-w-4xl'
  };

  const maxWidthClass = sizeClasses[size] || sizeClasses.large;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-800 opacity-75"></div>
        </div>
        
        {/* Centrerad modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${maxWidthClass} sm:w-full`}>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-start px-6 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                type="button"
                className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
              >
                <span className="sr-only">Stäng</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="px-6 pb-6 pt-0 sm:p-6 sm:pb-6">
              {children}

              {showFooter && (
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {onSubmit && (
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {submitButtonText || 'Spara ändringar'}
                    </button>
                  )}
                  <div className="flex-grow"></div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {onSubmit ? 'Avbryt' : 'Stäng'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modal; 