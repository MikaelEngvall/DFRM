import React, { createContext, useContext, useState, useEffect } from 'react';

// Skapa context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Kontrollera om användaren tidigare har valt ett tema
  const getSavedTheme = () => {
    // Kontrollera localStorage först
    const savedTheme = localStorage.getItem('theme');
    
    // Om något finns sparat använd det
    if (savedTheme) {
      return savedTheme;
    }
    
    // Annars kolla systemets inställningar
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Fallback till ljust tema
    return 'light';
  };

  const [theme, setTheme] = useState(getSavedTheme);

  // Funktion för att växla tema
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  // Uppdatera DOM och localStorage när tema ändras
  useEffect(() => {
    // Uppdatera HTML documentElement med tema-klassen
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    // Spara valet i localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook för att använda theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 