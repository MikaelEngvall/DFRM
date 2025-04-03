import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import Title from '../components/Title';
import DataTable from '../components/DataTable';
import { interestService, taskService, userService, emailService } from '../services';
import { EnvelopeIcon, CalendarIcon, ClockIcon, ArrowsUpDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import EmailModal from '../components/EmailModal';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { createLogger } from '../utils/logger';

// Skapa en logger för denna komponent
const logger = createLogger('Interests');

const INTEREST_VIEWS = {
  UNREVIEWED: 'unreviewed',
  REVIEWED: 'reviewed'
};

const Interests = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [interests, setInterests] = useState([]);
  const [reviewedInterests, setReviewedInterests] = useState([]);
  const [showReviewed, setShowReviewed] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Formatera datum till lokalt format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('sv-SE', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Funktion för att exportera till Excel
  const exportToExcel = async () => {
    try {
      setIsLoading(true);
      
      // Hämta enbart granskade/behandlade intresseanmälningar
      const data = reviewedInterests;
      
      if (!data || data.length === 0) {
        setError(t('interests.messages.noDataToExport'));
        setIsLoading(false);
        return;
      }
      
      // Förbered data för Excel export
      const headers = [
        t('interests.fields.name'),
        t('interests.fields.email'),
        t('interests.fields.phone'),
        t('interests.fields.apartment'),
        t('interests.fields.received'),
        t('interests.fields.status'),
        t('interests.fields.reviewComments'),
        t('interests.fields.reviewedBy')
      ];

      const rows = data.map(interest => [
        formatText(interest.name) || '-',
        formatText(interest.email) || '-',
        formatText(interest.phone) || '-',
        formatText(interest.apartment) || '-',
        formatDate(interest.received) || '-',
        interest.status === 'REVIEWED' ? t('interests.status.REVIEWED') :
          interest.status === 'REJECTED' ? t('interests.status.REJECTED') :
          interest.status === 'SHOWING_SCHEDULED' ? t('interests.status.SHOWING_SCHEDULED') : '-',
        formatText(interest.reviewComments) || '-',
        interest.reviewedBy ? `${interest.reviewedBy.firstName || ''} ${interest.reviewedBy.lastName || ''}` : '-'
      ]);

      // Skapa ett XLSX arbetsboksobjekt
      const wb = XLSX.utils.book_new();
      
      // Skapa ett arbetsblad med data
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      
      // Stil för rubrikraden
      const headerRange = XLSX.utils.decode_range('A1:H1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        
        // Skapa en cellstil med fet stil och bakgrundsfärg
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "DDDDDD" } }
        };
      }
      
      // Lägg till arbetsbladet i arbetsboken
      const today = new Date().toLocaleDateString('sv-SE').replace(/\//g, '-');
      const sheetName = `${t('interests.reviewedTitle')}`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Generera en filnamn med dagens datum
      const fileName = `${t('interests.reviewedTitle')}_${today}.xlsx`;
      
      // Exportera arbetsboken till en binär sträng
      XLSX.writeFile(wb, fileName);
      
      // Visa framgångsmeddelande
      setSuccessMessage(t('interests.messages.exportSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      logger.error('Error exporting data:', err);
      setError(t('interests.messages.exportError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion för att växla mellan vyer
  const toggleView = () => {
    setCurrentView(
      currentView === INTEREST_VIEWS.UNREVIEWED 
      ? INTEREST_VIEWS.REVIEWED 
      : INTEREST_VIEWS.UNREVIEWED
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Title level="h1">
          {currentView === INTEREST_VIEWS.UNREVIEWED 
            ? t('interests.title')
            : t('interests.reviewedTitle')}
        </Title>
        <div className="flex space-x-2">
          <button
            onClick={toggleView}
            title={currentView === INTEREST_VIEWS.UNREVIEWED 
              ? t('interests.showReviewed') 
              : t('interests.showUnreviewed')}
            className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-blue-700 flex items-center"
          >
            <ArrowsUpDownIcon className="h-4 w-4 mr-1.5" />
            {currentView === INTEREST_VIEWS.UNREVIEWED 
              ? t('interests.showReviewed') 
              : t('interests.showUnreviewed')}
          </button>

          {/* Exportera till Excel knapp (visas endast i granskade vyn) */}
          {currentView === INTEREST_VIEWS.REVIEWED && (
            <button
              onClick={exportToExcel}
              title={t('interests.actions.exportToExcel')}
              className="bg-green-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-green-700 flex items-center"
              disabled={isLoading}
            >
              <DocumentTextIcon className="h-4 w-4 mr-1.5" />
              {t('interests.actions.exportToExcel')}
            </button>
          )}
          
          <button
            onClick={() => {
              fetchInterests(true);
              fetchReviewedInterests(true);
            }}
            title={t('common.forceUpdate')}
            className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-md hover:bg-blue-600 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('common.forceUpdate')}
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
              key: 'contact',
              label: t('interests.fields.contact'),
              render: (_, interest) => (
                <div>
                  <div>{formatText(interest.email) || '-'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{formatText(interest.phone) || '-'}</div>
                </div>
              )
            },
            {
              key: 'apartment',
              label: t('interests.fields.apartment'),
              render: (apartment) => formatText(apartment) || '-'
            },
            {
              key: 'received',
              label: t('interests.fields.received'),
              render: (received) => formatDate(received)
            },
            {
              key: 'status',
              label: t('interests.fields.status'),
              render: (_, interest) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${interest.status === 'NEW' ? 'bg-slate-200 text-slate-800' : 
                    interest.status === 'REVIEWED' ? 'bg-green-200 text-green-800' : 
                    interest.status === 'SHOWING_SCHEDULED' ? 'bg-purple-500 text-white' :
                    'bg-red-200 text-red-800'}`}>
                  {interest.status === 'NEW' ? t('interests.status.NEW') : 
                   interest.status === 'REVIEWED' ? t('interests.status.REVIEWED') : 
                   interest.status === 'SHOWING_SCHEDULED' ? t('interests.status.SHOWING_SCHEDULED') :
                   t('interests.status.REJECTED')}
                </span>
              )
            },
            {
              key: 'reviewedBy',
              label: t('interests.fields.reviewedBy'),
              render: (_, interest) => interest.reviewedBy ? 
                `${interest.reviewedBy.firstName || ''} ${interest.reviewedBy.lastName || ''}` : ''
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
                    disabled
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                  >
                    <option value="NEW">{t('interests.status.NEW')}</option>
                    <option value="REVIEWED">{t('interests.status.REVIEWED')}</option>
                    <option value="SHOWING_SCHEDULED">{t('interests.status.SHOWING_SCHEDULED')}</option>
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
            
              {/* Formulär för granskning */}
              {selectedInterest.status === 'NEW' && (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('interests.fields.reviewComments')}
                    </label>
                    <textarea
                      id="reviewComments"
                      rows="3"
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder={t('interests.addComments')}
                    ></textarea>
                  </div>

                  <div className="flex space-x-2 justify-end mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      onClick={handleShowingButtonClick}
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.loading') : t('interests.actions.scheduleShowing')}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      onClick={handleReview}
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.loading') : t('interests.actions.review')}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={handleReject}
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.loading') : t('interests.actions.reject')}
                    </button>
                  </div>
                </>
              )}
              
              {/* Visa kommande visningstid om den är schemalagd */}
              {selectedInterest.status === 'SHOWING_SCHEDULED' && selectedInterest.showingDateTime && (
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-md">
                  <h3 className="font-medium text-purple-800 dark:text-purple-100 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    {t('interests.showingScheduled')}
                  </h3>
                  <p className="text-purple-700 dark:text-purple-200 mt-2">
                    {new Date(selectedInterest.showingDateTime).toLocaleDateString()} {t('common.at')} {new Date(selectedInterest.showingDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              )}

              {/* Kontaktinformation */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('interests.fields.contact')}</h3>
                  <button
                    onClick={openEmailModal}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={t('email.send')}
                  >
                    <EnvelopeIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('interests.fields.name')}: </span>
                    {selectedInterest.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('interests.fields.email')}: </span>
                    {selectedInterest.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{t('interests.fields.phone')}: </span>
                    {selectedInterest.phone}
                  </p>
                </div>
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