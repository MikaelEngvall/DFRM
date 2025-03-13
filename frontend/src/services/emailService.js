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
      
      const response = await api.post('/api/mail/bulk', {
        subject,
        content,
        recipients
      });
      
      console.log('Svar från API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw error;
    }
  }
};

export default emailService; 