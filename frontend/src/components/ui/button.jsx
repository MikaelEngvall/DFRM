import React from 'react';
import PropTypes from 'prop-types';

/**
 * En återanvändbar Button-komponent som stödjer olika varianter och tillstånd.
 */
export function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  active = false,
  disabled = false,
  ...props
}) {
  // Basklasser för alla knappar
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  // Storleksklasser
  const sizeClasses = {
    'default': 'h-10 py-2 px-4 text-sm',
    'sm': 'h-8 px-3 text-xs',
    'lg': 'h-12 px-6 text-base'
  };
  
  // Variantklasser
  const variantClasses = {
    'default': 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800',
    'outline': 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700',
    'ghost': 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    'link': 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400'
  };
  
  // Aktiv-tillstånd (används i navigation tabs/filters)
  const activeClasses = active 
    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white' 
    : '';

  // Kombinera alla klasser
  const classes = [
    baseClasses,
    sizeClasses[size] || sizeClasses.default,
    variantClasses[variant] || variantClasses.default,
    active && variant === 'outline' ? activeClasses : '',
    className
  ].join(' ');

  return (
    <button 
      className={classes} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'outline', 'ghost', 'link']),
  size: PropTypes.oneOf(['default', 'sm', 'lg']),
  className: PropTypes.string,
  active: PropTypes.bool,
  disabled: PropTypes.bool
}; 