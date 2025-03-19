import React, { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import Title from '../components/Title';
import DataTable from '../components/DataTable';
import { interestService, taskService } from '../services';
import { EnvelopeIcon, FunnelIcon, XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

const Interests = () => {
  const { t } = useLocale();
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

  // Hämta intresseanmälningar från API
  const fetchInterests = async () => {
    try {
      setIsLoading(true);
      const data = await interestService.getForReview();
      setInterests(data);
    } catch (err) {
      console.error('Error fetching interests:', err);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Hämta granskade intresseanmälningar från API
  const fetchReviewedInterests = async () => {
    try {
      setIsLoading(true);
      const data = await interestService.getReviewed();
      setReviewedInterests(data);
    } catch (err) {
      console.error('Error fetching reviewed interests:', err);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

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
      console.error('Error reviewing interest:', err);
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
      console.error('Error rejecting interest:', err);
      setError(t('interests.messages.rejectError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Bestäm vilken data som ska visas baserat på visningsläge
  const getDisplayData = () => {
    return showReviewed ? reviewedInterests : interests;
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

  // Hantera schemaläggning av visning
  const handleScheduleShowing = async () => {
    if (!showingDate || !showingTime || !responseMail) {
      setError(t('interests.messages.fieldsRequired'));
      return;
    }

    try {
      setIsLoading(true);
      
      // Skapa en ISO-datumsträngformat för att lagra visningsdatum och tid
      const showingDateTime = `${showingDate}T${showingTime}:00`;
      
      // Skicka e-post till intresseanmälaren och schemalägg visning
      await interestService.scheduleShowing(selectedInterest.id, {
        reviewedById: currentUser.id,
        responseMessage: responseMail,
        showingDateTime: showingDateTime
      });
      
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
      setSelectedInterest(null);
    } catch (err) {
      console.error('Error scheduling showing:', err);
      setError(t('interests.messages.showingError'));
    } finally {
      setIsLoading(false);
    }
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
          {t('interests.title')}
        </Title>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            {t('common.filters')}
          </button>
          <button
            onClick={async () => {
              try {
                setIsLoading(true);
                await interestService.checkEmails();
                fetchInterests();
                fetchReviewedInterests();
              } catch (err) {
                console.error('Fel vid läsning av e-post:', err);
                setError(t('interests.messages.emailCheckError'));
              } finally {
                setIsLoading(false);
              }
            }}
            title={t('interests.actions.checkEmails')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center"
          >
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            {t('interests.actions.checkEmails')}
          </button>
        </div>
      </div>
      
      {/* Felmeddelande */}
      {error && (
        <div className="bg-red-600 text-white p-3 mb-4 rounded-md">
          {error}
        </div>
      )}
      
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('common.filters')}</h2>
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              {t('common.clear')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('interests.fields.status')}
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                <option value="NEW">{t('interests.status.NEW')}</option>
                <option value="REVIEWED">{t('interests.status.REVIEWED')}</option>
                <option value="REJECTED">{t('interests.status.REJECTED')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('common.showReviewed')}
              </label>
              <div className="mt-2">
                <input
                  type="checkbox"
                  id="showReviewed"
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out mr-2"
                  checked={showReviewed}
                  onChange={() => setShowReviewed(!showReviewed)}
                />
                <label htmlFor="showReviewed" className="text-gray-700 dark:text-gray-300">
                  {t('interests.showReviewed')}
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {getDisplayData().length} {t('interests.filteredResults', { count: getDisplayData().length })}
            </div>
            <button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              {t('common.apply')}
            </button>
          </div>
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
                    {selectedInterest.email && (
                      <a 
                        href={`mailto:${selectedInterest.email}`}
                        className="mt-1 inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white rounded-r-md"
                        title={t('common.sendEmail')}
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                      </a>
                    )}
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
                      onClick={() => {
                        setIsReviewModalOpen(false);
                        setIsShowingModalOpen(true);
                      }}
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
                  disabled={isLoading || !showingDate || !showingTime || !responseMail}
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
    </div>
  );
};

export default Interests; 