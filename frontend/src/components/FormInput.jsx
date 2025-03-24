import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  placeholder,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        className={`block w-full rounded-md shadow-sm py-3 text-base leading-normal ${
          error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-300 dark:placeholder-red-400'
            : 'border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white'
        } disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput; 