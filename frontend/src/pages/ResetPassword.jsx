import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormInput from '../components/FormInput';
import securityService from '../services/securityService';
import { validatePassword, validatePasswordMatch } from '../utils/validation';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Hämta token från URL-parametrar
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setSubmitError('Ingen återställningstoken hittades i URL:en. Kontrollera din länk.');
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};
    const passwordError = validatePassword(formData.newPassword);
    const passwordMatchError = validatePasswordMatch(
      formData.newPassword, 
      formData.confirmPassword
    );

    if (passwordError) newErrors.newPassword = passwordError;
    if (passwordMatchError) newErrors.confirmPassword = passwordMatchError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Rensa felmeddelande för det aktuella fältet
    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!token) {
      setSubmitError('Ingen återställningstoken hittades. Kontrollera din länk.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await securityService.resetPassword(token, formData.newPassword);
      setIsSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.statusCode === 400) {
        setSubmitError('Ogiltig återställningstoken eller lösenordsformat.');
      } else if (err.statusCode === 404) {
        setSubmitError('Återställningstoken hittades inte eller har utgått.');
      } else {
        setSubmitError('Ett fel uppstod vid återställning av lösenordet. Försök igen senare.');
      }
    } finally {
      setIsLoading(false);
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
            Återställ lösenord
          </h2>
        </div>

        {isSuccess ? (
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
                    Ditt lösenord har återställts!
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Du kan nu logga in med ditt nya lösenord.
            </p>
            <button
              onClick={navigateToLogin}
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
            >
              Gå till inloggning
            </button>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Ange ett nytt lösenord för ditt konto.
            </p>
            
            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <FormInput
                  label="Nytt lösenord"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  error={errors.newPassword}
                  required
                  autoComplete="new-password"
                />
                <FormInput
                  label="Bekräfta lösenord"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Uppdatera lösenord'
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

export default ResetPassword; 