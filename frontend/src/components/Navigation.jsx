import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import LanguageSelector from './LanguageSelector';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  // States för tooltip-synlighet
  const [tooltips, setTooltips] = useState({});
  const [logoutTooltipVisible, setLogoutTooltipVisible] = useState(false);
  // State för mobilmenyn
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getFirstName = () => {
    if (!user) return '';
    return user.firstName || user.email.split('@')[0];
  };

  const showTooltip = (itemName) => {
    setTooltips(prev => ({ ...prev, [itemName]: true }));
  };

  const hideTooltip = (itemName) => {
    setTooltips(prev => ({ ...prev, [itemName]: false }));
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigation = [
    {
      name: t('navigation.dashboard'),
      href: '/dashboard',
      icon: ChartBarIcon,
    },
    {
      name: t('navigation.apartments'),
      href: '/apartments',
      icon: HomeIcon,
    },
    {
      name: t('navigation.tenants'),
      href: '/tenants',
      icon: UserGroupIcon,
    },
    {
      name: t('navigation.keys'),
      href: '/keys',
      icon: KeyIcon,
    },
  ];

  // Tooltip component
  const Tooltip = ({ text, isVisible }) => {
    if (!isVisible) return null;
    return (
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-20">
        {text}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-800"></div>
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-cinzel text-primary">DFRM</span>
            </div>
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'border-primary text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium relative`}
                  onMouseEnter={() => showTooltip(item.name)}
                  onMouseLeave={() => hideTooltip(item.name)}
                >
                  <item.icon className="h-5 w-5" />
                  <Tooltip text={item.name} isVisible={tooltips[item.name]} />
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">{mobileMenuOpen ? 'Stäng meny' : 'Öppna meny'}</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <div className="flex-shrink-0">
              <span className="text-sm text-gray-500 mr-4">{getFirstName()}</span>
              <button
                onClick={handleLogout}
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onMouseEnter={() => setLogoutTooltipVisible(true)}
                onMouseLeave={() => setLogoutTooltipVisible(false)}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <Tooltip text={t('navigation.logout')} isVisible={logoutTooltipVisible} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on state */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? 'bg-primary-50 border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 