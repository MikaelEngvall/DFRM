import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import securityService from '../services/securityService';

const ConfirmEmailChange = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Hämta token från URL-parametrar
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      confirmEmailChange(tokenParam);
    } else {
      setError('Ingen bekräftelsetoken hittades i URL:en. Kontrollera din länk.');
    }
  }, [location]);

  const confirmEmailChange = async (tokenValue) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      setIsLoading(true);
      setError('');
      
      await securityService.confirmEmailChange(tokenValue);
      setIsSuccess(true);
    } catch (err) {
      console.error('Email change confirmation error:', err);
      if (err.statusCode === 400) {
        setError('Ogiltig bekräftelsetoken.');
      } else if (err.statusCode === 404) {
        setError('Bekräftelsetoken hittades inte eller har utgått.');
      } else {
        setError('Ett fel uppstod vid bekräftelse av e-postbyte. Försök igen senare.');
      }
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-cinzel text-gray-900 dark:text-white">
            Bekräfta e-postbyte
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : isSuccess ? (
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
                    Din e-postadress har uppdaterats!
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Du kan nu logga in med din nya e-postadress.
            </p>
            <button
              onClick={navigateToLogin}
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
            >
              Gå till inloggning
            </button>
          </div>
        ) : (
          <div className="text-center">
            {error ? (
              <>
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
                <Link 
                  to="/login" 
                  className="text-primary hover:text-secondary dark:text-primary-light dark:hover:text-secondary-light"
                >
                  Tillbaka till inloggning
                </Link>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Bearbetar din begäran...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailChange; 