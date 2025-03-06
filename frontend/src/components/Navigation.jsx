import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    {
      name: 'Översikt',
      href: '/dashboard',
      icon: ChartBarIcon,
    },
    {
      name: 'Lägenheter',
      href: '/apartments',
      icon: HomeIcon,
    },
    {
      name: 'Hyresgäster',
      href: '/tenants',
      icon: UserGroupIcon,
    },
    {
      name: 'Nycklar',
      href: '/keys',
      icon: KeyIcon,
    },
  ];

  return (
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-cinzel text-primary">DFRM</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'border-primary text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-sm text-gray-500 mr-4">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logga ut
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 