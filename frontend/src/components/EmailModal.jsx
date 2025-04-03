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
  const [recipientsVisible, setRecipientsVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [timeoutTimer, setTimeoutTimer] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
    };
  }, [timeoutTimer]);

  const handleClose = () => {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      setTimeoutTimer(null);
    }
    setSending(false);
    setError('');
    setSendSuccess(false);
    setContent('');
    setSubject('');
    onClose();
  };

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
      setError('');
      
      const timer = setTimeout(() => {
        setSending(false);
        setError(t('email.errors.timeout'));
        setTimeoutTimer(null);
      }, 120000);
      
      setTimeoutTimer(timer);
      
      await onSend(subject, content, recipients);
      
      clearTimeout(timer);
      setTimeoutTimer(null);
      
      setSendSuccess(true);
      setSending(false);
      
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        setTimeoutTimer(null);
      }
      
      console.error('E-postsändning misslyckades:', err);
      setSending(false);
      setError(t('email.errors.sendFailed'));
    }
  };

  const recipientCount = recipients.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('email.title')}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        
        {sendSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mb-4">
            <p className="text-green-800 dark:text-green-200">{t('email.messages.sendSuccess')}</p>
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
        
        {recipients.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <button
              type="button"
              onClick={() => setRecipientsVisible(!recipientsVisible)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {recipientsVisible ? t('email.hideRecipients') : t('email.showRecipients')} ({recipients.length})
            </button>
            
            {recipientsVisible && (
              <div className="mt-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                <ul className="list-disc pl-5">
                  {recipients.map((email, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                      {email}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('email.fields.subject')}
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sending}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
            placeholder={t('email.placeholders.subject')}
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('email.fields.content')}
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={sending}
            rows={10}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
            placeholder={t('email.placeholders.content')}
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={sending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {sending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('email.sending')}
              </span>
            ) : t('email.send')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmailModal; 