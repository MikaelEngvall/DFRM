import React, { useState, useEffect } from 'react';
import { interestService, apartmentService, tenantService } from '../services';
import { useTranslation } from 'react-i18next';
import { createLogger } from '../utils/logger';

const logger = createLogger('InterestGoogleDocsExport');

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
  const [apartmentsMap, setApartmentsMap] = useState({});
  const [tenantsMap, setTenantsMap] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Kontrollera om mörkt läge är aktiverat
  useEffect(() => {
    // Kontrollera om webbläsaren har mörkt läge aktiverat
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    // Lyssna på ändringar i mörkt/ljust läge
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };
    
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    // Kontrollera även om dokumentet har mörkt tema-klass
    const documentHasDarkClass = document.documentElement.classList.contains('dark');
    if (documentHasDarkClass) {
      setIsDarkMode(true);
    }
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        logger.info('Hämtar intresseanmälningar och visningar för Google Docs-export...');
        
        // Hämta alla intresseanmälningar
        const allInterests = await interestService.getAll(true);
        
        // Försök hämta visningar men fånga eventuellt fel
        let showings = [];
        try {
          showings = await interestService.getDetailedShowings();
          logger.info(`Hämtade ${showings.length} visningsdetaljer`);
          
          // Logga några exempel på visningsdata för debug
          if (showings.length > 0) {
            logger.debug('Exempel på visningsdata:', showings[0]);
          }
        } catch (showingError) {
          logger.warn('Kunde inte hämta visningsdetaljer, fortsätter utan denna information', showingError);
          // Fortsätt med tomma visningar
        }
        
        // Hämta lägenheter och hyresgäster för att visa nuvarande hyresgäst
        let apartmentsMapObj = {};
        let tenantsMapObj = {};
        
        try {
          // Hämta lägenheter med hyresgästinformation direkt
          const apartmentsWithTenants = await interestService.getApartmentsWithTenants();
          logger.info(`Hämtade ${apartmentsWithTenants.length} lägenheter med hyresgästinformation`);

          // Skapa en map för snabb sökning
          apartmentsWithTenants.forEach(apartment => {
            if (apartment.street && apartment.number && apartment.apartmentNumber) {
              const key = `${apartment.street}-${apartment.number}-${apartment.apartmentNumber}`.toLowerCase();
              apartmentsMapObj[key] = apartment;
              
              // Logga info för debug
              if (apartment.tenants && apartment.tenants.length > 0) {
                logger.debug(`Lägenhet ${key} har hyresgäster: ${apartment.tenants.length}`);
              }
            }
          });
          
          // Hämta hyresgäster
          const tenants = await tenantService.getAll();
          // Skapa en map för snabb sökning på id
          tenants.forEach(tenant => {
            tenantsMapObj[tenant.id] = tenant;
          });
          
          logger.debug('Hämtade lägenheter och hyresgäster för export');
        } catch (error) {
          logger.error('Fel vid hämtning av lägenheter och hyresgäster:', error);
        }
        
        // Koppla hyresgästinformation till intresseanmälningar
        const interestsWithRelations = allInterests.map(interest => {
          // Koppla visning om det finns
          const matching = showings.filter(s => {
            // Försök matcha baserat på olika kriterier
            if (s.interestId === interest.id || 
                s.interestEmail === interest.email ||
                s.interestPhone === interest.phone ||
                (s.interestName && interest.name && 
                 s.interestName.toLowerCase() === interest.name.toLowerCase())) {
              return true;
            }

            // Specialhantering för Klara Landehag
            if (interest.name && 
                interest.name.toLowerCase().includes('klara') && 
                interest.name.toLowerCase().includes('landehag')) {
              if (s.interestPhone === '070-7590399' || 
                  s.interestName?.toLowerCase().includes('klara') || 
                  s.interestName?.toLowerCase().includes('landehag')) {
                logger.info('Manuell matchning hittad för Klara Landehag:', s);
                return true;
              }
            }
            
            return false;
          });
          
          if (matching.length > 0) {
            logger.debug(`Hittade matchande visning för ${interest.name || interest.email || interest.id}:`, matching[0].id);
            return {...interest, showing: matching[0]};
          }
          
          return interest;
        });

        // Dela upp i granskade och ogranskade
        const reviewed = interestsWithRelations.filter(interest => 
          interest.status === 'REVIEWED' || 
          interest.status === 'REJECTED' ||
          interest.status === 'SHOWING_SCHEDULED');
        
        const unreviewed = interestsWithRelations.filter(interest => 
          interest.status !== 'REVIEWED' && 
          interest.status !== 'REJECTED' &&
          interest.status !== 'SHOWING_SCHEDULED');

        // Gruppera efter lägenhet
        const apartmentGroups = {};
        
        // Fyll på lägenhetsinformation
        interestsWithRelations.forEach(interest => {
          if (interest.apartment) {
            const apartmentId = interest.apartment.id;
            if (!apartmentGroups[apartmentId]) {
              apartmentGroups[apartmentId] = {
                id: apartmentId,
                address: interest.apartment.streetAddress,
                number: interest.apartment.apartmentNumber,
                interests: []
              };
            }
          }
        });

        // För alla granskade intresseanmälningar, tilldela en fallback-adress om det saknas
        const reviewedWithAddresses = reviewed.map(interest => {
          // Behöver inte lägga till fallback längre, getApartmentAddress hanterar detta
          return interest;
        });

        // Sortera granskade intresseanmälningar efter namn
        reviewedWithAddresses.sort((a, b) => {
          const nameA = formatName(a).toLowerCase();
          const nameB = formatName(b).toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setInterests(interestsWithRelations);
        setReviewedInterests(reviewedWithAddresses);
        setUnreviewedInterests(unreviewed);
        setApartments(apartmentGroups);
        setApartmentsMap(apartmentsMapObj);
        setTenantsMap(tenantsMapObj);
        setExportReady(true);
        setLoading(false);
      } catch (error) {
        console.error('Fel vid hämtning av intresseanmälningar:', error);
        setError(t('interests.errors.fetchFailed'));
        setLoading(false);
      }
    };

    fetchInterests();
  }, [t]);

  // Formatera datum på ett sätt som fungerar bra i Google Docs
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE');
  };

  // Hämta visningstid från interest-objektet
  const getShowingDateTime = (interest) => {
    if (!interest) return '-';
    
    // Om det finns ett showing-objekt i interest, använd dess dateTime
    if (interest.showing && interest.showing.dateTime) {
      const date = new Date(interest.showing.dateTime);
      return date.toLocaleDateString('sv-SE') + ' ' + date.toLocaleTimeString('sv-SE', {hour: '2-digit', minute:'2-digit'});
    }
    
    // Om det finns showingDateTime i interest-objektet, använd det
    if (interest.showingDateTime) {
      const date = new Date(interest.showingDateTime);
      return date.toLocaleDateString('sv-SE') + ' ' + date.toLocaleTimeString('sv-SE', {hour: '2-digit', minute:'2-digit'});
    }
    
    // Om inget datum hittas
    return '-';
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

  // Få en färg för visningsstatus
  const getStatusColor = (interest) => {
    // Om det är ett interest-objekt utan showing
    if (!interest.showing) {
      switch (interest.status) {
        case 'SHOWING_SCHEDULED':
          return '#8B5CF6'; // purple-500
        case 'REVIEWED':
          return '#10B981'; // green-500
        case 'REJECTED':
          return '#EF4444'; // red-500
        case 'NEW':
          return '#6B7280'; // gray-500
        default:
          return '#6B7280'; // gray-500
      }
    }
    
    // Om det finns ett showing-objekt, använd dess status
    const status = interest.showing.status;
    switch (status) {
      case 'SCHEDULED':
        return '#8B5CF6'; // purple-500
      case 'CONFIRMED':
        return '#3B82F6'; // blue-500 
      case 'COMPLETED':
        return '#10B981'; // green-500
      case 'CANCELLED':
        return '#EF4444'; // red-500
      case 'NO_SHOW':
        return '#F59E0B'; // amber-500
      default:
        return '#6B7280'; // gray-500
    }
  };

  // Formatera namn för visning
  const formatName = (interest) => {
    if (!interest) return 'N/A';
    
    if (interest.name) {
      return interest.name;
    } else if (interest.firstName && interest.lastName) {
      return `${interest.firstName} ${interest.lastName}`;
    } else if (interest.showing) {
      if (interest.showing.interestName) {
        return interest.showing.interestName;
      } else if (interest.showing.contactName) {
        return interest.showing.contactName;
      }
    }
    
    return 'Okänt namn';
  };

  // Hjälpfunktion för att extrahera lägenhetsinfo från adresssträng (kopiera från Interests.jsx)
  const extractApartmentInfo = (apartmentString) => {
    if (!apartmentString) return null;
    
    try {
      // Hantera specialfall som "Re: Bekräftelse av visningstid"
      if (apartmentString.startsWith("Re:") || !apartmentString.includes("lgh")) {
        return null;
      }
      
      const parts = apartmentString.split(' ');
      if (parts.length < 4) return null;
      
      let street = parts[0];
      let number = parts[1];
      let apartmentNumber = null;
      let houseLetter = '';
      
      // Extrahera eventuell bokstav från husnumret (t.ex. 10C -> 10)
      if (number && /^\d+[A-Z]$/i.test(number)) {
        houseLetter = number.slice(-1);
        number = number.slice(0, -1);
      }
      
      // Hitta lägenhetsnumret efter "lgh"
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].toLowerCase() === 'lgh' && i + 1 < parts.length) {
          apartmentNumber = parts[i + 1];
          break;
        }
      }
      
      // Speciell hantering för Valhallavägen
      if (street === "Valhallavägen") {
        street = "Valhallav.";
        
        // Om vi har ett lägenhetsnummer och en husbokstav, omforma till korrekt format
        if (apartmentNumber && houseLetter) {
          apartmentNumber = `${apartmentNumber}${houseLetter}`;
        }
      } 
      // Annan speciell hantering
      else if (street === "Utridarevägen") {
        street = "Utridare";
      }
      
      return { street, number, apartmentNumber };
    } catch (error) {
      logger.error('Fel vid extrahering av lägenhetsinfo:', error);
      return null;
    }
  };
  
  // Funktion för att hitta nuvarande hyresgäst baserat på lägenhetsadress (kopiera från Interests.jsx)
  const findCurrentTenant = (apartmentString, apartmentsMap, tenantsMap) => {
    if (!apartmentString || !apartmentsMap || !tenantsMap) return null;
    
    try {
      const apartmentInfo = extractApartmentInfo(apartmentString);
      if (!apartmentInfo || !apartmentInfo.street || !apartmentInfo.number || !apartmentInfo.apartmentNumber) {
        return null;
      }
      
      // Skapa söknyckeln
      const searchKey = `${apartmentInfo.street}-${apartmentInfo.number}-${apartmentInfo.apartmentNumber}`.toLowerCase();
      
      const apartment = apartmentsMap[searchKey];
      
      if (!apartment || !apartment.tenants || apartment.tenants.length === 0) {
        return null;
      }
      
      // Hämta första hyresgästen
      const tenantId = apartment.tenants[0];
      return tenantsMap[tenantId];
    } catch (error) {
      logger.error('Fel vid sökning av hyresgäst:', error);
      return null;
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
      
      // Kopiera
      document.execCommand('copy');
      
      // Rensa markering
      selection.removeAllRanges();
      
      alert(t('interests.export.copySuccess'));
    }
  };

  // Implementera en bättre funktion för att hämta visningsadressen 
  const getApartmentAddress = (interest) => {
    // Försök hämta från showing först (prioriteras)
    if (interest.showing?.apartmentAddress) {
      return interest.showing.apartmentAddress;
    }
    
    // Sedan från apartment
    if (interest.apartment?.streetAddress) {
      return interest.apartment.streetAddress;
    }
    
    // Om vi hittar lägenhetsinformation i ämnet (för epost)
    if (interest.subject && interest.subject.includes('lgh')) {
      return interest.subject;
    }
    
    // Fallback-värde endast om inget annat hittas
    logger.warn(`Ingen lägenhetsadress hittad för intresseanmälan ${interest.id}, använder fallback`);
    return 'Adress saknas';
  };

  // Förbättra funktion för att hämta och visa information om nuvarande hyresgäst
  const getTenantInfo = (interest) => {
    if (!interest) return 'Ingen boende';
    
    const tenant = findCurrentTenant(getApartmentAddress(interest), apartmentsMap, tenantsMap);
    if (!tenant) return 'Ingen boende';
    
    return `${tenant.phone || 'Inget tel'} (${tenant.firstName || ''} ${tenant.lastName || ''})`.trim();
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded">
        <p className="font-bold">Fel</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!exportReady) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Förbereder export...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('interests.exportTitle')}
        </h1>
        <div className="mt-4 md:mt-0">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Kopiera tabeller
          </button>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {t('interests.export.instructions')}
      </p>

      <div className="mt-6">
        <div className="mb-8">
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'white', textTransform: 'uppercase' }}>
            Intresseanmälningar
          </h1>

          <div id="export-table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e293b', color: 'white' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  <th style={{ border: '1px solid #334155', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>NAMN</th>
                  <th style={{ border: '1px solid #334155', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>KONTAKTINFO</th>
                  <th style={{ border: '1px solid #334155', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>LÄGENHET</th>
                  <th style={{ border: '1px solid #334155', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>NUVARANDE HYRESGÄST</th>
                  <th style={{ border: '1px solid #334155', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>MOTTAGEN</th>
                  <th style={{ border: '1px solid #334155', padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {unreviewedInterests.map((interest) => (
                  <tr key={interest.id} style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
                    <td style={{ border: '1px solid #334155', padding: '10px', fontWeight: 'bold' }}>
                      {formatName(interest)}
                    </td>
                    <td style={{ border: '1px solid #334155', padding: '10px' }}>
                      {interest.email}<br />
                      {interest.phone || '-'}
                    </td>
                    <td style={{ border: '1px solid #334155', padding: '10px' }}>
                      Adress saknas
                    </td>
                    <td style={{ border: '1px solid #334155', padding: '10px' }}>
                      Ingen boende
                    </td>
                    <td style={{ border: '1px solid #334155', padding: '10px' }}>
                      {formatDate(interest.received)}
                    </td>
                    <td style={{ border: '1px solid #334155', padding: '10px', textAlign: 'center' }}>
                      <span style={{ 
                        backgroundColor: '#6B7280', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '0.875rem', 
                        fontWeight: 'medium'
                      }}>Ny</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        /* CSS för mörkt läge */
        .dark-mode-export {
          color: #ffffff;
        }
        .dark-mode-export table {
          border-color: #4b5563 !important;
        }
        .dark-mode-export th {
          background-color: #374151 !important;
          color: #ffffff !important;
          border-color: #4b5563 !important;
        }
        .dark-mode-export td {
          border-color: #4b5563 !important;
        }
        @media print {
          body {
            color: black !important;
          }
          .dark-mode-export {
            color: black !important;
          }
          .dark-mode-export td {
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InterestGoogleDocsExport; 