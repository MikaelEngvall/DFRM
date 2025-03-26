import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormInput from './FormInput';
import { useLocale } from '../contexts/LocaleContext';

/**
 * Modal för att skicka e-post till flera mottagare
 * 
 * @param {Object} props - Komponentens props
 * @param {boolean} props.isOpen - Om modalen är öppen
 * @param {Function} props.onClose - Funktion som anropas när modalen stängs
 * @param {Function} props.onSend - Funktion som anropas när e-posten skickas
 * @param {Array<string>} props.recipients - Lista med e-postadresser som ska ta emot meddelandet
 * @param {string} props.sender - Avsändarens e-postadress (endast för visning)
 */
const EmailModal = ({ isOpen, onClose, onSend, recipients = [], sender = "info@duggalsfastigheter.se" }) => {
  const { t } = useLocale();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  // Lägg till en timer-referens för att hantera timeout
  const [timeoutTimer, setTimeoutTimer] = useState(null);


  
  // Rensa timern när komponenten avmonteras
  useEffect(() => {
    return () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
    };
  }, [timeoutTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      setError(t('email.errors.subjectRequired'));
      return;
    }
    
    if (!content.trim()) {
      setError(t('email.errors.contentRequired'));
      return;
    }
    
    if (recipients.length === 0) {
      setError(t('email.errors.noRecipients'));
      return;
    }
    
    try {
      setSending(true);
      setError(null);
      
      // Sätt en fallback-timer som avbryter sändningen om den tar för lång tid
      // Detta är en extra säkerhet utöver timeout i API-anropet
      const timer = setTimeout(() => {
        if (sending) {
          setSending(false);
          setError(t('email.errors.serverTimeout'));
          console.error('E-post timeout i UI-lagret');
        }
      }, 60000); // 60 sekunder
      
      setTimeoutTimer(timer);
      
      const result = await onSend(subject, content, recipients);
      
      // Rensa timern eftersom sändningen lyckades
      clearTimeout(timer);
      setTimeoutTimer(null);
      
      console.log('E-post schemalagd framgångsrikt', result);
      
      // Visa meddelande om delvis framgång
      if (result && result.partialSuccess) {
        onClose();
        // Visa informativt meddelande om delvis framgång
        alert(`${result.message}`);
      } else {
        // Rensa formuläret efter framgångsrik sändning
        setSubject('');
        setContent('');
        setSending(false);
        onClose();
      }
    } catch (error) {
      // Rensa timern vid fel
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        setTimeoutTimer(null);
      }
      
      setSending(false);
      console.error('Error i handleSubmit:', error);
      
      // Sätt lämpligt felmeddelande
      if (error.message && error.message.includes('bakgrunden')) {
        // Specifikt meddelande för timeout som antyder att processen fortsätter i bakgrunden
        setError(`${error.message}`);
      } else {
        // Generellt felmeddelande för andra fel
        setError(t('email.errors.sendFailed') + ': ' + error.message);
      }
    }
  };

  const recipientCount = recipients.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        // Säkerställ att timern rensas om modalen stängs
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
          setTimeoutTimer(null);
        }
        // Återställ formen innan stängning
        if (!sending) {
          setError(null);
          setSubject('');
          setContent('');
          onClose();
        }
      }}
      title={t('email.title')}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('email.from')}:
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-400">{sender}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('email.to')}:
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-400">{sender}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('email.bcc')}:
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {recipientCount} {t('email.recipients')}
            </span>
          </div>
        </div>
        
        {/* Knapp för att visa mottagarlistan */}
        {recipients.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <button 
              type="button"
              onClick={() => console.log('Mottagarlista:', recipients)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('email.showRecipients')}
            </button>
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-20">
              {recipients.join(', ')}
            </div>
          </div>
        )}
        
        <FormInput
          label={t('email.subject')}
          name="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('email.content')}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
            rows={10}
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => {
              // Säkerställ att timern rensas om modalen stängs
              if (timeoutTimer) {
                clearTimeout(timeoutTimer);
                setTimeoutTimer(null);
              }
              setError(null);
              setSubject('');
              setContent('');
              onClose();
            }}
            disabled={sending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary dark:bg-primary dark:hover:bg-secondary disabled:opacity-50 flex items-center"
          >
            {sending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('email.sending')}
              </>
            ) : t('email.send')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmailModal; 