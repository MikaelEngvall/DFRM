import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { apartmentService, tenantService, keyService, pendingTaskService } from '../services';
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
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [stats, setStats] = useState({
    totalApartments: 0,
    activeTenantsCount: 0,
    totalKeys: 0,
    vacantApartments: 0,
  });
  const [unreviewedCount, setUnreviewedCount] = useState(0);

  useEffect(() => {
    // Om användaren är USER, omdirigera till kalendersidan
    if (user && hasRole('USER')) {
      navigate('/calendar');
    }
  }, [user, hasRole, navigate]);

  // Funktion för att hämta olästa uppgifter utan cache
  const fetchUnreviewedCount = async () => {
    try {
      // Skicka true för att ignorera cache
      const count = await pendingTaskService.getUnreviewedCount(true);
      setUnreviewedCount(count);
    } catch (err) {
      console.error('Error fetching unreviewed count:', err);
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

  // Lägg till en effect som lyssnar på förändringar i HTML-dokumentets klasser
  useEffect(() => {
    // Funktion som kontrollerar om mörkt läge är aktivt
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    // Kör en första kontroll
    checkDarkMode();
    
    // Sätt upp en MutationObserver för att lyssna på klassändringar
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          checkDarkMode();
        }
      });
    });
    
    // Starta observationen av HTML-dokumentet
    observer.observe(document.documentElement, { attributes: true });
    
    // Städa upp observern när komponenten avmonteras
    return () => {
      observer.disconnect();
    };
  }, []);

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
    navigate('/pending-tasks');
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
        <div className="bg-white dark:bg-gray-900 shadow dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5),0_2px_4px_-2px_rgba(0,0,0,0.5)] rounded-lg p-6 dark:border dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('dashboard.sections.recentActivity')}
          </h2>
          <div className="space-y-4">
            {/* Här kan vi lägga till en lista med senaste aktiviteter */}
            <p className="text-gray-500 dark:text-gray-400">{t('dashboard.sections.noActivity')}</p>
          </div>
        </div>

        {/* Kommande händelser */}
        <div 
          onClick={handleEmailReportsClick}
          className="bg-white dark:bg-gray-900 shadow dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5),0_2px_4px_-2px_rgba(0,0,0,0.5)] rounded-lg p-6 dark:border dark:border-gray-700 cursor-pointer hover:shadow-lg dark:hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.6),0_4px_6px_-4px_rgba(0,0,0,0.6)] transition-shadow"
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('dashboard.sections.upcomingEvents')}
          </h2>
          <div className="space-y-4">
            {unreviewedCount > 0 ? (
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                {unreviewedCount} {unreviewedCount === 1 ? 
                  t('dashboard.sections.newReportNeedReview') : 
                  t('dashboard.sections.newReportsNeedReview')}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">{t('dashboard.sections.noEvents')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Logotyp sektion */}
      <div className="mt-8">
        <img 
          src={isDarkMode 
            ? "/Transparent Logo White Text.png" 
            : "/Transparent Logo Black Text.png"}
          alt={`DFRM Logotype (${isDarkMode ? 'dark' : 'light'} mode)`}
          className="w-full h-auto px-4 sm:px-6 lg:px-8"
        />
      </div>
    </div>
  );
};

export default Dashboard; 