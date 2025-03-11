import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { apartmentService, tenantService, keyService } from '../services';
import { useLocale } from '../contexts/LocaleContext';

const Dashboard = () => {
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalApartments: 0,
    activeTenantsCount: 0,
    totalKeys: 0,
    vacantApartments: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [apartments, tenants, keys] = await Promise.all([
        apartmentService.getAllApartments(),
        tenantService.getAllTenants(),
        keyService.getAllKeys(),
      ]);

      const activeTenantsCount = tenants.filter(tenant => !tenant.resiliationDate).length;
      const vacantApartments = apartments.filter(apartment => !apartment.tenants?.length).length;

      setStats({
        totalApartments: apartments.length,
        activeTenantsCount,
        totalKeys: keys.length,
        vacantApartments,
      });

      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="bg-white dark:bg-gray-900 shadow dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5),0_2px_4px_-2px_rgba(0,0,0,0.5)] rounded-lg p-6 dark:border dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('dashboard.sections.upcomingEvents')}
          </h2>
          <div className="space-y-4">
            {/* Här kan vi lägga till en lista med kommande händelser */}
            <p className="text-gray-500 dark:text-gray-400">{t('dashboard.sections.noEvents')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 