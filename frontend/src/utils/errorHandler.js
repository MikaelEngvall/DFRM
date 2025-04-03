/**
 * Central felhanteringsmodul för applikationen
 * Tillhandahåller standardiserade felklasser och hjälpfunktioner för felhantering
 */
import { removeAuthToken } from './tokenStorage';
import { createLogger } from './logger';

// Skapa en dedikerad logger för denna modul
const logger = createLogger('ErrorHandler');

/**
 * Basklass för applikationsfel
 */
export class AppError extends Error {
  constructor(message, statusCode = 0, errorCode = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date();
  }
}

/**
 * Specialiserad klass för autentiseringsfel
 */
export class AuthError extends AppError {
  constructor(message, statusCode = 0, errorCode = null) {
    super(message, statusCode, errorCode);
    this.name = 'AuthError';
  }
}

/**
 * Specialiserad klass för säkerhetsrelaterade fel
 */
export class SecurityError extends AppError {
  constructor(message, statusCode = 0, errorCode = null) {
    super(message, statusCode, errorCode);
    this.name = 'SecurityError';
  }
}

/**
 * Specialiserad klass för API-relaterade fel
 */
export class ApiError extends AppError {
  constructor(message, statusCode = 0, errorCode = null, request = null, response = null) {
    super(message, statusCode, errorCode);
    this.name = 'ApiError';
    this.request = request;
    this.response = response;
  }
}

/**
 * Genererar standard felmeddelande baserat på HTTP-statuskod
 * @param {number} status - HTTP statuskod
 * @param {string} context - Kontextuell information (exempelvis 'auth', 'security')
 * @returns {string} Standardmeddelande för den givna statuskoden
 */
export const getDefaultErrorMessage = (status, context = null) => {
  // Definierar standardmeddelanden för olika HTTP-statuskoder
  const commonMessages = {
    400: 'Ogiltig förfrågan',
    404: 'Resursen hittades inte',
    429: 'För många försök. Försök igen senare.',
    500: 'Serverfel. Försök igen senare.',
    0: 'Kunde inte ansluta till servern'
  };

  // Kontextspecifika meddelanden som överskrider standardmeddelandena
  const contextSpecificMessages = {
    auth: {
      401: 'Felaktiga inloggningsuppgifter',
      403: 'Åtkomst nekad'
    },
    security: {
      401: 'Åtkomst nekad',
      403: 'Åtkomst nekad'
    }
  };

  // Använd kontextspecifikt meddelande om det finns, annars använd standardmeddelande
  if (context && contextSpecificMessages[context] && contextSpecificMessages[context][status]) {
    return contextSpecificMessages[context][status];
  }

  // Använd standardmeddelande eller "Ett okänt fel uppstod" om inget passar
  return commonMessages[status] || 'Ett okänt fel uppstod';
};

/**
 * Hanterar API-fel och konverterar dem till lämplig feltyp
 * @param {Error} error - Ursprungligt fel från API
 * @param {string} context - Felkontext ('auth', 'security', etc)
 * @param {function} ErrorClass - Felklass att använda (standard: AppError)
 * @returns {never} - Kastar ett fel av lämplig typ
 */
export const handleApiError = (error, context = null, ErrorClass = AppError) => {
  let message, statusCode, errorObj;

  if (error.response) {
    // Server svarade med felkod
    const { status, data } = error.response;
    statusCode = status;
    message = data.message || getDefaultErrorMessage(status, context);
    errorObj = new ErrorClass(message, statusCode);
    
    // Logga feldetaljer för debugging
    logger.error(`API error (${status}): ${message}`, {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data
    });
  } else if (error.request) {
    // Ingen respons mottogs
    statusCode = 0;
    message = 'Ingen respons från servern';
    errorObj = new ErrorClass(message, statusCode);
    logger.error('Network error - No response:', message);
  } else {
    // Annat fel inträffade
    statusCode = 0;
    message = error.message || 'Ett okänt fel uppstod';
    errorObj = new ErrorClass(message, statusCode);
    logger.error('Unknown error:', message);
  }

  throw errorObj;
};

/**
 * Specialiserad funktion för hantering av autentiseringsfel
 * @param {Error} error - Ursprungligt fel från API
 * @returns {never} - Kastar ett AuthError
 */
export const handleAuthError = (error) => {
  return handleApiError(error, 'auth', AuthError);
};

/**
 * Specialiserad funktion för hantering av säkerhetsfel
 * @param {Error} error - Ursprungligt fel från API
 * @returns {never} - Kastar ett SecurityError
 */
export const handleSecurityError = (error) => {
  return handleApiError(error, 'security', SecurityError);
};

/**
 * Validerar en JWT-token
 * @param {string} token - JWT-token att validera
 * @returns {Object} - Objekt med validitetsinfo: {valid, payload, expiry, error}
 */
export const validateJwtToken = (token) => {
  if (!token) {
    return { valid: false, error: 'Token saknas' };
  }

  try {
    // Extrahera och avkoda payload
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Felaktigt token-format' };
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));

    // Kontrollera utgångstid
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      
      if (expDate < now) {
        return {
          valid: false, 
          payload,
          expiry: expDate,
          error: 'Token har löpt ut'
        };
      }
    }

    // Token är giltig
    return {
      valid: true,
      payload,
      expiry: payload.exp ? new Date(payload.exp * 1000) : null
    };
  } catch (e) {
    logger.error('Fel vid avkodning av token:', e);
    return { valid: false, error: 'Fel vid avkodning' };
  }
};

/**
 * Hanterar autentiseringsfel baserat på HTTP-statuskod
 * @param {number} status - HTTP statuskod
 * @param {object} config - Request konfiguration
 * @returns {void}
 */
export const handleAuthStatusError = (status, config = {}) => {
  switch (status) {
    case 401:
      logger.error('401 Unauthorized - Token ogiltig eller saknas');
      removeAuthToken();
      redirectToLogin();
      break;
    
    case 403:
      logger.error('403 Forbidden - Användaren saknar behörighet', config.url);
      
      // Validera token och omdirigera vid behov
      const token = getAuthToken();
      if (token) {
        const validation = validateJwtToken(token);
        if (!validation.valid) {
          logger.error('Token ogiltig:', validation.error);
          removeAuthToken();
          redirectToLogin();
        } else {
          logger.error('Token är giltig men användaren saknar behörighet för denna åtgärd');
        }
      } else {
        logger.error('Ingen token hittades');
        redirectToLogin();
      }
      break;
      
    default:
      logger.error(`API Error (${status}):`, config?.method?.toUpperCase(), config?.url);
  }
};

/**
 * Hjälpfunktion för att omdirigera till inloggningssidan
 */
const redirectToLogin = () => {
  window.location.href = '/login';
};

/**
 * Hjälpfunktion för att hämta auth token
 * Utdragen som en funktion för att undvika cykliska beroenden
 */
const getAuthToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch (e) {
    logger.error('Fel vid hämtning av token:', e);
    return null;
  }
}; 