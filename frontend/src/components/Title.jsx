import React from 'react';

/**
 * En återanvändbar Title-komponent som säkerställer konsekvent 
 * stilsättning med Cinzel-typsnitt och färger i ljust/mörkt läge
 * 
 * @param {object} props - Komponentens props
 * @param {React.ReactNode} props.children - Innehållet i rubriken
 * @param {string} props.level - Rubriknivå (h1, h2, h3, h4, h5, h6), standard är h1
 * @param {string} props.className - Extra CSS-klasser
 * @param {boolean} props.centered - Om rubriken ska centreras
 * @returns {JSX.Element} En rubrik med konsekvent stilsättning
 */
const Title = ({ 
  children, 
  level = 'h1', 
  className = '', 
  centered = false,
  ...props 
}) => {
  // Basklasser som alltid appliceras
  const baseClasses = 'font-cinzel text-gray-900 dark:text-white';
  
  // Storleksklasser baserade på rubriknivå
  const sizeClasses = {
    h1: 'text-3xl',
    h2: 'text-2xl',
    h3: 'text-xl',
    h4: 'text-lg',
    h5: 'text-base',
    h6: 'text-sm'
  };

  // Kombinera klasser
  const combinedClasses = `${baseClasses} ${sizeClasses[level] || 'text-3xl'} ${centered ? 'text-center' : ''} ${className}`;

  // Rendera korrekt HTML-element baserat på level
  const Component = level;
  
  return (
    <Component className={combinedClasses} {...props}>
      {children}
    </Component>
  );
};

export default Title; 