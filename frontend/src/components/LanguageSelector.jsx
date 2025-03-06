import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import FlagIcon from './FlagIcon';

const LanguageSelector = () => {
  const { currentLocale, changeLocale, availableLocales } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (code) => {
    changeLocale(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FlagIcon code={currentLocale} className="mr-2" />
        <span>{availableLocales[currentLocale].name}</span>
        <svg
          className={`ml-2 h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {Object.entries(availableLocales).map(([code, { name }]) => (
              <button
                key={code}
                className={`${
                  currentLocale === code
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                } group flex items-center w-full px-4 py-2 text-sm`}
                role="menuitem"
                onClick={() => handleLanguageChange(code)}
              >
                <FlagIcon code={code} className="mr-3" />
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 