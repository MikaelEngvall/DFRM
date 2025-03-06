import React from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const stats = [
    {
      name: 'Totalt antal lägenheter',
      value: '42',
      icon: HomeIcon,
      color: 'bg-blue-500',
      link: '/apartments',
    },
    {
      name: 'Aktiva hyresgäster',
      value: '38',
      icon: UserGroupIcon,
      color: 'bg-green-500',
      link: '/tenants',
    },
    {
      name: 'Utdelade nycklar',
      value: '56',
      icon: KeyIcon,
      color: 'bg-yellow-500',
      link: '/keys',
    },
    {
      name: 'Lediga lägenheter',
      value: '4',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      link: '/apartments',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-cinzel mb-8">Översikt</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
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
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Senaste aktiviteter
          </h2>
          <div className="space-y-4">
            {/* Här kan vi lägga till en lista med senaste aktiviteter */}
            <p className="text-gray-500">Ingen aktivitet att visa</p>
          </div>
        </div>

        {/* Kommande händelser */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Kommande händelser
          </h2>
          <div className="space-y-4">
            {/* Här kan vi lägga till en lista med kommande händelser */}
            <p className="text-gray-500">Inga kommande händelser</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 