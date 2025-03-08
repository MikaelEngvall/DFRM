/**
 * Formaterar datum till ÅÅMMDD-format
 * @param {string|Date} date - Datumet att formatera (ISO-sträng eller Date-objekt)
 * @param {string} defaultValue - Värdet att returnera om datumet är ogiltigt eller saknas
 * @returns {string} Formaterat datum i ÅÅMMDD-format eller defaultValue om datumet saknas
 */
export const formatShortDate = (date, defaultValue = '-') => {
  if (!date) return defaultValue;
  
  try {
    // Konvertera till Date-objekt om det är en sträng
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Kontrollera om datum är giltigt
    if (isNaN(dateObj.getTime())) return defaultValue;
    
    // Hämta år, månad och dag
    const year = dateObj.getFullYear().toString().slice(2); // Ta de sista två siffrorna av året
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Månader är 0-indexerade
    const day = dateObj.getDate().toString().padStart(2, '0');
    
    return `${year}${month}${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return defaultValue;
  }
};

/**
 * Formaterar datum till läsbart format (YYYY-MM-DD)
 * @param {string|Date} date - Datumet att formatera (ISO-sträng eller Date-objekt)
 * @param {string} defaultValue - Värdet att returnera om datumet är ogiltigt eller saknas
 * @returns {string} Formaterat datum i YYYY-MM-DD-format eller defaultValue om datumet saknas
 */
export const formatDateForInput = (date, defaultValue = '') => {
  if (!date) return defaultValue;
  
  try {
    // Konvertera till Date-objekt om det är en sträng
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Kontrollera om datum är giltigt
    if (isNaN(dateObj.getTime())) return defaultValue;
    
    // Formatera datumet till YYYY-MM-DD för HTML date-inmatning
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return defaultValue;
  }
}; 