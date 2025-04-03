/**
 * Logger-tjänst med stöd för olika loggnivåer och miljökonfiguration
 * Används för att centralisera och kontrollera loggning i applikationen
 */

// Loggnivåer i ordning från minst detaljerad till mest detaljerad
export const LOG_LEVELS = {
  OFF: 0,     // Ingen loggning
  ERROR: 1,   // Endast fel
  WARN: 2,    // Fel och varningar
  INFO: 3,    // Fel, varningar och vanlig information
  DEBUG: 4,   // Allt ovan plus debug-information
  TRACE: 5    // Mest detaljerad loggning
};

// Standardkonfiguration
const defaultConfig = {
  // I produktion loggas endast fel och varningar
  level: process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG,
  // Inaktivera konsolloggning helt i produktion genom att ställa in denna till true
  disableInProduction: false,
  // Prefix för alla loggmeddelanden
  prefix: '[DFRM]'
};

class Logger {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config };
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Kontrollerar om en viss loggnivå ska loggas baserat på konfigurationen
   * @param {number} level - Loggnivån att kontrollera
   * @returns {boolean} True om nivån ska loggas
   */
  shouldLog(level) {
    // Om loggning är avstängd i produktion och vi är i produktion
    if (this.isProduction && this.config.disableInProduction) {
      return false;
    }
    
    // Kontrollera om nivån är lägre än eller lika med den konfigurerade nivån
    return level <= this.config.level;
  }

  /**
   * Formaterar ett meddelande med prefix och andra detaljer
   * @param {string} level - Nivånamn (t.ex. "ERROR", "WARN")
   * @param {string} message - Meddelande att logga
   * @returns {string} Formaterat meddelande
   */
  formatMessage(level, message) {
    return `${this.config.prefix} [${level}] ${message}`;
  }

  /**
   * Loggar ett felmeddelande
   * @param {string} message - Meddelande att logga
   * @param {*} [error] - Tillhörande fel (optional)
   */
  error(message, error) {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
    
    const formattedMessage = this.formatMessage('ERROR', message);
    
    if (error) {
      console.error(formattedMessage, error);
    } else {
      console.error(formattedMessage);
    }
  }

  /**
   * Loggar en varning
   * @param {string} message - Meddelande att logga
   * @param {*} [data] - Tillhörande data (optional)
   */
  warn(message, data) {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    
    const formattedMessage = this.formatMessage('WARN', message);
    
    if (data) {
      console.warn(formattedMessage, data);
    } else {
      console.warn(formattedMessage);
    }
  }

  /**
   * Loggar ett informationsmeddelande
   * @param {string} message - Meddelande att logga
   * @param {*} [data] - Tillhörande data (optional)
   */
  info(message, data) {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    
    const formattedMessage = this.formatMessage('INFO', message);
    
    if (data) {
      console.info(formattedMessage, data);
    } else {
      console.info(formattedMessage);
    }
  }

  /**
   * Loggar ett debug-meddelande
   * @param {string} message - Meddelande att logga
   * @param {*} [data] - Tillhörande data (optional)
   */
  debug(message, data) {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    
    const formattedMessage = this.formatMessage('DEBUG', message);
    
    if (data) {
      console.debug(formattedMessage, data);
    } else {
      console.debug(formattedMessage);
    }
  }

  /**
   * Loggar detaljerad spårningsinformation
   * @param {string} message - Meddelande att logga
   * @param {*} [data] - Tillhörande data (optional)
   */
  trace(message, data) {
    if (!this.shouldLog(LOG_LEVELS.TRACE)) return;
    
    const formattedMessage = this.formatMessage('TRACE', message);
    
    if (data) {
      console.log(formattedMessage, data);
    } else {
      console.log(formattedMessage);
    }
  }
}

// Skapa och exportera en standardinstans
const defaultLogger = new Logger();

export default defaultLogger;

/**
 * Skapar en anpassad logger för en specifik komponent eller modul
 * @param {string} namespace - Namnrymd för loggern (t.ex. "Calendar", "Interests")
 * @param {object} [config] - Eventuell överskrivande konfiguration
 * @returns {Logger} En ny logger-instans
 */
export const createLogger = (namespace, config = {}) => {
  return new Logger({
    ...defaultConfig,
    ...config,
    prefix: `${defaultConfig.prefix}:${namespace}`
  });
}; 