import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  ChartBarIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { apartmentService, tenantService, keyService, pendingTaskService, interestService, taskService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = () => {
  const { t } = useLocale();
  const { user, hasRole } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [stats, setStats] = useState({
    totalApartments: 0,
    activeTenantsCount: 0,
    totalKeys: 0,
    vacantApartments: 0,
  });
  const [unreviewedCount, setUnreviewedCount] = useState(0);
  const [unreviewedInterestCount, setUnreviewedInterestCount] = useState(0);
  const [taskStats, setTaskStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const [interestStats, setInterestStats] = useState({
    new: 0,
    booked: 0,
    completed: 0
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Om användaren är USER, omdirigera till kalendersidan
    if (user && hasRole('USER')) {
      navigate('/calendar');
    }
  }, [user, hasRole, navigate]);

  // Lägg till en effect som lyssnar på ändringar i dokumentets klasser
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Funktion för att hämta olästa uppgifter utan cache
  const fetchUnreviewedCount = async () => {
    try {
      // Skicka true för att ignorera cache
      const count = await pendingTaskService.getUnreviewedCount(true);
      setUnreviewedCount(count);

      // Hämta antal olästa intresseanmälningar
      const interestCount = await interestService.getUnreviewedCount(true);
      setUnreviewedInterestCount(interestCount);
    } catch (err) {
      console.error('Error fetching unreviewed count:', err);
    }
  };

  const fetchTaskStats = async () => {
    try {
      // Hämta uppgifter med olika status
      const [pendingTasks, inProgressTasks, completedTasks] = await Promise.all([
        taskService.getTasksByStatus('PENDING', true),
        taskService.getTasksByStatus('IN_PROGRESS', true),
        taskService.getTasksByStatus('COMPLETED', true)
      ]);
      
      setTaskStats({
        pending: pendingTasks?.length || 0,
        inProgress: inProgressTasks?.length || 0,
        completed: completedTasks?.length || 0
      });
    } catch (err) {
      console.error('Error fetching task stats:', err);
    }
  };

  const fetchInterestStats = async () => {
    try {
      // Hämta alla intresseanmälningar inklusive visningsdata
      const allInterests = await interestService.getAllWithShowings(true);
      console.log("Alla intresseanmälningar med visningsdata:", allInterests);
      
      // Kontrollera om intressena har fullständig information om visningar
      // Vissa API-anrop kanske inte inkluderar showing-objektet
      const interestsWithShowings = allInterests.filter(interest => interest.showing);
      console.log("Intresseanmälningar med visningsobjekt:", interestsWithShowings);
      
      if (interestsWithShowings.length > 0) {
        console.log("Exempel på visningsobjekt:", interestsWithShowings[0].showing);
      }
      
      // Hämta antal nya intresseanmälningar (obehandlade)
      const newInterests = allInterests.filter(interest => 
        interest.status === 'NEW'
      );
      
      // Hämta antal bokade visningar (SHOWING_SCHEDULED)
      const bookedInterests = allInterests.filter(interest => 
        interest.status === 'SHOWING_SCHEDULED'
      );
      
      // Leta efter genomförda visningar på två sätt:
      // 1. Intresseanmälningar som har status SHOWING_COMPLETED
      // 2. Intresseanmälningar som har showing.status === 'COMPLETED'
      const completedInterests1 = allInterests.filter(interest => 
        interest.status === 'SHOWING_COMPLETED'
      );
      
      const completedInterests2 = allInterests.filter(interest => 
        interest.showing && interest.showing.status === 'COMPLETED'
      );
      
      console.log("Visningar med status SHOWING_COMPLETED:", completedInterests1);
      console.log("Visningar med showing.status COMPLETED:", completedInterests2);
      
      // Använd den kombinerade listan för att räkna genomförda visningar
      const completedInterestsIds = new Set();
      
      completedInterests1.forEach(interest => {
        completedInterestsIds.add(interest.id);
      });
      
      completedInterests2.forEach(interest => {
        completedInterestsIds.add(interest.id);
      });
      
      const completedCount = completedInterestsIds.size;
      console.log("Genomförda visningar totalt:", completedCount);
      
      // Uppdatera state med statistik
      setInterestStats({
        new: newInterests?.length || 0,
        booked: bookedInterests?.length || 0,
        completed: completedCount
      });
      
      console.log("Intressestatistik uppdaterad:", {
        new: newInterests?.length || 0,
        booked: bookedInterests?.length || 0,
        completed: completedCount
      });
    } catch (err) {
      console.error('Error fetching interest stats:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Hämta statistik
        const [apartments, tenants, keys] = await Promise.all([
          apartmentService.getAllApartments(),
          tenantService.getAllTenants(),
          keyService.getAllKeys()
        ]);
        
        const totalApartments = apartments?.length || 0;
        const activeTenantsCount = tenants?.length || 0;
        const totalKeys = keys?.length || 0;
        
        // Uppdaterad logik för att avgöra om en lägenhet är ledig (samma som i Apartments.jsx)
        const isApartmentVacant = (apartment) => {
          if (!apartment.tenants) return true;
          if (Array.isArray(apartment.tenants) && apartment.tenants.length === 0) return true;
          if (Array.isArray(apartment.tenants)) {
            // Filtrera bort null/undefined värden
            const validTenants = apartment.tenants.filter(t => t);
            return validTenants.length === 0;
          }
          return false;
        };
        
        const vacantApartments = apartments?.filter(isApartmentVacant)?.length || 0;
        
        setStats({
          totalApartments,
          activeTenantsCount,
          totalKeys,
          vacantApartments
        });
        
        // Hämta olästa uppgifter utan cache
        await fetchUnreviewedCount();
        
        // Hämta uppgifts- och intressestatistik
        await Promise.all([fetchTaskStats(), fetchInterestStats()]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Lägg till en fokushanterare för att uppdatera olästa uppgifter när fönstret får fokus
    const handleFocus = () => {
      fetchUnreviewedCount();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [t]);

  // Om användaren är USER, visa ingenting medan omdirigeringen sker
  if (user && hasRole('USER')) {
    return null;
  }

  const statCards = [
    {
      name: t('dashboard.stats.totalApartments'),
      value: stats.totalApartments,
      icon: HomeIcon,
      color: 'bg-blue-500',
      link: '/apartments',
    },
    {
      name: t('dashboard.stats.activeTenantsCount'),
      value: stats.activeTenantsCount,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      link: '/tenants',
    },
    {
      name: t('dashboard.stats.totalKeys'),
      value: stats.totalKeys,
      icon: KeyIcon,
      color: 'bg-yellow-500',
      link: '/keys',
    },
    {
      name: t('dashboard.stats.vacantApartments'),
      value: stats.vacantApartments,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      link: '/apartments?filter=vacant',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleEmailReportsClick = () => {
    navigate('/tasks');
  };

  const handlePendingTasksClick = () => {
    navigate('/pending-tasks');
  };

  const handleInterestsClick = () => {
    navigate('/interests');
  };

  // Hantera klick på "Läs e-post" för intresseanmälningar
  const handleCheckInterestEmails = async () => {
    try {
      setIsLoading(true);
      await interestService.checkEmails();
      
      // Efter att e-post har lästs, uppdatera antalet olästa intresseanmälningar
      const interestCount = await interestService.getUnreviewedCount(true);
      setUnreviewedInterestCount(interestCount);
      
      setSuccessMessage(t('interests.messages.emailCheckSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Fel vid läsning av intresse-e-post:', err);
      setError(t('interests.messages.emailCheckError'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-cinzel mb-8 dark:text-white">{t('dashboard.title')}</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-white dark:bg-gray-900 overflow-hidden shadow dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5),0_2px_4px_-2px_rgba(0,0,0,0.5)] rounded-lg hover:shadow-lg dark:hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.6),0_4px_6px_-4px_rgba(0,0,0,0.6)] transition-shadow dark:border dark:border-gray-700"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">
                    {stat.name}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Senaste aktiviteter */}
        <div className="bg-white dark:bg-gray-900 shadow dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5),0_2px_4px_-2px_rgba(0,0,0,0.5)] rounded-lg p-6 dark:border dark:border-gray-700 hover:shadow-lg dark:hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.6),0_4px_6px_-4px_rgba(0,0,0,0.6)] transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('dashboard.sections.recentActivity')}
            </h2>
            <button
              onClick={handleCheckInterestEmails}
              title={t('interests.actions.checkEmails')}
              className="ml-4 bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="space-y-4" onClick={handleInterestsClick} style={{ cursor: 'pointer' }}>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="text-sm font-medium">{t('interests.status.NEW')}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${interestStats.new > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {interestStats.new > 0 ? interestStats.new : t('common.none')}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="text-sm font-medium">{t('interests.status.SHOWING_SCHEDULED')}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${interestStats.booked > 0 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {interestStats.booked > 0 ? interestStats.booked : t('common.none')}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="text-sm font-medium">{t('showings.statusTypes.COMPLETED')}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${interestStats.completed > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {interestStats.completed > 0 ? interestStats.completed : t('common.none')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kommande händelser */}
        <div className="bg-white dark:bg-gray-900 shadow dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5),0_2px_4px_-2px_rgba(0,0,0,0.5)] rounded-lg p-6 dark:border dark:border-gray-700 hover:shadow-lg dark:hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.6),0_4px_6px_-4px_rgba(0,0,0,0.6)] transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('dashboard.sections.upcomingEvents')}
            </h2>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  setIsLoading(true);
                  await pendingTaskService.checkEmails();
                  fetchUnreviewedCount();
                } catch (err) {
                  console.error('Fel vid läsning av felanmälnings-e-post:', err);
                  setError(t('pendingTasks.messages.emailCheckError'));
                } finally {
                  setIsLoading(false);
                }
              }}
              title={t('pendingTasks.actions.checkEmails')}
              className="ml-4 bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <div className="space-y-4" onClick={handleEmailReportsClick} style={{ cursor: 'pointer' }}>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md" 
                    onClick={(e) => { e.stopPropagation(); handlePendingTasksClick(); }}>
                <span className="text-sm font-medium">{t('tasks.status.PENDING')}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStats.pending > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {taskStats.pending > 0 ? taskStats.pending : t('common.none')}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="text-sm font-medium">{t('tasks.status.IN_PROGRESS')}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStats.inProgress > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {taskStats.inProgress > 0 ? taskStats.inProgress : t('common.none')}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <span className="text-sm font-medium">{t('tasks.status.COMPLETED')}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskStats.completed > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {taskStats.completed > 0 ? taskStats.completed : t('common.none')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logotyp sektion */}
      <div className="mt-8">
        <img 
          src={isDark
            ? "./Transparent Logo White Text.png" 
            : "./Transparent Logo Black Text.png"}
          alt="DFRM Logotype"
          className="w-full h-auto px-4 sm:px-6 lg:px-8"
        />
      </div>
    </div>
  );
};

export default Dashboard; 