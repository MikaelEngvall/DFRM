import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { validateEmail, validatePassword } from '../utils/validation';
import { createLogger } from '../utils/logger';
import { useTranslation } from 'react-i18next';

const logger = createLogger('Login');

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { changeLocale } = useLocale();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const validateForm = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

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
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await login(formData);
      logger.info('Inloggning lyckades');
      
      // Sätt användarens föredragna språk om det finns
      if (userData && userData.preferredLanguage) {
        changeLocale(userData.preferredLanguage);
      }
      
      // Hämta sparad plats från sessionStorage
      const savedLocation = sessionStorage.getItem('savedLocation');
      
      if (savedLocation) {
        // Navigera till den sparade platsen
        navigate(savedLocation);
      } else {
        // Standardomdirigering baserat på roll om ingen plats var sparad
        if (userData && (userData.role === 'ROLE_USER' || userData.role === 'USER')) {
          navigate('/calendar');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      logger.error('Login error:', err);
      setSubmitError(
        err.response?.data?.message ||
        t('auth.errors.invalidCredentials')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-cinzel text-gray-900 dark:text-white">
            Logga in på DFRM
          </h2>
        </div>
        
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
              label="E-post"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              autoComplete="email"
            />
            <FormInput
              label="Lösenord"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <Link to="/request-password-reset" className="text-primary hover:text-secondary dark:text-primary-light dark:hover:text-secondary-light">
                Glömt lösenord?
              </Link>
            </div>
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
                'Logga in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 