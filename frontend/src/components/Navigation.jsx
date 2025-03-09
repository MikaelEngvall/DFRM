import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  KeyIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';

// Flyttar Tooltip-komponenten utanför Navigation-komponenten
function Tooltip({ text, isVisible }) {
  if (!isVisible) return null;
  return (
    <div className="absolute left-12 z-10 w-auto px-2 py-1 text-sm font-medium text-white bg-gray-700 rounded-md shadow-sm">
      {text}
    </div>
  );
}

function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <button 
      className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
      onClick={() => setDarkMode(!darkMode)}
    >
      {darkMode 
        ? React.createElement(SunIcon, { className: "h-6 w-6" }) 
        : React.createElement(MoonIcon, { className: "h-6 w-6" })
      }
    </button>
  );
}

function MobileNavLink({ to, icon, label }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex items-center px-2 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md ${isActive ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
    >
      {React.createElement(icon, { className: "h-6 w-6 mr-3" })}
      <span>{label}</span>
    </NavLink>
  );
}

function DesktopNavLink({ to, icon: Icon, label, tooltips, showTooltip, hideTooltip, collapsed }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex items-center px-2 py-2 relative text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md ${isActive ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
      onMouseEnter={() => collapsed && showTooltip(to)}
      onMouseLeave={() => collapsed && hideTooltip(to)}
    >
      {React.createElement(Icon, { className: "h-6 w-6" })}
      {!collapsed && <span className="ml-3">{label}</span>}
      {collapsed && <Tooltip text={label} isVisible={tooltips[to]} />}
    </NavLink>
  );
}

const Navigation = () => {
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  // States för tooltip-synlighet
  const [tooltips, setTooltips] = useState({});
  const [logoutTooltipVisible, setLogoutTooltipVisible] = useState(false);
  const [themeTooltipVisible, setThemeTooltipVisible] = useState(false);
  // State för mobilmenyn
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

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
      href: '/',
      icon: HomeIcon,
    },
    {
      name: t('navigation.apartments'),
      href: '/apartments',
      icon: BuildingOffice2Icon,
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
    {
      name: t('navigation.tasks'),
      href: '/tasks',
      icon: ClipboardDocumentListIcon,
    },
    {
      name: t('navigation.pendingTasks'),
      href: '/pending-tasks',
      icon: ClipboardDocumentCheckIcon,
    },
    {
      name: t('navigation.calendar'),
      href: '/calendar',
      icon: CalendarIcon,
    },
  ];

  // Lägg till admin-länk endast för administratörer
  if (user && user.role === 'ADMIN') {
    navigation.push({
      name: t('navigation.admins'),
      href: '/admins',
      icon: UserIcon,
    });
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-30 p-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen 
          ? React.createElement(XMarkIcon, { className: "h-6 w-6" })
          : React.createElement(Bars3Icon, { className: "h-6 w-6" })
        }
      </button>

      {/* Mobile navigation */}
      <div 
        className={`lg:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-20 transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      >
        <div 
          className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 p-4 transition-transform duration-200 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">DFRM</h2>
            <p className="text-gray-600 dark:text-gray-400">Hej, {getFirstName()}</p>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <MobileNavLink key={item.name} to={item.href} icon={item.icon} label={item.name} />
            ))}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                className="w-full flex items-center px-2 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? (
                  <>
                    {React.createElement(SunIcon, { className: "h-6 w-6 mr-3" })}
                    <span>{t('navigation.lightMode')}</span>
                  </>
                ) : (
                  <>
                    {React.createElement(MoonIcon, { className: "h-6 w-6 mr-3" })}
                    <span>{t('navigation.darkMode')}</span>
                  </>
                )}
              </button>
              <button 
                className="w-full flex items-center px-2 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={handleLogout}
              >
                {React.createElement(ArrowRightOnRectangleIcon, { className: "h-6 w-6 mr-3" })}
                <span>{t('navigation.logout')}</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop navigation - top bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-end px-4 z-10">
        <div className="flex items-center space-x-4">
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          <button 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            onClick={handleLogout}
          >
            {React.createElement(ArrowRightOnRectangleIcon, { className: "h-6 w-6" })}
          </button>
        </div>
      </div>

      {/* Desktop navigation - sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 bottom-0 w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 pt-16">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">DFRM</h2>
          <p className="text-gray-600 dark:text-gray-400">Hej, {getFirstName()}</p>
        </div>
        <nav className="mt-6 px-2 space-y-1">
          {navigation.map((item) => (
            <DesktopNavLink key={item.name} to={item.href} icon={item.icon} label={item.name} tooltips={tooltips} showTooltip={showTooltip} hideTooltip={hideTooltip} />
          ))}
        </nav>
      </div>

      {/* Desktop navigation - collapsed sidebar for small screens */}
      <div className="fixed top-0 left-0 bottom-0 w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 pt-16 hidden md:block lg:hidden">
        <nav className="mt-6 px-2 space-y-1">
          {navigation.map((item) => (
            <DesktopNavLink key={item.name} to={item.href} icon={item.icon} tooltips={tooltips} showTooltip={showTooltip} hideTooltip={hideTooltip} collapsed />
          ))}
        </nav>
      </div>
    </>
  );
};

export default Navigation; 