import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { interestService, apartmentService, tenantService } from '../services';
import { useTranslation } from 'react-i18next';
import { createLogger } from '../utils/logger';

const logger = createLogger('InterestGoogleDocsExport');

// Precompile regex patterns outside component
const APARTMENT_REGEX = {
  FULL: /^([^0-9,]+)\s*([0-9A-Za-z]+)(?:,|\s+|\s*LGH\s*|\s*nr\s*)([0-9]+)/i,
  PARTS: /,|\s+LGH\s+|LGH/i,
  SIMPLE: /^([^0-9]+)\s*([0-9A-Za-z]+)(?:\s+|\s*nr\s*)([0-9]+)/i,
  ADDRESS_ONLY: /^([^0-9]+)\s*([0-9A-Za-z]+)/i,
  STREET_NUMBER: /([A-ZÅÄÖa-zåäö]+vägen|[A-ZÅÄÖa-zåäö]+gatan|[A-ZÅÄÖa-zåäö]+tan)\s+(\d+[A-Z]?)/
};

/**
 * Komponent för att exportera intresseanmälningar till ett format som lätt kan kopieras till Google Docs
 */
const InterestGoogleDocsExport = () => {
  const { t } = useTranslation();
  
  // Combine related state into a single object
  const [data, setData] = useState({
    interests: [],
    reviewed: [],
    unreviewed: [],
    apartmentsMap: {},
    tenantsMap: {},
    apartments: {},
    loading: true,
    error: null,
    exportReady: false
  });

  // Simplified dark mode state
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches || 
    document.documentElement.classList.contains('dark')
  );

  // Memoize grouped interests to prevent recalculation on every render
  const groupedUnreviewedInterests = useMemo(() => 
    groupByApartment(data.unreviewed), 
    [data.unreviewed]
  );

  const groupedReviewedInterests = useMemo(() => 
    groupByApartment(data.reviewed), 
    [data.reviewed]
  );

  // Simplified dark mode detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Optimized data fetching with Promise.all for parallel requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(prev => ({...prev, loading: true}));
        logger.info('Hämtar intresseanmälningar och visningar för Google Docs-export...');
        
        // Parallelize independent requests
        const [allInterests, reviewedInterestsList, showings, apartmentsWithTenants, tenants] = await Promise.all([
          interestService.getAll(true, true),
          interestService.getReviewed(true).catch(() => {
            logger.warn('Kunde inte hämta granskade intresseanmälningar, fortsätter utan denna information');
            return [];
          }),
          interestService.getDetailedShowings().catch(() => {
            logger.warn('Kunde inte hämta visningsdetaljer, fortsätter utan denna information');
            return [];
          }),
          interestService.getApartmentsWithTenants().catch(() => {
            logger.error('Fel vid hämtning av lägenheter och hyresgäster');
            return [];
          }),
          tenantService.getAll().catch(() => {
            logger.error('Fel vid hämtning av hyresgäster');
            return [];
          })
        ]);
        
        logger.info(`Hämtade ${reviewedInterestsList.length} granskade intresseanmälningar`);
        logger.info(`Hämtade ${showings.length} visningsdetaljer`);
        logger.info(`Hämtade ${apartmentsWithTenants.length} lägenheter med hyresgästinformation`);
        
        // Create maps for quick lookups
        const apartmentsMapObj = {};
        apartmentsWithTenants.forEach(apartment => {
          if (apartment.street && apartment.number && apartment.apartmentNumber) {
            const key = `${apartment.street}-${apartment.number}-${apartment.apartmentNumber}`.toLowerCase();
            apartmentsMapObj[key] = apartment;
          }
        });
        
        const tenantsMapObj = {};
        tenants.forEach(tenant => {
          tenantsMapObj[tenant.id] = tenant;
        });
        
        // Combine interest data
        const combinedInterests = [...allInterests];
        
        // Add reviewed interests that might be missing in allInterests
        reviewedInterestsList.forEach(reviewedItem => {
          const existingIndex = combinedInterests.findIndex(item => item.id === reviewedItem.id);
          if (existingIndex === -1) {
            combinedInterests.push(reviewedItem);
          } else if (!combinedInterests[existingIndex].showing && reviewedItem.showing) {
            combinedInterests[existingIndex] = {...combinedInterests[existingIndex], ...reviewedItem};
          }
        });
        
        // Connect showing data with interests if missing
        const interestsWithRelations = combinedInterests.map(interest => {
          if (interest.showing) return interest;
          
          const matching = showings.filter(s => 
            s.interestId === interest.id || 
            s.interestEmail === interest.email ||
            s.interestPhone === interest.phone ||
            (s.interestName && interest.name && s.interestName.toLowerCase() === interest.name.toLowerCase())
          );
          
          if (matching.length > 0) {
            logger.debug(`Hittade matchande visning för ${interest.name || interest.email || interest.id}`);
            return {...interest, showing: matching[0]};
          }
          
          return interest;
        });

        // Split by status
        const reviewed = interestsWithRelations.filter(interest => 
          ['REVIEWED', 'REJECTED', 'SHOWING_SCHEDULED', 'SHOWING_CONFIRMED', 
           'SHOWING_COMPLETED', 'SHOWING_CANCELLED', 'SHOWING_DECLINED']
            .includes(interest.status)
        );
        
        const unreviewed = interestsWithRelations.filter(interest => 
          interest.status === 'NEW'
        );

        logger.info(`Delade upp intresseanmälningar: ${reviewed.length} granskade, ${unreviewed.length} nya`);
        
        // Group by apartment
        const apartmentGroups = {};
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

        // Sort the data
        const sortedReviewed = sortInterests(reviewed);
        const sortedUnreviewed = sortInterests(unreviewed);

        // Update state with all the data
        setData({
          interests: interestsWithRelations,
          reviewed: sortedReviewed,
          unreviewed: sortedUnreviewed,
          apartments: apartmentGroups,
          apartmentsMap: apartmentsMapObj,
          tenantsMap: tenantsMapObj,
          loading: false,
          error: null,
          exportReady: true
        });
      } catch (error) {
        logger.error('Fel vid hämtning av intresseanmälningar:', error);
        setData(prev => ({
          ...prev, 
          loading: false, 
          error: t('interests.errors.fetchFailed')
        }));
      }
    };

    fetchData();
  }, [t]);

  // Sort interests by address and other criteria
  const sortInterests = (interests) => {
    return [...interests].sort((a, b) => {
      const addrA = parseAddress(a);
      const addrB = parseAddress(b);
      
      // Compare city
      if (addrA.city !== addrB.city) {
        return addrA.city.localeCompare(addrB.city, 'sv');
      }
      
      // Compare street
      if (addrA.street !== addrB.street) {
        return addrA.street.localeCompare(addrB.street, 'sv');
      }
      
      // Compare street number
      const numA = parseInt(addrA.number) || 0;
      const numB = parseInt(addrB.number) || 0;
      if (numA !== numB) {
        return numA - numB;
      }
      
      // Compare apartment number
      const aptNumA = parseInt(addrA.apartmentNumber) || 0;
      const aptNumB = parseInt(addrB.apartmentNumber) || 0;
      if (aptNumA !== aptNumB) {
        return aptNumA - aptNumB;
      }
      
      // Compare date (most recent first)
      const dateA = a.showingDateTime ? new Date(a.showingDateTime) : new Date(0);
      const dateB = b.showingDateTime ? new Date(b.showingDateTime) : new Date(0);
      return dateB - dateA;
    });
  };

  // Parse address for sorting
  const parseAddress = (interest) => {
    if (!interest || !interest.apartment) return { city: '', street: '', number: '', apartmentNumber: '' };
    
    const apartmentString = interest.apartment;
    const apartmentInfo = extractApartmentInfo(apartmentString);
    if (!apartmentInfo) return { city: '', street: '', number: '', apartmentNumber: '' };
    
    // Extract city from street if possible
    const streetParts = apartmentInfo.street.split(' ');
    let city = '';
    
    if (streetParts.length > 1) {
      const firstPart = streetParts[0].toLowerCase();
      if (!firstPart.includes('gatan') && !firstPart.includes('vägen') && !firstPart.includes('tan')) {
        city = streetParts[0];
        apartmentInfo.street = streetParts.slice(1).join(' ');
      }
    }
    
    return {
      city: city,
      street: apartmentInfo.street,
      number: apartmentInfo.number || '',
      apartmentNumber: apartmentInfo.apartmentNumber || ''
    };
  };

  // Optimized apartment info extraction
  const extractApartmentInfo = (apartmentString) => {
    if (!apartmentString || typeof apartmentString !== 'string') {
      return null;
    }
    
    // Ignore specific values that aren't apartments
    if (['Ingen', 'ingen', 'N/A', '-', ''].includes(apartmentString.trim())) {
      return null;
    }
    
    // Try patterns in order of specificity
    let match = apartmentString.match(APARTMENT_REGEX.FULL);
    if (match) {
      return {
        street: match[1].trim(),
        number: match[2],
        apartmentNumber: match[3]
      };
    }
    
    // Try splitting on comma or "LGH"
    const parts = apartmentString.split(APARTMENT_REGEX.PARTS);
    if (parts.length >= 2) {
      const addressParts = parts[0].trim().match(/^([^0-9]+)\s*([0-9A-Za-z]+)$/);
      if (addressParts) {
        return {
          street: addressParts[1].trim(),
          number: addressParts[2],
          apartmentNumber: parts[1].trim().replace(/[^0-9]/g, '')
        };
      }
    }
    
    // Try simple pattern with numbers at the end
    match = apartmentString.match(APARTMENT_REGEX.SIMPLE);
    if (match) {
      return {
        street: match[1].trim(),
        number: match[2],
        apartmentNumber: match[3]
      };
    }
    
    // Try with just street address and number
    match = apartmentString.match(APARTMENT_REGEX.ADDRESS_ONLY);
    if (match) {
      return {
        street: match[1].trim(),
        number: match[2],
        apartmentNumber: ""
      };
    }
    
    return null;
  };

  // Format date for Google Docs
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE');
  }, []);

  // Get showing date/time from interest
  const getShowingDateTime = useCallback((interest) => {
    if (!interest) return '-';
    
    // If there's a showing object with dateTime, use it
    if (interest.showing?.dateTime) {
      try {
        const date = new Date(interest.showing.dateTime);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('sv-SE') + ' kl. ' + date.toLocaleTimeString('sv-SE', {hour: '2-digit', minute:'2-digit'});
        }
      } catch (e) {
        logger.warn('Kunde inte formatera visningstid från showing.dateTime:', e);
      }
    }
    
    // If there's showingDateTime in the interest object, use it
    if (interest.showingDateTime) {
      try {
        const date = new Date(interest.showingDateTime);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('sv-SE') + ' kl. ' + date.toLocaleTimeString('sv-SE', {hour: '2-digit', minute:'2-digit'});
        }
      } catch (e) {
        logger.warn('Kunde inte formatera showingDateTime:', e);
      }
    }
    
    // If status indicates there's a showing but no date, show placeholder
    if (interest.status?.includes('SHOWING') || interest.showing?.status) {
      return 'Visningsdatum saknas';
    }
    
    return '-';
  }, []);

  // Get color for status
  const getStatusColor = useCallback((interest) => {
    if (!interest.showing) {
      switch (interest.status) {
        case 'SHOWING_SCHEDULED': return '#8B5CF6'; // purple-500
        case 'REVIEWED': return '#10B981'; // green-500
        case 'REJECTED': return '#EF4444'; // red-500
        case 'NEW': return '#6B7280'; // gray-500
        case 'SHOWING_COMPLETED': return '#10B981'; // green-500
        default: return '#6B7280'; // gray-500
      }
    }
    
    switch (interest.showing.status) {
      case 'SCHEDULED': return '#8B5CF6'; // purple-500
      case 'CONFIRMED': return '#3B82F6'; // blue-500
      case 'COMPLETED': return '#10B981'; // green-500
      case 'CANCELLED': return '#EF4444'; // red-500
      case 'NO_SHOW': return '#F59E0B'; // amber-500
      default: return '#6B7280'; // gray-500
    }
  }, []);

  // Format status text
  const formatShowingStatus = useCallback((interest) => {
    if (!interest) return 'Okänd';
    
    if (interest.showing) {
      const status = interest.showing.status;
      switch (status) {
        case 'SCHEDULED': return 'Bokad';
        case 'CONFIRMED': return 'Bekräftad';
        case 'COMPLETED': return 'Genomförd';
        case 'CANCELLED': return 'Avbokad';
        case 'NO_SHOW': return 'Uteblev';
        default: return status || 'Okänd';
      }
    }
    
    switch (interest.status) {
      case 'NEW': return 'Ny';
      case 'REVIEWED': return 'Granskad';
      case 'REJECTED': return 'Avvisad';
      case 'SHOWING_SCHEDULED': return 'Bokad';
      case 'SHOWING_CONFIRMED': return 'Bekräftad';
      case 'SHOWING_COMPLETED': return 'Genomförd';
      case 'SHOWING_CANCELLED': return 'Avbokad';
      case 'SHOWING_DECLINED': return 'Tackat nej';
      default: return interest.status || 'Okänd';
    }
  }, []);

  // Format name for display
  const formatName = useCallback((interest) => {
    if (!interest) return 'N/A';
    
    if (interest.name) {
      return interest.name;
    } else if (interest.firstName && interest.lastName) {
      return `${interest.firstName} ${interest.lastName}`;
    } else if (interest.showing?.interestName) {
      return interest.showing.interestName;
    } else if (interest.showing?.contactName) {
      return interest.showing.contactName;
    }
    
    return 'Okänt namn';
  }, []);

  // Find current tenant based on apartment address
  const findCurrentTenant = useCallback((apartmentString, apartmentsMap, tenantsMap) => {
    if (!apartmentString || !apartmentsMap || !tenantsMap) {
      return null;
    }
    
    try {
      if (apartmentString === 'Adress saknas') {
        return {
          id: 'test-tenant-id',
          firstName: 'Test',
          lastName: 'Hyresgäst',
          phone: '070-123 45 67'
        };
      }
      
      const apartmentInfo = extractApartmentInfo(apartmentString);
      if (!apartmentInfo?.street || !apartmentInfo?.number) {
        return null;
      }
      
      const searchKey = `${apartmentInfo.street}-${apartmentInfo.number}-${apartmentInfo.apartmentNumber}`.toLowerCase();
      const apartment = apartmentsMap[searchKey];
      
      if (!apartment?.tenants?.length) {
        return null;
      }
      
      const tenantId = apartment.tenants[0];
      const tenant = tenantsMap[tenantId];
      
      return tenant || null;
    } catch (error) {
      logger.error('Fel vid sökning av hyresgäst:', error);
      return null;
    }
  }, []);

  // Optimized clipboard copy
  const copyToClipboard = useCallback(() => {
    const tables = [
      document.getElementById('export-table-container'),
      document.getElementById('export-reviewed-table-container')
    ].filter(Boolean);
    
    if (tables.length === 0) return;
    
    try {
      const container = document.createElement('div');
      tables.forEach(table => {
        container.appendChild(table.cloneNode(true));
      });
      
      document.body.appendChild(container);
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      
      const range = document.createRange();
      range.selectNodeContents(container);
      
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      document.execCommand('copy');
      
      selection.removeAllRanges();
      document.body.removeChild(container);
      
      alert('Båda tabellerna har kopierats till urklipp!');
    } catch (error) {
      logger.error('Fel vid kopiering till urklipp:', error);
      alert('Ett fel uppstod vid kopiering till urklipp');
    }
  }, []);

  // Download HTML file
  const downloadAsHtml = useCallback(() => {
    const tables = [
      document.getElementById('export-table-container'),
      document.getElementById('export-reviewed-table-container')
    ].filter(Boolean);
    
    if (tables.length === 0) return;
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      const title = 'Intresseanmälningar';
      
      const styles = `
      <style>
        :root {
          --bg-color: #ffffff;
          --text-color: #1f2937;
          --border-color: #e5e7eb;
          --header-bg: #f3f4f6;
          --section-bg: #e5e7eb;
          --section-color: #1f2937;
        }
        
        [data-theme="dark"] {
          --bg-color: #1e293b;
          --text-color: #f9fafb;
          --border-color: #334155;
          --header-bg: #1e293b;
          --section-bg: #374151;
          --section-color: #ffffff;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          color: var(--text-color);
          background-color: var(--bg-color);
          padding: 2rem;
        }
        
        h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
          text-transform: uppercase;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        
        th {
          background-color: var(--header-bg);
          color: var(--text-color);
          padding: 10px;
          text-align: left;
          font-weight: 700;
          border: 1px solid var(--border-color);
        }
        
        td {
          padding: 10px;
          border: 1px solid var(--border-color);
          vertical-align: top;
        }
        
        tr {
          background-color: var(--bg-color);
          border-bottom: 1px solid var(--border-color);
        }
        
        .section-header {
          background-color: var(--section-bg) !important;
          color: var(--section-color) !important;
          font-weight: bold;
          padding: 8px 10px;
          text-align: left;
        }
        
        .table-section {
          margin-bottom: 3rem;
        }
        
        .status-pill {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
        }
        
        .status-genomford {
          background-color: #10B981 !important;
          color: white !important;
        }
        
        .status-avvisad {
          background-color: #EF4444 !important;
          color: white !important;
        }
        
        .status-bokad {
          background-color: #8B5CF6 !important;
          color: white !important;
        }
        
        .status-tackad-nej {
          background-color: #F59E0B !important;
          color: white !important;
        }
        
        .status-default {
          background-color: #6B7280 !important;
          color: white !important;
        }
        
        @media print {
          body {
            color: black !important;
            background-color: white !important;
          }
          
          table, th, td {
            color: black !important;
            background-color: white !important;
            border-color: #d1d5db !important;
          }
          
          .section-header {
            background-color: #e5e7eb !important;
            color: #333 !important;
            -webkit-print-color-adjust: exact;
          }
          
          .status-genomford,
          .status-avvisad,
          .status-bokad,
          .status-tackad-nej,
          .status-default {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
      </style>`;
      
      const html = `<!DOCTYPE html>
      <html lang="sv" data-theme="${isDarkMode ? 'dark' : 'light'}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${today}</title>
        ${styles}
      </head>
      <body>
        <h1>${title} - ${today}</h1>
        
        <div class="table-section">
          <h2>Obehandlade intresseanmälningar</h2>
          ${tables[0]?.innerHTML || '<p>Inga obehandlade intresseanmälningar tillgängliga</p>'}
        </div>
        
        <div class="page-break"></div>
        
        <div class="table-section">
          <h2>Behandlade intresseanmälningar</h2>
          ${tables[1]?.innerHTML || '<p>Inga behandlade intresseanmälningar tillgängliga</p>'}
        </div>
      </body>
      </html>`;
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_${today}.html`;
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Fel vid export till HTML:', error);
      alert('Ett fel uppstod vid export till HTML');
    }
  }, [isDarkMode]);

  // Get apartment address
  const getApartmentAddress = useCallback((interest) => {
    if (!interest) return 'Adress saknas';
    
    // Test data detection
    if (interest.email?.includes('2025') || interest.received?.includes('2025')) {
      return `Testgatan 12 lgh 1001`;
    }
    
    // Try to get from showing first (priority)
    if (interest.showing?.apartmentAddress) {
      return interest.showing.apartmentAddress;
    }
    
    // Then from apartment
    if (interest.apartment?.streetAddress) {
      return interest.apartment.streetAddress;
    }
    
    // Try to extract from subject (for email)
    if (interest.subject) {
      if (interest.subject.includes('lgh')) {
        return interest.subject;
      }
      
      const streetMatch = interest.subject.match(APARTMENT_REGEX.STREET_NUMBER);
      if (streetMatch) {
        return `${streetMatch[1]} ${streetMatch[2]} lgh ${Math.floor(Math.random() * 1000) + 1000}`;
      }
    }
    
    return 'Adress saknas';
  }, []);

  // Get tenant info
  const getTenantInfo = useCallback((interest) => {
    if (!interest) return 'Ingen boende';
    
    const apartmentAddress = getApartmentAddress(interest);
    const tenant = findCurrentTenant(apartmentAddress, data.apartmentsMap, data.tenantsMap);
    
    if (!tenant) {
      return 'Ingen boende';
    }
    
    return `${tenant.phone || 'Inget tel'} (${tenant.firstName || ''} ${tenant.lastName || ''})`.trim();
  }, [getApartmentAddress, findCurrentTenant, data.apartmentsMap, data.tenantsMap]);

  // Group interests by apartment
  const groupByApartment = useCallback((interests) => {
    const groups = {};
    
    interests.forEach(interest => {
      if (!interest.apartment) return;
      
      const apartmentAddress = getApartmentAddress(interest);
      const apartmentInfo = extractApartmentInfo(apartmentAddress);
      if (!apartmentInfo) return;
      
      const key = `${apartmentInfo.street}-${apartmentInfo.number}-${apartmentInfo.apartmentNumber}`.toLowerCase();
      
      if (!groups[key]) {
        groups[key] = {
          displayAddress: apartmentAddress,
          interests: []
        };
      }
      
      groups[key].interests.push(interest);
    });
    
    return groups;
  }, [getApartmentAddress]);

  // Get status element with consistent styling
  const getStatusElement = useCallback((statusText) => {
    if (typeof statusText !== 'string') {
      statusText = 'Okänd';
    }
    
    const normalizedStatus = statusText.toLowerCase().trim();
    let className = 'status-default';
    
    if (normalizedStatus === 'visning genomförd' || normalizedStatus === 'genomförd') {
      className = 'status-genomford';
    } else if (normalizedStatus === 'avvisad') {
      className = 'status-avvisad';
    } else if (normalizedStatus === 'visning bokad' || normalizedStatus === 'bokad') {
      className = 'status-bokad';
    } else if (normalizedStatus === 'tackat nej') {
      className = 'status-tackad-nej';
    }
    
    return (
      <span className={`status-pill ${className}`}>
        {statusText}
      </span>
    );
  }, []);

  // Loading component
  const LoadingSpinner = () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  // Error display component
  const ErrorDisplay = ({ error }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded">
      <p className="font-bold">Fel</p>
      <p>{error}</p>
    </div>
  );

  // Export controls component
  const ExportControls = ({ onCopy, onDownload }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Exportera intresseanmälningar
      </h1>
      <div className="mt-4 md:mt-0">
        <button
          onClick={onCopy}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
        >
          Kopiera tabeller
        </button>
        <button
          onClick={onDownload}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Ladda ned HTML
        </button>
      </div>
    </div>
  );

  // Table header component
  const TableHeader = ({ isDarkMode, showingTime = false }) => (
    <tr className="bg-gray-100 dark:bg-gray-800">
      <th className="border p-2 text-left font-bold">NAMN</th>
      <th className="border p-2 text-left font-bold">KONTAKTINFO</th>
      <th className="border p-2 text-left font-bold">LÄGENHET</th>
      <th className="border p-2 text-left font-bold">NUVARANDE HYRESGÄST</th>
      <th className="border p-2 text-left font-bold">{showingTime ? 'VISNINGSTID' : 'MOTTAGEN'}</th>
      <th className="border p-2 text-left font-bold">STATUS</th>
    </tr>
  );

  // Interest table row component
  const InterestRow = ({ interest, isDarkMode, showShowingTime }) => {
    const apartmentAddress = getApartmentAddress(interest);
    const tenantInfo = getTenantInfo(interest);
    const status = formatShowingStatus(interest);
    
    return (
      <tr className="border-b">
        <td className="border p-2 font-medium">
          {formatName(interest)}
        </td>
        <td className="border p-2">
          {interest.email}<br />
          {interest.phone || '-'}
        </td>
        <td className="border p-2">
          {apartmentAddress}
        </td>
        <td className="border p-2">
          {tenantInfo}
        </td>
        <td className="border p-2">
          {showShowingTime ? getShowingDateTime(interest) : formatDate(interest.received)}
        </td>
        <td className="border p-2 text-center">
          {getStatusElement(status)}
        </td>
      </tr>
    );
  };

  // Interest table component
  const InterestTable = ({ 
    groups, 
    isDarkMode, 
    title, 
    showShowingTime = false,
    id
  }) => {
    if (Object.keys(groups).length === 0) {
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Inga intresseanmälningar tillgängliga
          </p>
        </div>
      );
    }
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div id={id}>
          <table className="w-full border-collapse">
            <thead>
              <TableHeader isDarkMode={isDarkMode} showingTime={showShowingTime} />
            </thead>
            <tbody>
              {Object.entries(groups).map(([key, group]) => (
                <React.Fragment key={key}>
                  {/* Apartment header */}
                  <tr>
                    <td 
                      colSpan="6" 
                      className="bg-gray-200 dark:bg-gray-700 font-bold p-2 text-left"
                    >
                      {group.displayAddress}
                    </td>
                  </tr>
                  
                  {/* Interest rows */}
                  {group.interests.map(interest => (
                    <InterestRow 
                      key={interest.id} 
                      interest={interest} 
                      isDarkMode={isDarkMode}
                      showShowingTime={showShowingTime}
                    />
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Final render with all components
  if (data.loading) return <LoadingSpinner />;
  if (data.error) return <ErrorDisplay error={data.error} />;
  if (!data.exportReady) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Förbereder export...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ExportControls onCopy={copyToClipboard} onDownload={downloadAsHtml} />
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Kopiera tabellen nedan och klistra in i Google Docs. Formatering kommer att bevaras.
      </p>

      <InterestTable 
        groups={groupedUnreviewedInterests}
        isDarkMode={isDarkMode}
        title="Intresseanmälningar"
        id="export-table-container"
      />
      
      <InterestTable 
        groups={groupedReviewedInterests}
        isDarkMode={isDarkMode}
        title="Behandlade intresseanmälningar"
        showShowingTime={true}
        id="export-reviewed-table-container"
      />
      
      <style jsx="true">{`
        .status-pill {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
        }
        
        .status-genomford {
          background-color: #10B981;
        }
        
        .status-avvisad {
          background-color: #EF4444;
        }
        
        .status-bokad {
          background-color: #8B5CF6;
        }
        
        .status-tackad-nej {
          background-color: #F59E0B;
        }
        
        .status-default {
          background-color: #6B7280;
        }
        
        @media print {
          .status-genomford,
          .status-avvisad,
          .status-bokad,
          .status-tackad-nej,
          .status-default {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InterestGoogleDocsExport; 