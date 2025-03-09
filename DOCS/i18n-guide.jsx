// Exempel på hur internationalisering (i18n) bör användas i alla komponenter

import React, { useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import FormInput from '../components/FormInput';

// Steg 1: Importera useLocale från LocaleContext
const ExampleComponent = () => {
  // Steg 2: Använd useLocale hook för att få tillgång till översättningsfunktionen t()
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logik för att hantera formulärinlämning
    console.log('Form submitted:', formData);
  };

  // Steg 3: Använd t() funktionen för ALLA texter som visas i användargränssnittet
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Använd alltid t() för att översätta titlar */}
      <h1 className="text-3xl font-cinzel dark:text-white">
        {t('example.title')}
      </h1>
      
      {/* Använd alltid t() för knappar och andra interaktiva element */}
      <button
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors"
      >
        {t('example.addButton')}
      </button>
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Använd t() för formulärfält och ledtexter */}
        <FormInput
          label={t('example.form.nameLabel')}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder={t('example.form.namePlaceholder')}
          required
        />
        
        <FormInput
          label={t('example.form.emailLabel')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder={t('example.form.emailPlaceholder')}
          required
        />
        
        {/* Alla knappar och interaktiva element ska använda t() */}
        <button 
          type="submit" 
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          {t('example.form.submitButton')}
        </button>
      </form>
      
      {/* Använd t() för statiska texter och meddelanden */}
      <p className="mt-4 text-gray-600 dark:text-gray-300">
        {t('example.infoText')}
      </p>
      
      {/* Använd t() med parametrar för dynamiska texter */}
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {t('example.counter', { count: 5, plural: 5 })}
      </p>
    </div>
  );
};

export default ExampleComponent; 