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
      console.log(`emailService.sendBulkEmail: schemaläggning till ${recipients.length} mottagare`);
      
      // Delar upp mottagarlistan i batchar om det är mer än 100 mottagare
      if (recipients.length > 100) {
        console.log(`Stor mottagarlista detekterad (${recipients.length} mottagare). Delar upp i mindre batchar.`);
        const batchSize = 100;
        const batches = [];
        
        // Skapa batchar
        for (let i = 0; i < recipients.length; i += batchSize) {
          batches.push(recipients.slice(i, i + batchSize));
        }
        
        console.log(`Skapad ${batches.length} batchar för att skicka.`);
        
        // Sekventiellt skicka varje batch för att undvika att överbelasta servern
        let successCount = 0;
        let errors = [];
        
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          console.log(`Skickar batch ${i+1}/${batches.length} (${batch.length} mottagare)...`);
          
          try {
            const response = await api.post('/api/mail/bulk', {
              subject,
              content,
              recipients: batch
            });
            
            console.log(`Batch ${i+1} resultat:`, response.data);
            successCount += batch.length;
          } catch (error) {
            console.error(`Fel vid skickande av batch ${i+1}:`, error);
            errors.push(error);
          }
        }
        
        if (errors.length > 0) {
          console.warn(`${errors.length} av ${batches.length} batchar misslyckades.`);
          if (successCount > 0) {
            return {
              success: true,
              message: `${successCount} av ${recipients.length} mottagare fick e-post. Vissa batchar misslyckades.`,
              partialSuccess: true,
              recipientCount: successCount
            };
          } else {
            throw new Error(`Alla batchar misslyckades. Kontrollera server-loggar.`);
          }
        }
        
        return {
          success: true,
          message: `E-post schemalagd för ${successCount} mottagare`,
          recipientCount: successCount
        };
      } else {
        // Normal sändning för mindre antal mottagare (under 100)
        const response = await api.post('/api/mail/bulk', {
          subject,
          content,
          recipients
        });
        
        console.log('Svar från API:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error sending bulk email:', error);
      
      // Anpassa felmeddelandet baserat på feltyp
      if (error.response) {
        // Servern svarade med en felstatus
        console.error('Server error:', error.response.data);
        if (error.response.status === 504) {
          throw new Error(`Servern tog för lång tid på sig att svara. E-post kan fortfarande skickas i bakgrunden. Kontrollera med mottagarna.`);
        } else {
          throw new Error(`Serversvar: ${error.response.data.message || 'Okänt fel'}`);
        }
      } else if (error.request) {
        // Ingen respons mottogs från servern
        console.error('No response received:', error.request);
        throw new Error('Ingen respons mottogs från servern. E-post kan fortfarande skickas i bakgrunden. Kontrollera efter några minuter.');
      } else {
        // Något annat gick fel
        throw error;
      }
    }
  }
};

export default emailService; 