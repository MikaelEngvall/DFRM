import React, { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import Title from '../components/Title';
import { interestService } from '../services';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

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
  const [filters, setFilters] = useState({
    status: ''
  });

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
    // Rensa HTML-taggar, behåll radbrytningar
    return text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ');
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 bg-slate-800 min-h-screen">
      <div className="mb-6">
        <Title level="h1" className="mb-4">{t('interests.title')}</Title>
        
        {/* Felmeddelande */}
        {error && (
          <div className="bg-red-600 text-white p-3 mb-4 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      {/* Filtersektion */}
      <div className="bg-slate-800 p-4 dark:bg-gray-800 shadow">
        <h2 className="text-lg font-medium text-white mb-4">
          {t('common.filters')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
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
            <label className="block text-sm font-medium text-white mb-1">
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
              <label htmlFor="showReviewed" className="text-white">
                {t('interests.showReviewed')}
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={clearFilters}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md"
          >
            {t('common.clear')}
          </button>
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            {t('common.apply')}
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
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-slate-800 w-full">
          {getDisplayData().length === 0 ? (
            <p className="p-4 text-center text-gray-300">{t('interests.noInterests')}</p>
          ) : (
            <table className="min-w-full bg-slate-800 text-white">
              <thead className="uppercase">
                <tr>
                  <th className="p-4 text-left">{t('interests.fields.name')}</th>
                  <th className="p-4 text-left">{t('interests.fields.contact')}</th>
                  <th className="p-4 text-left">{t('interests.fields.apartment')}</th>
                  <th className="p-4 text-left">{t('interests.fields.received').toUpperCase()}</th>
                  <th className="p-4 text-left">{t('interests.fields.priority').toUpperCase()}</th>
                  <th className="p-4 text-left">{t('interests.fields.status').toUpperCase()}</th>
                  <th className="p-4 text-left">{t('interests.fields.reviewedBy').toUpperCase()}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {getDisplayData().map((interest) => (
                  <tr 
                    key={interest.id} 
                    className="hover:bg-slate-700 cursor-pointer"
                    onClick={() => handleRowClick(interest)}
                  >
                    <td className="p-4">{interest.name || '-'}</td>
                    <td className="p-4">
                      <div>{interest.email || '-'}</div>
                      <div className="text-sm text-gray-400">{interest.phone || '-'}</div>
                    </td>
                    <td className="p-4">{interest.apartment || '-'}</td>
                    <td className="p-4">{formatDate(interest.received)}</td>
                    <td className="p-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${interest.status === 'NEW' ? 'bg-yellow-500' : 
                          interest.status === 'REVIEWED' ? 'bg-green-500' : 
                          'bg-red-500'}`}>
                        {interest.status === 'NEW' ? 'Akut' : 
                         interest.status === 'REVIEWED' ? 'Låg' : 
                         'Medium'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${interest.status === 'NEW' ? 'bg-slate-200 text-slate-800' : 
                          interest.status === 'REVIEWED' ? 'bg-green-200 text-green-800' : 
                          'bg-red-200 text-red-800'}`}>
                        {interest.status === 'NEW' ? t('tasks.status.PENDING') : 
                         interest.status === 'REVIEWED' ? t('tasks.status.COMPLETED') : 
                         t('tasks.status.IN_PROGRESS')}
                      </span>
                    </td>
                    <td className="p-4">
                      {interest.reviewedBy ? 
                        `${interest.reviewedBy.firstName || 'undefined'} ${interest.reviewedBy.lastName || 'undefined'}` :
                        ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
          <div className="space-y-4 bg-gray-800 text-white p-4 rounded">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('interests.fields.name')}
                  </label>
                  <input 
                    type="text" 
                    value={selectedInterest.name || '-'}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('interests.fields.apartment')}
                  </label>
                  <input 
                    type="text" 
                    value={selectedInterest.apartment || '-'}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('interests.fields.message')}
                </label>
                <textarea
                  value={formatText(selectedInterest.message) || '-'}
                  readOnly
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('interests.fields.email')}
                  </label>
                  <input 
                    type="text" 
                    value={selectedInterest.email || '-'}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('interests.fields.phone')}
                  </label>
                  <input 
                    type="text" 
                    value={selectedInterest.phone || '-'}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('interests.fields.received')}
                  </label>
                  <input 
                    type="text" 
                    value={formatDate(selectedInterest.received)}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('interests.fields.status')}
                  </label>
                  <select
                    value={selectedInterest.status}
                    disabled
                    className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white"
                  >
                    <option value="NEW">{t('interests.status.NEW')}</option>
                    <option value="REVIEWED">{t('interests.status.REVIEWED')}</option>
                    <option value="REJECTED">{t('interests.status.REJECTED')}</option>
                  </select>
                </div>
              </div>
              
              {selectedInterest.pageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('interests.fields.pageUrl')}
                  </label>
                  <div className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white overflow-x-auto">
                    <a 
                      href={selectedInterest.pageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline break-all"
                    >
                      {selectedInterest.pageUrl}
                    </a>
                  </div>
                </div>
              )}
            
              {/* Formulär för granskning */}
              {selectedInterest.status === 'NEW' && (
                <>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {t('interests.fields.reviewComments')}
                    </label>
                    <textarea
                      id="reviewComments"
                      rows="3"
                      className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white"
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder={t('interests.addComments')}
                    ></textarea>
                  </div>

                  <div className="flex space-x-2 justify-end mt-4">
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
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Interests; 