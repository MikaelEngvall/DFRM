import api from './api';

const emailService = {
  /**
   * Skickar e-post till en lista med mottagare som dold kopia (BCC)
   * @param {string} subject - E-postens ämne
   * @param {string} content - E-postens innehåll (HTML-format)
   * @param {string[]} recipients - Lista med e-postadresser som ska ta emot meddelandet
   * @returns {Promise<any>} - API-svar
   */
  sendBulkEmail: async (subject, content, recipients) => {
    try {
      console.log(`emailService.sendBulkEmail: skickar till ${recipients.length} mottagare`);
      console.log('Mottagarlista:', recipients);
      
      // Sätt en timeout på 20 sekunder för e-postutskicket
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: E-postuppsändningen tog för lång tid')), 20000);
      });
      
      // Skapa det faktiska API-anropet
      const fetchPromise = api.post('/api/mail/bulk', {
        subject,
        content,
        recipients
      });
      
      // Använd Promise.race för att returnera det som slutförs först, antingen API-anropet eller timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('Svar från API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending bulk email:', error);
      
      // Anpassa felmeddelandet baserat på feltyp
      if (error.message && error.message.includes('Timeout')) {
        throw new Error('E-postuppsändningen tog för lång tid. Vänligen försök igen senare.');
      } else if (error.response) {
        // Servern svarade med en felstatus
        console.error('Server error:', error.response.data);
        throw new Error(`Serversvar: ${error.response.data.message || 'Okänt fel'}`);
      } else if (error.request) {
        // Ingen respons mottogs från servern
        console.error('No response received:', error.request);
        throw new Error('Ingen respons mottogs från servern. Kontrollera nätverksanslutningen.');
      } else {
        // Något annat gick fel
        throw error;
      }
    }
  }
};

export default emailService; 