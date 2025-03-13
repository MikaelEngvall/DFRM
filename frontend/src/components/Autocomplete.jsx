import React, { useState, useEffect, useRef } from 'react';

const Autocomplete = ({ 
  options = [],
  value,
  onChange,
  label,
  name,
  placeholder = '',
  displayField = item => item.toString(),
  filterOptions = (options, query) => options.filter(option => 
    displayField(option).toLowerCase().includes(query.toLowerCase())
  ),
  required = false,
  className = '',
  onSelect = () => {}
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Sätter inputValue baserat på värde från props när komponenten laddas eller när value ändras
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(option => option.id === value);
      if (selectedOption) {
        setInputValue(displayField(selectedOption));
      }
    } else {
      setInputValue('');
    }
  }, [value, options, displayField]);

  // Filter-funktion för att hitta förslag baserat på input
  const updateSuggestions = (query) => {
    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }
    
    const filtered = filterOptions(options, query);
    setSuggestions(filtered);
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);
  };

  // Hantera input-ändring
  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);
    updateSuggestions(query);
    setShowSuggestions(true);
    
    // Om input är tom, nollställ värdet
    if (query.trim() === '') {
      onChange({ target: { name, value: '' } });
    }
  };

  // Hantera när ett förslag väljs
  const handleSelect = (option) => {
    setInputValue(displayField(option));
    onChange({ target: { name, value: option.id } });
    onSelect(option);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Stäng förslagslistan när användaren klickar utanför komponenten
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hantera tangentbordnavigering
  const handleKeyDown = (e) => {
    // Nedåtpil
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex(prev => (prev + 1) % suggestions.length);
      }
    }
    // Uppåtpil
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      }
    }
    // Enter
    else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    }
    // Escape
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => updateSuggestions(inputValue)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        required={required}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <ul 
          ref={suggestionsRef}
          className="absolute z-10 w-full bg-white dark:bg-gray-800 mt-1 shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-300 dark:border-gray-600"
        >
          {suggestions.map((option, index) => (
            <li
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                index === highlightedIndex 
                  ? 'bg-blue-600 text-white dark:bg-blue-800'
                  : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {displayField(option)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete; 