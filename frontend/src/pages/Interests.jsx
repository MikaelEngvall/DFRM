import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Modal from '../components/Modal';
import Title from '../components/Title';
import DataTable from '../components/DataTable';
import { 
  interestService, 
  taskService, 
  userService, 
  emailService, 
  apartmentService, 
  tenantService, 
  authService 
} from '../services';
import { 
  EnvelopeIcon, 
  CalendarIcon, 
  ClockIcon, 
  ArrowsUpDownIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import EmailModal from '../components/EmailModal';
import { useNavigate } from 'react-router-dom';
import { createLogger } from '../utils/logger';
import InterestGoogleDocsExport from '../components/InterestGoogleDocsExport';
import { Button } from '../components/ui/button';

// Skapa en logger för denna komponent
const logger = createLogger('Interests');

const INTEREST_VIEWS = {
  UNREVIEWED: 'unreviewed',
  REVIEWED: 'reviewed'
};

const Interests = ({ view = 'list' }) => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [interests, setInterests] = useState([]);
  const [reviewedInterests, setReviewedInterests] = useState([]);
  const [showReviewed, setShowReviewed] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [showingDate, setShowingDate] = useState('');
  const [showingTime, setShowingTime] = useState('');
  const [responseMail, setResponseMail] = useState('');
  const [isShowingModalOpen, setIsShowingModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [users, setUsers] = useState([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(300000); // 5 minuter istället för 30 sekunder
  const pollingRef = useRef(null);
  const [currentView, setCurrentView] = useState(INTEREST_VIEWS.UNREVIEWED);
  const [pollingPaused, setPollingPaused] = useState(false);
  const [apartmentsMap, setApartmentsMap] = useState({});
  const [tenantsMap, setTenantsMap] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detektera mörkt läge vid komponentladdning
  useEffect(() => {
    // Kontrollera om användaren har mörkt läge aktiverat
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Kontrollera om webbplatsen har mörkt läge aktiverat
    const htmlElement = document.documentElement;
    const hasDarkClass = htmlElement.classList.contains('dark');
    
    // Uppdatera tillståndet baserat på dessa kontroller
    setIsDarkMode(prefersDarkMode || hasDarkClass);
    
    // Lyssna efter ändringar i systemets färgläge
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches || htmlElement.classList.contains('dark'));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Formatera datum till lokalt format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('sv-SE', { 
        // Ta bort år och tid, visa bara dag och månad
        month: 'numeric', 
        day: 'numeric'
        // year: 'numeric', 
        // hour: '2-digit',
        // minute: '2-digit'
      });
    } catch (error) {
      logger.error('Fel vid formatering av datum:', error);
      return '-'; // Returnera bindestreck vid fel
    }
  };
  
  // Formatera text för visning (ta bort HTML, hantera radbrytningar)
  const formatText = (text) => {
    if (!text) return '';
    
    // Om texten redan är formaterad korrekt, returnera den direkt
    if (!text.includes('<br') && !text.includes('&nbsp;')) {
      return text;
    }
    
    // Ersätt HTML-radbrytningar med faktiska radbrytningar
    return text
      .replace(/<br\s*\/?>/gi, '\n')  // <br>, <br/>, <br />
      .replace(/<[^>]*>/g, '')        // Ta bort andra HTML-taggar
      .replace(/&nbsp;/g, ' ')        // Ersätt HTML-entiteter
      .replace(/\s+/g, ' ')           // Ta bort överflödiga mellanslag
      .trim();
  };

  // Hämta användare när komponenten laddas
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await userService.getAllUsers();
        setUsers(usersData);
      } catch (err) {
        logger.error('Error fetching users:', err);
        setError(t('common.error'));
      }
    };

    fetchUsers();
  }, []);

  // Funktion för att hämta alla lägenheter och lagra dem för snabb sökning
  const fetchApartments = useCallback(async () => {
    try {
      const response = await apartmentService.getAll();
      const apartmentsMapObj = {};
      
      // Skapa en map för snabb sökning
      response.forEach(apartment => {
        const key = `${apartment.street}-${apartment.number}-${apartment.apartmentNumber}`.toLowerCase();
        apartmentsMapObj[key] = apartment;
      });
      
      setApartmentsMap(apartmentsMapObj);
      logger.debug('Hämtade lägenheter och skapade sökkarta:', Object.keys(apartmentsMapObj).length);
      
      // Logga några exempel på lägenheter
      Object.keys(apartmentsMapObj).slice(0, 5).forEach(key => {
        const apt = apartmentsMapObj[key];
        logger.debug(`Exempel på lägenhet: ${key} => ${apt.id}, ${apt.street} ${apt.number}, ${apt.apartmentNumber}`);
      });
    } catch (error) {
      logger.error('Fel vid hämtning av lägenheter:', error);
    }
  }, []);
  
  // Funktion för att hämta alla hyresgäster och lagra dem för snabb sökning
  const fetchTenants = useCallback(async () => {
    try {
      const response = await tenantService.getAll();
      const tenantsMapObj = {};
      
      // Skapa en map för snabb sökning på id
      response.forEach(tenant => {
        tenantsMapObj[tenant.id] = tenant;
      });
      
      setTenantsMap(tenantsMapObj);
      logger.debug('Hämtade hyresgäster och skapade sökkarta:', Object.keys(tenantsMapObj).length);
      
      // Logga några exempel på hyresgäster
      Object.keys(tenantsMapObj).slice(0, 5).forEach(id => {
        const tenant = tenantsMapObj[id];
        logger.debug(`Exempel på hyresgäst: ${id} => ${tenant.firstName} ${tenant.lastName}, ${tenant.phone}`);
      });
    } catch (error) {
      logger.error('Fel vid hämtning av hyresgäster:', error);
    }
  }, []);
  
  // Hjälpfunktion för att extrahera lägenhetsinfo från adresssträng
  const extractApartmentInfo = (apartmentString) => {
    if (!apartmentString) return null;
    
    try {
      // Hantera specialfall som "Re: Bekräftelse av visningstid"
      if (apartmentString.startsWith("Re:") || !apartmentString.includes("lgh")) {
        logger.debug(`Ignorerar adress: "${apartmentString}" (inte en lägenhet)`);
        return null;
      }
      
      const parts = apartmentString.split(' ');
      if (parts.length < 4) return null;
      
      // Hantera olika format
      // Format 1: "Chapmansgatan 6 lgh 1001 1rok"
      // Format 2: "Valhallavägen 10C lgh 1202 3ro" 
      // Format 3: "Utridarevägen 3B lgh 1101 1rok"
      
      let street = parts[0];
      let number = parts[1]; // Behåll husnumret som det är (t.ex. "31A")
      let apartmentNumber = null;
      
      // VIKTIGT: Ta bort uppdelningen av husnummer och bokstav
      // Vi behåller hela husnumret som det är (t.ex. "31A")
      
      // Hitta lägenhetsnnummret efter "lgh"
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].toLowerCase() === 'lgh' && i + 1 < parts.length) {
          apartmentNumber = parts[i + 1];
          break;
        }
      }
      
      // Specialhanteing för Utridarevägen
      if (street === "Utridarevägen") {
        street = "Utridare";
      }
      
      logger.debug(`Extraherad lägenhetsinfo: "${apartmentString}" => ${street}, ${number}, ${apartmentNumber}`);
      return { street, number, apartmentNumber };
    } catch (error) {
      logger.error('Fel vid extrahering av lägenhetsinfo:', error);
      return null;
    }
  };
  
  // Funktion för att hitta nuvarande hyresgäst baserat på lägenhetsadress
  const findCurrentTenant = useCallback((apartmentString) => {
    if (!apartmentString) return null;
    
    try {
      const apartmentInfo = extractApartmentInfo(apartmentString);
      if (!apartmentInfo || !apartmentInfo.street || !apartmentInfo.number || !apartmentInfo.apartmentNumber) {
        return null;
      }
      
      // Skapa söknyckeln
      const searchKey = `${apartmentInfo.street}-${apartmentInfo.number}-${apartmentInfo.apartmentNumber}`.toLowerCase();
      logger.debug(`Söker efter lägenhet med nyckel: "${searchKey}" från adress: "${apartmentString}"`);
      
      const apartment = apartmentsMap[searchKey];
      
      if (!apartment) {
        logger.debug(`Hittade ingen lägenhet för nyckel: "${searchKey}"`);
        return null;
      }
      
      if (!apartment.tenants || apartment.tenants.length === 0) {
        logger.debug(`Hittade lägenhet ${apartment.id} men den har inga hyresgäster`);
        return null;
      }
      
      // Hämta första hyresgästen
      const tenantId = apartment.tenants[0];
      const tenant = tenantsMap[tenantId];
      
      if (tenant) {
        logger.debug(`Hittade hyresgäst: ${tenant.firstName} ${tenant.lastName} (${tenant.phone}) för lägenhet: ${searchKey}`);
      } else {
        logger.debug(`Hittade tenantId ${tenantId} men ingen motsvarande hyresgäst i tenantsMap`);
      }
      
      return tenant;
    } catch (error) {
      logger.error('Fel vid sökning av hyresgäst:', error);
      return null;
    }
  }, [apartmentsMap, tenantsMap]);
  
  // Ladda lägenheter och hyresgäster när komponenten laddas
  useEffect(() => {
    fetchApartments();
    fetchTenants();
  }, [fetchApartments, fetchTenants]);

  // Hämta intresseanmälningar från API och kontrollera e-post samtidigt
  const fetchInterests = async (bypassCache = false) => {
    try {
      setIsLoading(true);
      logger.info('Hämtar intresseanmälningar och kontrollerar e-post för nya intresseanmälningar');
      
      // Först kontrollera e-post för nya intresseanmälningar
      try {
        await interestService.checkEmails();
        logger.debug('E-postkontroll för intresseanmälningar slutförd');
      } catch (emailError) {
        logger.error('Fel vid kontroll av intresse-e-post:', emailError);
        // Fortsätt ändå med att hämta befintliga intresseanmälningar
      }
      
      // Sedan hämta alla intresseanmälningar (inklusive de som precis processades)
      const data = await interestService.getForReview(true);
      
      logger.debug('Hämtade intresseanmälningar:', data);
      if (data && Array.isArray(data)) {
        setInterests(data);
        if (data.length === 0) {
          logger.info('Inga intresseanmälningar hittades för granskning');
        }
      } else {
        logger.warn('Oväntat svar från API:et:', data);
        setInterests([]);
      }
    } catch (err) {
      logger.error('Error fetching interests:', err);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Hämta granskade intresseanmälningar från API
  const fetchReviewedInterests = async (bypassCache = false) => {
    try {
      setIsLoading(true);
      logger.info('Hämtar granskade intresseanmälningar, bypassCache:', bypassCache);
      // Alltid hämta färsk data från servern (bypassCache = true)
      const data = await interestService.getReviewed(true);
      logger.debug('Hämtade granskade intresseanmälningar:', data);
      if (data && Array.isArray(data)) {
        setReviewedInterests(data);
        if (data.length === 0) {
          logger.info('Inga granskade intresseanmälningar hittades');
        }
      } else {
        logger.warn('Oväntat svar från API:et:', data);
        setReviewedInterests([]);
      }
    } catch (err) {
      logger.error('Error fetching reviewed interests:', err);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Nu kan vi säkert använda useEffect eftersom funktionerna är deklarerade
  // Uppdatera hyresgäst- och lägenhetsdata när currentView ändras
  useEffect(() => {
    // Hämta hyresgäst och lägenhetsdata när vyn ändras
    fetchApartments();
    fetchTenants();
    
    // Hämta rätt intresseanmälningar baserat på vyn
    if (currentView === INTEREST_VIEWS.REVIEWED) {
      fetchReviewedInterests(true);
      logger.debug('Växlade till granskade intresseanmälningar');
    } else {
      fetchInterests(true);
      logger.debug('Växlade till ogranskade intresseanmälningar');
    }
  }, [currentView, fetchApartments, fetchTenants]);

  // Starta/stoppa polling för automatisk uppdatering
  useEffect(() => {
    // Starta polling
    const startPolling = () => {
      logger.debug('Startar polling för intresseanmälningar med intervall:', pollingInterval);
      pollingRef.current = setInterval(() => {
        // Kontrollera om polling är pausad (t.ex. när e-postmodalen är öppen)
        if (!pollingPaused) {
          logger.debug('Polling: Hämtar intresseanmälningar...');
          fetchInterests(true);
          fetchReviewedInterests(true);
        } else {
          logger.debug('Polling pausad, hoppar över uppdatering');
        }
      }, pollingInterval);
    };

    // Starta polling när komponenten laddas
    startPolling();

    // Rensa intervallet när komponenten avmonteras
    return () => {
      logger.debug('Stoppar polling för intresseanmälningar');
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [pollingInterval, pollingPaused]);

  // Hämta data när komponenten laddas
  useEffect(() => {
    fetchInterests();
    fetchReviewedInterests();
  }, []);

  // Hantera klick på en rad i tabellen
  const handleRowClick = (interest) => {
    setSelectedInterest(interest);
    setIsReviewModalOpen(true);
  };

  // Hantera granskning av intresseanmälan
  const handleReview = async () => {
    try {
      setIsLoading(true);
      await interestService.reviewInterest(selectedInterest.id, {
        reviewedById: currentUser.id,
        comment: reviewComments
      });
      
      // Uppdatera listor efter granskning
      fetchInterests();
      fetchReviewedInterests();
      
      // Stäng modalen och återställ formuläret
      setIsReviewModalOpen(false);
      setReviewComments('');
      setSelectedInterest(null);
    } catch (err) {
      logger.error('Error reviewing interest:', err);
      setError(t('interests.messages.reviewError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Hantera avvisning av intresseanmälan
  const handleReject = async () => {
    try {
      setIsLoading(true);
      await interestService.rejectInterest(selectedInterest.id, {
        reviewedById: currentUser.id,
        comment: reviewComments
      });
      
      // Uppdatera listor efter avvisning
      fetchInterests();
      fetchReviewedInterests();
      
      // Stäng modalen och återställ formuläret
      setIsReviewModalOpen(false);
      setReviewComments('');
      setSelectedInterest(null);
    } catch (err) {
      logger.error('Error rejecting interest:', err);
      setError(t('interests.messages.rejectError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrerad data baserat på aktuell vy och filter
  const getDisplayData = () => {
    // Välj datakälla baserat på vyn
    const sourceData = currentView === INTEREST_VIEWS.UNREVIEWED 
      ? interests 
      : reviewedInterests;
    
    // Applicera filter på rätt datakälla
    return sourceData.filter(interest => {
      // Status filter
      if (filters.status && interest.status !== filters.status) {
        return false;
      }
      
      // Name filter
      if (filters.name && interest.name && !interest.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      // Email filter
      if (filters.email && interest.email && !interest.email.toLowerCase().includes(filters.email.toLowerCase())) {
        return false;
      }
      
      // Apartment filter
      if (filters.apartment && interest.apartment && !interest.apartment.toLowerCase().includes(filters.apartment.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };
  
  // Hantera filterändringar
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Applicera filter
  const applyFilters = () => {
    fetchInterests();
    fetchReviewedInterests();
  };
  
  // Rensa filter
  const clearFilters = () => {
    setFilters({
      status: ''
    });
    setShowReviewed(false);
    fetchInterests();
    fetchReviewedInterests();
  };

  // Modifierad kod för att hantera klick på "Boka visning"-knappen
  const handleShowingButtonClick = () => {
    setIsReviewModalOpen(false);
    
    // Automatiskt förifyll responseMail med standardtexten från översättningsfilen
    setResponseMail(t('interests.responsePlaceholder'));
    
    setIsShowingModalOpen(true);
  };

  // I handleScheduleShowing-funktionen, ändra för att automatiskt lägga till datum och tid i meddelandet
  const handleScheduleShowing = async () => {
    if (!showingDate || !showingTime || !responseMail || !selectedAgent) {
      setError(t('interests.messages.fieldsRequired'));
      return;
    }

    try {
      setIsLoading(true);
      
      // Formatera datumet snyggt för e-postmeddelandet
      const formattedDate = new Date(`${showingDate}T${showingTime}`).toLocaleDateString('sv-SE');
      const formattedTime = new Date(`${showingDate}T${showingTime}`).toLocaleTimeString('sv-SE', {hour: '2-digit', minute:'2-digit'});
      
      // Skapa en ISO-datumsträngformat för att lagra visningsdatum och tid
      const showingDateTime = `${showingDate}T${showingTime}:00`;
      
      // Förbered data för API-anrop
      const apiData = {
        reviewedById: currentUser.id,
        responseMessage: responseMail,
        showingDateTime: showingDateTime,
        assignedToUserId: selectedAgent
      };
      
      // Anropa API
      const result = await interestService.scheduleShowing(selectedInterest.id, apiData);
      
      // Uppdatera listor efter schemaläggning
      fetchInterests();
      fetchReviewedInterests();
      
      // Visa framgångsmeddelande och återställ formulär
      setSuccessMessage(t('interests.messages.showingScheduled'));
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Stäng modalen och återställ formuläret
      setIsShowingModalOpen(false);
      setResponseMail('');
      setShowingDate('');
      setShowingTime('');
      setSelectedAgent('');
      setSelectedInterest(null);
    } catch (err) {
      logger.error('Error scheduling showing:', err);
      setError(err.response?.data?.message || err.message || t('interests.messages.showingScheduleError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion för att öppna e-postmodalen
  const openEmailModal = () => {
    // Pausa polling när e-postmodalen öppnas
    setPollingPaused(true);
    setIsEmailModalOpen(true);
  };

  // Funktion för att stänga e-postmodalen
  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    // Återuppta polling när e-postmodalen stängs
    setTimeout(() => setPollingPaused(false), 1000);
  };

  // Funktion för att hantera e-post
  const handleSendEmail = async (subject, content, recipients) => {
    try {
      // Polling är redan pausad här eftersom modalen är öppen
      const result = await emailService.sendBulkEmail(subject, content, recipients);
      return result;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    } finally {
      // Stäng modalen och återuppta polling
      closeEmailModal();
    }
  };

  // Funktion för att exportera till SQL
  const exportToSql = async () => {
    try {
      setIsLoading(true);
      await interestService.exportToSql();
      setSuccessMessage(t('interests.messages.exportSuccess'));
    } catch (err) {
      logger.error('Error exporting to SQL:', err);
      setError(t('interests.messages.exportError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion för att formatera visningstid
  const formatShowingDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    try {
      const date = new Date(dateTimeString);
      // Formatera till 'YYYY-MM-DD HH:MM'
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      logger.error('Fel vid formatering av visningstid:', error);
      return '-';
    }
  };
  
  // Funktion för att exportera till HTML
  const exportToHtml = () => {
    try {
      setIsLoading(true);
      
      // Hämta data för båda tabellerna
      const unreviewedData = interests;
      const bookedData = reviewedInterests.filter(interest => interest.status === 'SHOWING_SCHEDULED');
        
      if ((!unreviewedData || unreviewedData.length === 0) && (!bookedData || bookedData.length === 0)) {
        setError(t('interests.messages.noDataToExport'));
        setIsLoading(false); // Avsluta laddning om ingen data finns
        return;
      }
      
      // Skapa stilmall (oförändrad)
      const styles = `
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          color: #1f2937;
          background-color: #f9fafb;
          padding: 2rem;
        }
        .dark-mode {
          color: #f9fafb;
          background-color: #1f2937;
        }
        h1 {
          font-size: 1.5rem; /* Mindre H1 för att passa två rubriker */
          font-weight: 600;
          margin-top: 2rem; /* Mellanrum mellan tabeller */
          margin-bottom: 0.5rem;
        }
        h1:first-of-type {
          margin-top: 0; /* Ingen extra marginal för första rubriken */
        }
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 0.5rem;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        th {
          background-color: #f3f4f6;
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap; /* Förhindra radbrytning i header */
        }
        .dark-mode th {
          background-color: #374151;
          color: #f9fafb;
          border-bottom: 1px solid #4b5563;
        }
        td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }
        .dark-mode td {
          border-bottom: 1px solid #4b5563;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .dark-mode tr:nth-child(even) {
          background-color: #1f2937;
        }
        .dark-mode tr:nth-child(odd) {
          background-color: #111827;
        }
        .secondary-text {
          color: #6b7280;
          font-size: 0.875rem;
        }
        .dark-mode .secondary-text {
          color: #9ca3af;
        }
        /* Nya stilar för statusar */
        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
        }
        .status-new {
          background-color: #e5e7eb;
          color: #4b5563;
        }
        .status-reviewed {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-scheduled {
          background-color: #a855f7;
          color: #ffffff;
        }
        .status-confirmed {
          background-color: #3b82f6;
          color: #ffffff;
        }
        .status-completed {
          background-color: #10b981;
          color: #ffffff;
        }
        .status-cancelled {
          background-color: #ef4444;
          color: #ffffff;
        }
        .status-declined {
          background-color: #f59e0b;
          color: #ffffff;
        }
        .status-rejected {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        .dark-mode .status-new {
          background-color: #6b7280;
          color: #f3f4f6;
        }
        .dark-mode .status-reviewed {
          background-color: #10b981;
          color: #ecfdf5;
        }
        .dark-mode .status-scheduled {
          background-color: #a855f7;
          color: #ffffff;
        }
        .dark-mode .status-confirmed {
          background-color: #3b82f6;
          color: #ffffff;
        }
        .dark-mode .status-completed {
          background-color: #10b981;
          color: #ffffff;
        }
        .dark-mode .status-cancelled {
          background-color: #ef4444;
          color: #ffffff;
        }
        .dark-mode .status-declined {
          background-color: #f59e0b;
          color: #ffffff;
        }
        .dark-mode .status-rejected {
          background-color: #ef4444;
          color: #fef2f2;
        }
        @media print {
          body {
            background-color: white;
            color: black;
          }
          table {
            box-shadow: none;
          }
          th, td {
            background-color: white !important;
            color: black !important;
            border-bottom: 1px solid #e5e7eb !important;
          }
          .status {
            border: 1px solid #e5e7eb;
          }
        }
      </style>`;
      
      // Funktion för att skapa HTML för en tabell
      const createTableHtml = (data, type) => {
        if (!data || data.length === 0) return '<p>Inga data att visa.</p>'; // Visa meddelande om ingen data

        let tableHtml = '<table>';
        
        // Tabellhuvud baserat på typ
        tableHtml += '<thead><tr>';
        tableHtml += `<th>${t('interests.fields.name')}</th>`;
        tableHtml += `<th>${t('interests.fields.apartment')}</th>`;
        tableHtml += `<th>Nuvarande hyresgäst</th>`;
        if (type === 'unreviewed') {
          tableHtml += `<th>${t('interests.fields.message')}</th>`;
        } else if (type === 'booked') {
          tableHtml += `<th>${t('interests.fields.status')}</th>`; // Visa status istället för visningstid
        }
        tableHtml += `<th>${t('interests.fields.received')}</th>`;
        tableHtml += '</tr></thead>';
        
        // Tabellkropp
        tableHtml += '<tbody>';
        data.forEach(interest => {
          tableHtml += '<tr>';
          
          // Namn
          tableHtml += `<td>${formatText(interest.name) || '-'}</td>`;
          
          // Lägenhet
          tableHtml += `<td>${formatText(interest.apartment)?.substring(0, 30) || '-'}</td>`;
          
          // Nuvarande hyresgäst
          const tenant = findCurrentTenant(interest.apartment);
          tableHtml += '<td>';
          if (tenant) {
            tableHtml += `<div>${tenant.phone || '-'}</div>`;
            tableHtml += `<div class="secondary-text">${tenant.firstName} ${tenant.lastName}</div>`;
          } else {
            tableHtml += 'Ingen boende';
          }
          tableHtml += '</td>';

          // Kolumn beroende på typ
          if (type === 'unreviewed') {
            tableHtml += `<td>${formatText(interest.message)?.substring(0, 50) + (formatText(interest.message)?.length > 50 ? '...' : '') || '-'}</td>`;
          } else if (type === 'booked') {
            // Visa status med lämplig färg
            const statusClass = getStatusClass(interest.status);
            const statusText = getStatusText(interest.status);
            tableHtml += `<td><span class="${statusClass}">${statusText}</span></td>`;
          }
          
          // Mottagen
          tableHtml += `<td>${formatDate(interest.received)}</td>`;
          
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';
        
        return tableHtml;
      };
      
      // Skapa fullständig HTML med båda tabellerna
      const today = new Date().toLocaleDateString('sv-SE').replace(/\//g, '-');
      const unreviewedTitle = t('interests.title');
      const bookedTitle = t('interests.bookedShowingsTitle'); // Behöver ny översättningstext
      
      const html = `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Intresseanmälningar Export ${today}</title>
        ${styles}
      </head>
      <body class="${isDarkMode ? 'dark-mode' : ''}">
        <h1>${unreviewedTitle}</h1>
        ${createTableHtml(unreviewedData, 'unreviewed')}
        
        <h1>${bookedTitle}</h1>
        ${createTableHtml(bookedData, 'booked')}

        <script>
          // Lyssna efter klick för att växla mellan ljust/mörkt läge
          document.addEventListener('DOMContentLoaded', function() {
            const toggleDarkMode = () => {
              document.body.classList.toggle('dark-mode');
            };
            
            // Lägg till knapp för att växla mellan ljust/mörkt läge
            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = 'Växla ljust/mörkt läge';
            toggleBtn.style.position = 'fixed';
            toggleBtn.style.bottom = '20px';
            toggleBtn.style.right = '20px';
            toggleBtn.style.padding = '8px 16px';
            toggleBtn.style.backgroundColor = '#3b82f6'; // Blå färg som exempel
            toggleBtn.style.color = '#ffffff';
            toggleBtn.style.border = 'none';
            toggleBtn.style.borderRadius = '4px';
            toggleBtn.style.cursor = 'pointer';
            toggleBtn.style.zIndex = '1000'; // Se till att knappen är överst
            toggleBtn.onclick = toggleDarkMode;
            document.body.appendChild(toggleBtn);
          });
        </script>
      </body>
      </html>`;
      
      // Skapa Blob och URL (oförändrad)
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Skapa länk och ladda ned (oförändrad)
      const a = document.createElement('a');
      a.href = url;
      a.download = `Intresseanmälningar_${today}.html`; // Ändrat filnamn
      document.body.appendChild(a);
      a.click();
      
      // Städa upp (oförändrad)
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Visa framgångsmeddelande (oförändrad)
      setSuccessMessage(t('interests.messages.exportSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      logger.error('Error exporting to HTML:', err);
      setError(t('interests.messages.exportError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion för att växla mellan vyer
  const toggleView = () => {
    // Visa laddningsskärm först
    setIsLoading(true);
    
    // Ändra vy 
    setCurrentView(
      currentView === INTEREST_VIEWS.UNREVIEWED 
      ? INTEREST_VIEWS.REVIEWED 
      : INTEREST_VIEWS.UNREVIEWED
    );
    
    // Meddelande om vilken vy som laddas
    setSuccessMessage(
      currentView === INTEREST_VIEWS.UNREVIEWED 
      ? t('interests.messages.loadingReviewed') 
      : t('interests.messages.loadingUnreviewed')
    );
  };

  // Hjälpfunktion för att få CSS-klass baserat på status
  const getStatusClass = (status) => {
    switch (status) {
      case 'NEW': return 'status status-new';
      case 'REVIEWED': return 'status status-reviewed';
      case 'SHOWING_SCHEDULED': return 'status status-scheduled';
      case 'SHOWING_CONFIRMED': return 'status status-confirmed';
      case 'SHOWING_COMPLETED': return 'status status-completed';
      case 'SHOWING_CANCELLED': return 'status status-cancelled';
      case 'SHOWING_DECLINED': return 'status status-declined';
      case 'REJECTED': return 'status status-rejected';
      default: return 'status status-unknown';
    }
  };

  // Hjälpfunktion för att få statustext baserat på status
  const getStatusText = (status) => {
    switch (status) {
      case 'NEW': return t('interests.status.NEW');
      case 'REVIEWED': return t('interests.status.REVIEWED');
      case 'SHOWING_SCHEDULED': return t('interests.status.SHOWING_SCHEDULED');
      case 'SHOWING_CONFIRMED': return t('interests.status.SHOWING_CONFIRMED');
      case 'SHOWING_COMPLETED': return t('interests.status.SHOWING_COMPLETED');
      case 'SHOWING_CANCELLED': return t('interests.status.SHOWING_CANCELLED');
      case 'SHOWING_DECLINED': return t('interests.status.SHOWING_DECLINED');
      case 'REJECTED': return t('interests.status.REJECTED');
      default: return 'Okänd';
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setIsLoading(true);
      
      // Skapa ett uppdateringsobjekt med bara status och id
      const updateData = {
        id: selectedInterest.id,
        status: selectedInterest.status
      };
      
      // Om statusen är SHOWING_SCHEDULED men intresseanmälan inte har någon visningstid, 
      // visa ett felmeddelande
      if (
        selectedInterest.status === 'SHOWING_SCHEDULED' && 
        !selectedInterest.showingDateTime
      ) {
        setError(t('interests.messages.showingDateRequired'));
        setIsLoading(false);
        return;
      }
      
      logger.info('Uppdaterar status för intresseanmälan:', updateData);
      
      // Anropa API för att uppdatera status
      const response = await fetch(`${process.env.REACT_APP_API_URL}/interests/${selectedInterest.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ status: selectedInterest.status })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      // Hämta den uppdaterade intresseanmälan
      const updatedInterest = await response.json();
      
      // Uppdatera den lokala arrayen med den uppdaterade intresseanmälan
      const updatedReviewedInterests = reviewedInterests.map(interest => 
        interest.id === updatedInterest.id ? updatedInterest : interest
      );
      
      setReviewedInterests(updatedReviewedInterests);
      setSuccessMessage(t('interests.messages.statusUpdated'));
      setIsReviewModalOpen(false);
    } catch (error) {
      logger.error('Fel vid uppdatering av intresseanmälans status:', error);
      setError(t('interests.messages.statusUpdateError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Om vi visar export-vyn, visa Google Docs-exportkomponenten
  if (view === 'export-to-google-docs') {
    return <InterestGoogleDocsExport />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <Title level="h1">
          {currentView === INTEREST_VIEWS.UNREVIEWED 
            ? t('interests.title')
            : t('interests.reviewedTitle')}
        </Title>
        <div className="flex space-x-3 mt-3 md:mt-0">
          <button
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            onClick={exportToHtml}
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            HTML
          </button>
          <button
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            onClick={exportToSql}
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            SQL
          </button>
          <button
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
            onClick={toggleView}
          >
            <ArrowsUpDownIcon className="h-5 w-5 mr-2" />
            {currentView === INTEREST_VIEWS.UNREVIEWED ? t('interests.showReviewed') : t('interests.showUnreviewed')}
          </button>
          <button 
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={() => openEmailModal()}
          >
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            {t('common.send')}
          </button>
        </div>
      </div>
      
      {/* Felmeddelande */}
      {error && (
        <div className="bg-red-600 text-white p-3 mb-4 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : getDisplayData().length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">{t('interests.noInterests')}</p>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: 'name',
              label: t('interests.fields.name'),
              render: (name) => formatText(name) || '-'
            },
            {
              key: 'apartment',
              label: t('interests.fields.apartment'),
              render: (apartment) => formatText(apartment)?.substring(0, 30) || '-'
            },
            {
              key: 'currentTenant',
              label: 'Nuvarande hyresgäst',
              render: (_, interest) => {
                const tenant = findCurrentTenant(interest.apartment);
                if (tenant) {
                  return (
                    <div>
                      <div>{tenant.phone || '-'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {tenant.firstName} {tenant.lastName}
                      </div>
                    </div>
                  );
                }
                return 'Ingen boende';
              }
            },
            {
              key: 'status',
              label: t('interests.fields.status'),
              render: (_, interest) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${interest.status === 'NEW' ? 'bg-slate-200 text-slate-800' : 
                    interest.status === 'REVIEWED' ? 'bg-green-200 text-green-800' : 
                    interest.status === 'SHOWING_SCHEDULED' ? 'bg-purple-500 text-white' :
                    interest.status === 'SHOWING_CONFIRMED' ? 'bg-blue-500 text-white' :
                    interest.status === 'SHOWING_COMPLETED' ? 'bg-emerald-500 text-white' :
                    interest.status === 'SHOWING_CANCELLED' ? 'bg-red-500 text-white' :
                    interest.status === 'SHOWING_DECLINED' ? 'bg-yellow-500 text-white' :
                    'bg-red-200 text-red-800'}`}>
                  {interest.status === 'NEW' ? t('interests.status.NEW') : 
                   interest.status === 'REVIEWED' ? t('interests.status.REVIEWED') : 
                   interest.status === 'SHOWING_SCHEDULED' ? t('interests.status.SHOWING_SCHEDULED') :
                   interest.status === 'SHOWING_CONFIRMED' ? t('interests.status.SHOWING_CONFIRMED') :
                   interest.status === 'SHOWING_COMPLETED' ? t('interests.status.SHOWING_COMPLETED') :
                   interest.status === 'SHOWING_CANCELLED' ? t('interests.status.SHOWING_CANCELLED') :
                   interest.status === 'SHOWING_DECLINED' ? t('interests.status.SHOWING_DECLINED') :
                   t('interests.status.REJECTED')}
                </span>
              )
            },
            {
              key: 'received',
              label: t('interests.fields.received'),
              render: (received) => formatDate(received)
            }
          ]}
          data={getDisplayData()}
          onRowClick={handleRowClick}
        />
      )}

      {/* Detaljmodal för intresseanmälan */}
      {selectedInterest && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewComments('');
          }}
          title={t('interests.details')}
        >
          <div className="space-y-4 p-4 rounded">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('interests.fields.name')}
                  </label>
                  <input 
                    type="text" 
                    value={formatText(selectedInterest.name) || '-'}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('interests.fields.apartment')}
                  </label>
                  <input 
                    type="text" 
                    value={formatText(selectedInterest.apartment) || '-'}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('interests.fields.message')}
                </label>
                <textarea
                  value={formatText(selectedInterest.message) || '-'}
                  readOnly
                  rows="4"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('interests.fields.email')}
                  </label>
                  <div className="flex">
                    <input 
                      type="text" 
                      value={formatText(selectedInterest.email) || '-'}
                      readOnly
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm text-gray-900 dark:text-white"
                    />
                      <button 
                      onClick={openEmailModal}
                        className="mt-1 inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-500"
                        title={t('common.sendEmail')}
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                      </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('interests.fields.phone')}
                  </label>
                  <input 
                    type="text" 
                    value={formatText(selectedInterest.phone) || '-'}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('interests.fields.received')}
                  </label>
                  <input 
                    type="text" 
                    value={formatDate(selectedInterest.received)}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('interests.fields.status')}
                  </label>
                  <select
                    value={selectedInterest.status}
                    onChange={e => {
                      setSelectedInterest(prev => ({
                        ...prev,
                        status: e.target.value
                      }));
                    }}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  >
                    <option value="NEW">{t('interests.status.NEW')}</option>
                    <option value="REVIEWED">{t('interests.status.REVIEWED')}</option>
                    <option value="SHOWING_SCHEDULED">{t('interests.status.SHOWING_SCHEDULED')}</option>
                    <option value="SHOWING_CONFIRMED">{t('interests.status.SHOWING_CONFIRMED')}</option>
                    <option value="SHOWING_COMPLETED">{t('interests.status.SHOWING_COMPLETED')}</option>
                    <option value="SHOWING_CANCELLED">{t('interests.status.SHOWING_CANCELLED')}</option>
                    <option value="SHOWING_DECLINED">{t('interests.status.SHOWING_DECLINED')}</option>
                    <option value="REJECTED">{t('interests.status.REJECTED')}</option>
                  </select>
                </div>
              </div>
              
              {selectedInterest.pageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('interests.fields.pageUrl')}
                  </label>
                  <div className="mt-1 flex">
                    <input
                      type="text"
                      value={selectedInterest.pageUrl}
                      readOnly
                      className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm text-gray-900 dark:text-white overflow-x-auto"
                    />
                    <a 
                      href={selectedInterest.pageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white rounded-r-md"
                      title={t('common.openLink')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            
              {/* Modalknappar */}
              <div className="flex mt-6 space-x-2 justify-end">
                {/* Visa visningstidsinformation om det finns */}
                {selectedInterest.status === 'SHOWING_SCHEDULED' && selectedInterest.showingDateTime && (
                  <div className="flex-1 text-sm text-gray-500 dark:text-gray-400 py-2">
                    <ClockIcon className="h-4 w-4 inline-block mr-1" />
                    {new Date(selectedInterest.showingDateTime).toLocaleString('sv-SE')}
                  </div>
                )}
                
                {/* Knapp för att stänga */}
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {t('common.close')}
                </button>
                
                {/* Knapp för att skicka e-post */}
                <button
                  onClick={openEmailModal}
                  className="px-4 py-2 border border-indigo-500 dark:border-indigo-600 text-sm font-medium rounded-md text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <EnvelopeIcon className="h-4 w-4 inline-block mr-1" />
                  {t('common.sendEmail')}
                </button>
                
                {/* Visa 'Boka visning' för nya intresseanmälningar, 
                    'Uppdatera status' för redan behandlade intresseanmälningar */}
                {selectedInterest.status === 'NEW' ? (
                  <button
                    onClick={handleShowingButtonClick}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <CalendarIcon className="h-4 w-4 inline-block mr-1" />
                    {t('interests.actions.scheduleShowing')}
                  </button>
                ) : (
                  <button
                    onClick={handleStatusUpdate}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {t('interests.actions.updateStatus')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal för att schemalägga visning */}
      {selectedInterest && (
        <Modal
          isOpen={isShowingModalOpen}
          onClose={() => {
            setIsShowingModalOpen(false);
            setResponseMail('');
            setShowingDate('');
            setShowingTime('');
            setSelectedAgent('');
          }}
          title={t('interests.scheduleShowing')}
        >
          <div className="space-y-4 p-4 rounded">
            <div className="grid grid-cols-1 gap-4">
              {/* Visningsinformation */}
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-100">
                  {t('interests.showingInfo', { 
                    name: formatText(selectedInterest.name) || '-', 
                    apartment: formatText(selectedInterest.apartment) || '-' 
                  })}
                </p>
              </div>
              
              {/* Visningstid och datum */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('interests.fields.showingDate')}
                  </label>
                  <div className="flex">
                    <span className="mt-1 inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white rounded-l-md">
                      <CalendarIcon className="h-5 w-5" />
                    </span>
                    <input 
                      type="date" 
                      value={showingDate}
                      onChange={(e) => setShowingDate(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('interests.fields.showingTime')}
                  </label>
                  <div className="flex">
                    <span className="mt-1 inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white rounded-l-md">
                      <ClockIcon className="h-5 w-5" />
                    </span>
                    <input 
                      type="time" 
                      value={showingTime}
                      onChange={(e) => setShowingTime(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ansvarig mäklare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('interests.fields.assignedTo')}
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* E-post till intresseanmälaren */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('interests.fields.responseMessage')}
                </label>
                <textarea
                  rows="6"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  value={responseMail}
                  onChange={(e) => setResponseMail(e.target.value)}
                  placeholder={t('interests.responsePlaceholder')}
                  required
                ></textarea>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('interests.responseHelp')}
                </p>
              </div>

              {/* Knappar */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => {
                    setIsShowingModalOpen(false);
                    setIsReviewModalOpen(true);
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  onClick={handleScheduleShowing}
                  disabled={isLoading || !showingDate || !showingTime || !responseMail || !selectedAgent}
                >
                  {isLoading ? t('common.loading') : t('interests.actions.sendAndSchedule')}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Framgångsmeddelande */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-green-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lägg till EmailModal */}
      {selectedInterest && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={closeEmailModal}
          recipients={[selectedInterest.email]}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
};

export default Interests; 