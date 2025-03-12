import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'small',
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

  const maxWidthClass = sizeClasses[size] || sizeClasses.small;

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
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        {/* Centrerad modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5),0_2px_4px_-2px_rgba(0,0,0,0.5)] dark:border dark:border-gray-700 transform transition-all sm:my-8 sm:align-middle ${maxWidthClass} sm:w-full`}>
          <div>
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
                <div className="flex justify-between gap-4 mt-6">
                  {onSubmit && (
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary dark:bg-primary dark:hover:bg-secondary"
                    >
                      {submitButtonText || 'Spara ändringar'}
                    </button>
                  )}
                  <div className="flex-grow"></div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {onSubmit ? 'Avbryt' : 'Stäng'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 