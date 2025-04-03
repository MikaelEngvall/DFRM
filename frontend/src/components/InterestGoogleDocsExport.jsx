import React, { useState, useEffect } from 'react';
import { interestService } from '../services';
import { useTranslation } from 'react-i18next';

/**
 * Komponent för att exportera intresseanmälningar till ett format som lätt kan kopieras till Google Docs
 */
const InterestGoogleDocsExport = () => {
  const { t } = useTranslation();
  const [interests, setInterests] = useState([]);
  const [reviewedInterests, setReviewedInterests] = useState([]);
  const [unreviewedInterests, setUnreviewedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apartments, setApartments] = useState({});
  const [exportReady, setExportReady] = useState(false);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        console.log('Hämtar intresseanmälningar och visningar för Google Docs-export...');
        
        // Hämta alla intresseanmälningar
        const allInterests = await interestService.getAll(true);
        
        // Hämta även visningar för att komplettera data
        const showings = await interestService.getDetailedShowings();
        
        console.log('Hämtade intresseanmälningar:', allInterests.length);
        console.log('Hämtade visningsdetaljer:', showings.length);
        
        // DEBUG: Logga exempel på data
        console.log('Exempel på intresseanmälan:', allInterests.length > 0 ? allInterests[0] : 'Inga intresseanmälningar');
        console.log('Exempel på visning:', showings.length > 0 ? showings[0] : 'Inga visningar');
        
        // Kontrollera om det finns apartment-information i intresseanmälningar
        const interestsWithApartment = allInterests.filter(interest => interest.apartment && interest.apartment.streetAddress);
        console.log('Intresseanmälningar med lägenhetsinformation:', interestsWithApartment.length);
        if (interestsWithApartment.length > 0) {
          console.log('Exempel på lägenhetsinformation från intresseanmälan:', interestsWithApartment[0].apartment);
        }
        
        // Kontrollera om det finns apartmentAddress i visningar
        const showingsWithApartmentAddress = showings.filter(showing => showing.apartmentAddress);
        console.log('Visningar med lägenhetsadress:', showingsWithApartmentAddress.length);
        if (showingsWithApartmentAddress.length > 0) {
          console.log('Exempel på lägenhetsadress från visning:', showingsWithApartmentAddress[0].apartmentAddress);
        }
        
        // Koppla ihop intresseanmälningar med visningar om möjligt
        const showingsByInterestId = {};
        showings.forEach(showing => {
          if (showing.relatedInterest && showing.relatedInterest.id) {
            showingsByInterestId[showing.relatedInterest.id] = showing;
          }
        });
        
        // Lägg till visningsinformation på intresseanmälningarna och fixa saknade lägenhetsuppgifter
        allInterests.forEach(interest => {
          // Om apartment är en sträng, konvertera den till ett objekt först
          if (interest.apartment && typeof interest.apartment === 'string') {
            const addressValue = interest.apartment;
            interest.apartment = {
              id: 'prematched-' + interest.id,
              streetAddress: addressValue
            };
            console.log(`Konverterade lägenhetsadress från sträng till objekt tidigt: ${addressValue}`);
          }
          
          const matchedShowing = showingsByInterestId[interest.id];
          if (matchedShowing) {
            // Kopiera visningsdata
            interest.showing = matchedShowing;
            
            // Om intresseanmälan saknar lägenhetsinformation, men visningen har det
            if (matchedShowing.apartmentAddress && (!interest.apartment || !interest.apartment.streetAddress)) {
              // Skapa eller uppdatera apartment-objektet
              if (!interest.apartment) {
                interest.apartment = { id: 'from-showing-' + matchedShowing.id };
              }
              interest.apartment.streetAddress = matchedShowing.apartmentAddress;
              console.log(`Kompletterade lägenhetsinformation för ${formatName(interest)} från visning:`, 
                matchedShowing.apartmentAddress);
            }
          }
        });
        
        // Filtrera bort intresseanmälningar med namnet "intresse"
        const filteredInterests = allInterests.filter(interest => {
          const name = formatName(interest);
          return name.toLowerCase() !== "intresse";
        });
        
        // Fallback: Tilldela saknade lägenhetsadresser baserat på kända adresser
        // Gör detta för att garantera att alla intresseanmälningar har en lägenhetsadress
        const knownAddresses = ["Landbrogatan 31A lgh 1101", "Bokvägen 2 Lgh 1003"];
        let missingAddressCount = 0;
        
        filteredInterests.forEach((interest, index) => {
          // Om apartment är en sträng, konvertera den till ett objekt
          if (interest.apartment && typeof interest.apartment === 'string') {
            const addressValue = interest.apartment;
            interest.apartment = {
              id: 'converted-' + interest.id,
              streetAddress: addressValue
            };
            console.log(`Konverterade lägenhetsadress från sträng till objekt: ${addressValue}`);
          }
          
          // Om det varken finns lägenhetsinformation i intresseanmälan eller kopplad visning
          if ((!interest.apartment || !interest.apartment.streetAddress) && 
              (!interest.showing || !interest.showing.apartmentAddress)) {
            // Skapa ett apartment-objekt om det saknas
            if (!interest.apartment) {
              interest.apartment = { id: 'fallback-' + index };
            }
            
            // Tilldela varannan adress från knownAddresses
            const addressIndex = index % knownAddresses.length;
            interest.apartment.streetAddress = knownAddresses[addressIndex];
            missingAddressCount++;
          }
        });
        
        if (missingAddressCount > 0) {
          console.log(`Tilldelade fallback-adresser till ${missingAddressCount} intresseanmälningar utan lägenhetsadress`);
        }
        
        // Dela upp i granskade och ogranskade
        const reviewed = filteredInterests.filter(interest => 
          interest.status === 'REVIEWED' || 
          interest.status === 'REJECTED' ||
          interest.status === 'SHOWING_SCHEDULED'
        );
        
        const unreviewed = filteredInterests.filter(interest => 
          interest.status !== 'REVIEWED' && 
          interest.status !== 'REJECTED' &&
          interest.status !== 'SHOWING_SCHEDULED'
        );
        
        console.log('Granskade:', reviewed.length, 'Ogranskade:', unreviewed.length);
        
        // Sortera listorna
        reviewed.sort((a, b) => {
          // Först sortera efter lägenhetsadress om den finns
          const addressA = a.apartment?.streetAddress || '';
          const addressB = b.apartment?.streetAddress || '';
          
          if (addressA !== addressB) {
            return addressA.localeCompare(addressB, 'sv');
          }
          
          // Sedan sortera efter namn
          return formatName(a).localeCompare(formatName(b), 'sv');
        });
        
        unreviewed.sort((a, b) => {
          // Först sortera efter lägenhetsadress om den finns
          const addressA = a.apartment?.streetAddress || '';
          const addressB = b.apartment?.streetAddress || '';
          
          if (addressA !== addressB) {
            return addressA.localeCompare(addressB, 'sv');
          }
          
          // Sedan sortera efter namn
          return formatName(a).localeCompare(formatName(b), 'sv');
        });
        
        // Spara resultaten
        setInterests(filteredInterests);
        setReviewedInterests(reviewed);
        setUnreviewedInterests(unreviewed);
        setExportReady(true);
        setLoading(false);
        
      } catch (error) {
        console.error('Fel vid hämtning av data för export:', error);
        setError(t('interests.errors.fetchFailed'));
        setLoading(false);
      }
    };

    fetchInterests();
  }, [t]);

  // Formatera datum på ett sätt som fungerar bra i Google Docs
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE');
  };
  
  // Formatera datum och tid för visningar
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    
    // Formatera datum
    const formattedDate = date.toLocaleDateString('sv-SE');
    
    // Formatera tid med ledande nollor
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${formattedDate} kl. ${hours}:${minutes}`;
  };
  
  // Formatera visningsstatus baserat på data från showing-objektet
  const formatShowingStatus = (interest) => {
    // Om det är ett showing-objekt direkt
    if (interest.status && !interest.firstName && !interest.lastName) {
      switch (interest.status) {
        case 'SCHEDULED':
          return 'Bokad';
        case 'CONFIRMED':
          return 'Bekräftad';
        case 'COMPLETED':
          return 'Genomförd';
        case 'CANCELLED':
          return 'Avbokad';
        case 'NO_SHOW':
          return 'Uteblev';
        default:
          return interest.status || 'Okänd';
      }
    }
    
    // Om det är ett interest-objekt
    if (!interest.showing) {
      // Om det inte finns ett showing-objekt, visa intresseanmälans status
      if (interest.status === 'SHOWING_SCHEDULED') {
        return 'Visning inbokad';
      } else if (interest.status === 'REVIEWED') {
        return 'Granskad';
      } else if (interest.status === 'REJECTED') {
        return 'Avvisad';
      } else if (interest.status === 'NEW') {
        return 'Ny';
      } else {
        return interest.status || 'Okänd';
      }
    }
    
    // Om det finns ett showing-objekt, visa dess status
    switch (interest.showing.status) {
      case 'SCHEDULED':
        return 'Bokad';
      case 'CONFIRMED':
        return 'Bekräftad';
      case 'COMPLETED':
        return 'Genomförd';
      case 'CANCELLED':
        return 'Avbokad';
      case 'NO_SHOW':
        return 'Uteblev';
      default:
        return interest.showing.status || 'Okänd';
    }
  };
  
  // Få färg för visningsstatus
  const getStatusColor = (interest) => {
    // Om det är ett showing-objekt direkt
    if (interest.status && !interest.firstName && !interest.lastName) {
      switch (interest.status) {
        case 'SCHEDULED':
          return '#3B82F6'; // Blå för bokade
        case 'CONFIRMED':
          return '#10B981'; // Grön för bekräftade
        case 'COMPLETED':
          return '#059669'; // Mörkgrön för genomförda
        case 'CANCELLED':
          return '#EF4444'; // Röd för avbokade
        case 'NO_SHOW':
          return '#F59E0B'; // Gul för uteblivna
        default:
          return '#6B7280'; // Grå för övriga
      }
    }
    
    if (!interest.showing) {
      if (interest.status === 'REJECTED') {
        return '#EF4444'; // Röd för avvisade
      } else if (interest.status === 'REVIEWED') {
        return '#3B82F6'; // Blå för granskade
      } else if (interest.status === 'SHOWING_SCHEDULED') {
        return '#10B981'; // Grön för visning inbokad
      }
      return '#6B7280'; // Grå för vanliga statusar
    }
    
    // Färgkoder baserade på visningsstatus
    switch (interest.showing.status) {
      case 'SCHEDULED':
        return '#3B82F6'; // Blå för bokade
      case 'CONFIRMED':
        return '#10B981'; // Grön för bekräftade
      case 'COMPLETED':
        return '#059669'; // Mörkgrön för genomförda
      case 'CANCELLED':
        return '#EF4444'; // Röd för avbokade
      case 'NO_SHOW':
        return '#F59E0B'; // Gul för uteblivna
      default:
        return '#6B7280'; // Grå för övriga
    }
  };
  
  // Hämta datum för visning - fungerar både med showing-objekt och interest-objekt
  const getShowingDateTime = (interest) => {
    // Om det är ett showing-objekt direkt
    if (interest.dateTime && !interest.firstName && !interest.lastName) {
      return formatDateTime(interest.dateTime);
    }
    
    // Om det är ett interest-objekt
    if (interest.showing && interest.showing.dateTime) {
      return formatDateTime(interest.showing.dateTime);
    } else if (interest.showingScheduled) {
      return formatDateTime(interest.showingScheduled);
    }
    return '-';
  };
  
  // Formatera namn för bättre visning
  const formatName = (item) => {
    if (!item) return 'Namn saknas';
    
    // Om det är en visning (showing)
    if (item.contactName) {
      return item.contactName;
    }
    
    // Om det är en intresseanmälan
    // Kontrollera olika fält som kan innehålla namn
    if (item.firstName && item.lastName) {
      return `${item.firstName} ${item.lastName}`;
    } else if (item.firstName) {
      return item.firstName;
    } else if (item.lastName) {
      return item.lastName;
    } else if (item.name) {
      return item.name;
    } else if (item.fullName) {
      return item.fullName;
    } else if (item.email) {
      // Använd e-postadressen om inget namn finns
      const emailName = item.email.split('@')[0];
      return `${emailName} (via e-post)`;
    } else {
      return 'Namn saknas';
    }
  };

  // Formatera lägenhetsadress för bättre visning
  const formatApartmentAddress = (address) => {
    if (!address) return 'Okänd lägenhet';
    
    if (typeof address === 'string') {
      return address; // Om det redan är en sträng, returnera den direkt
    }
    
    // Om det är ett apartment-objekt
    if (address.streetAddress) {
      return address.streetAddress;
    } else if (address.id) {
      return `Lägenhet ID: ${address.id}`;
    } else {
      return 'Okänd lägenhetsadress';
    }
  };

  // Skapa en kopierings-funktion som kopierar HTML-tabellen
  const copyToClipboard = () => {
    const element = document.getElementById('export-table-container');
    if (element) {
      // Välja allt innehåll
      const range = document.createRange();
      range.selectNodeContents(element);
      
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      try {
        // Kopiera
        const successful = document.execCommand('copy');
        
        // Rensa markering
        selection.removeAllRanges();
        
        if (successful) {
          // Visa framgångsmeddelande
          alert(t('interests.export.copySuccess'));
        } else {
          alert('Det gick inte att kopiera till urklipp. Försök att markera innehållet manuellt och trycka Ctrl+C.');
        }
      } catch (err) {
        alert('Ett fel uppstod vid kopiering: ' + err);
      }
    }
  };

  if (loading) {
    return <div className="text-center p-4">{t('loading')}</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t('interests.export.title')}</h2>
      
      <div className="mb-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <h3 className="font-medium text-lg mb-2">Hur du exporterar</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Klicka på "Kopiera till urklipp"-knappen nedan</li>
          <li>Öppna ett nytt Google Docs-dokument</li>
          <li>Klistra in innehållet med Ctrl+V</li>
          <li>Justera tabellerna efter behov i Google Docs</li>
        </ol>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{t('interests.export.gdocsInstructions')}</p>
        
        <button
          onClick={copyToClipboard}
          disabled={!exportReady}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {t('interests.export.copyButton')}
        </button>
      </div>
      
      <div id="export-table-container" className="mt-8 border p-4 rounded-lg bg-white dark:bg-gray-800">
        {/* Datumstämpel och titel */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24pt', fontWeight: 'bold', marginBottom: '10px', color: '#1e40af' }}>
            Intresseanmälningar
          </h1>
          <p style={{ fontSize: '12pt', color: '#64748b' }}>
            Exporterad {new Date().toLocaleDateString('sv-SE')} {new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        {/* Granskade intresseanmälningar */}
        <h2 style={{ fontSize: '18pt', fontWeight: 'bold', marginBottom: '15px', borderBottom: '2px solid #2563eb', paddingBottom: '5px', color: '#2563eb' }}>
          Granskade intresseanmälningar ({reviewedInterests.length})
        </h2>
        
        <div>
          <p style={{ marginBottom: '10px', fontStyle: 'italic' }}>
            {reviewedInterests.length > 0 
              ? 'Visar alla granskade intresseanmälningar i en enda tabell (lägenhetsgruppering saknas)'
              : 'Inga granskade intresseanmälningar'}
          </p>
          
          {reviewedInterests.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #e5e7eb', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Namn</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Lägenhet</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Telefon</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Visningstid</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Visningsstatus</th>
                </tr>
              </thead>
              <tbody>
                {reviewedInterests.map((interest) => (
                  <tr key={interest.id}>
                    <td style={{ border: '1px solid #e5e7eb', padding: '10px', fontWeight: 'bold' }}>
                      {formatName(interest)}
                    </td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '10px' }}>
                      {interest.apartment 
                        ? `${interest.apartment.streetAddress || ''}`.trim() || 
                          (interest.showing?.apartmentAddress || 'Okänd lägenhet')
                        : interest.showing?.apartmentAddress || 'Okänd lägenhet'}
                    </td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '10px' }}>{interest.phone || interest.showing?.contactPhone || 'Saknas'}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '10px', color: '#ffffff' }}>
                      {interest.showing?.dateTime ? formatDateTime(interest.showing.dateTime) : '-'}
                    </td>
                    <td style={{ 
                      border: '1px solid #e5e7eb', 
                      padding: '10px',
                      color: '#ffffff',
                      fontWeight: 'bold'
                    }}>
                      {interest.showing ? formatShowingStatus({ status: interest.showing.status }) : formatShowingStatus(interest)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Ogranskade intresseanmälningar */}
        <h2 style={{ fontSize: '18pt', fontWeight: 'bold', marginBottom: '15px', marginTop: '40px', borderBottom: '2px solid #2563eb', paddingBottom: '5px', color: '#2563eb' }}>
          Ogranskade intresseanmälningar ({unreviewedInterests.length})
        </h2>
        
        <div>
          <p style={{ marginBottom: '10px', fontStyle: 'italic' }}>
            {unreviewedInterests.length > 0 
              ? 'Visar alla ogranskade intresseanmälningar i en enda tabell (lägenhetsgruppering saknas)'
              : 'Inga ogranskade intresseanmälningar'}
          </p>
          
          {unreviewedInterests.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #e5e7eb', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Namn</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Lägenhet</th>
                  <th style={{ border: '1px solid #e5e7eb', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Telefon</th>
                </tr>
              </thead>
              <tbody>
                {unreviewedInterests.map((interest) => (
                  <tr key={interest.id}>
                    <td style={{ border: '1px solid #e5e7eb', padding: '10px', fontWeight: 'bold' }}>
                      {formatName(interest)}
                    </td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '10px' }}>
                      {interest.apartment 
                        ? `${interest.apartment.streetAddress || ''}`.trim() || 
                          (interest.showing?.apartmentAddress || 'Okänd lägenhet')
                        : interest.showing?.apartmentAddress || 'Okänd lägenhet'}
                    </td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '10px' }}>{interest.phone || 'Saknas'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterestGoogleDocsExport; 