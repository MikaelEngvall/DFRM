import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../components/FormInput';
import securityService from '../services/securityService';
import { validateEmail } from '../utils/validation';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
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
      await securityService.requestPasswordReset(email);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      if (err.statusCode === 404) {
        setError('E-postadressen hittades inte i systemet.');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-cinzel text-gray-900 dark:text-white">
            Återställ lösenord
          </h2>
        </div>

        {isSubmitted ? (
          <div className="text-center">
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    En länk för att återställa lösenordet har skickats till {email} om kontot finns i systemet.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Kolla din inkorg och skräppost efter ett e-postmeddelande med återställningslänk.
            </p>
            <Link 
              to="/login" 
              className="text-primary hover:text-secondary dark:text-primary-light dark:hover:text-secondary-light"
            >
              Tillbaka till inloggning
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Ange din e-postadress så skickar vi en länk för att återställa ditt lösenord.
            </p>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
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

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <FormInput
                  label="E-post"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  error={error}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Skicka återställningslänk'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-primary hover:text-secondary dark:text-primary-light dark:hover:text-secondary-light"
                >
                  Tillbaka till inloggning
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestPasswordReset; 