import React, { useState } from 'react';
import FormInput from './FormInput';
import { validateEmail } from '../utils/validation';
import securityService from '../services/securityService';

const ChangeEmailForm = ({ onSuccess }) => {
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const emailError = validateEmail(newEmail);
    if (emailError) {
      setError(emailError);
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    setNewEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await securityService.requestEmailChange(newEmail);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Email change request error:', err);
      if (err.statusCode === 400) {
        setError('E-postadressen är redan registrerad i systemet.');
      } else if (err.statusCode === 403) {
        setError('Du har inte behörighet att byta e-postadress.');
      } else if (err.statusCode === 429) {
        setError('För många försök. Försök igen senare.');
      } else {
        setError('Ett fel uppstod. Försök igen senare.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Byt e-postadress</h3>
      
      {isSuccess ? (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-400">
                En bekräftelselänk har skickats till {newEmail}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              För att byta e-postadress behöver du bekräfta den nya adressen. Vi skickar en bekräftelselänk till din nya e-postadress.
            </p>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <FormInput
              label="Ny e-postadress"
              name="newEmail"
              type="email"
              value={newEmail}
              onChange={handleInputChange}
              error={error}
              required
              autoComplete="email"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Skicka bekräftelselänk'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChangeEmailForm; 