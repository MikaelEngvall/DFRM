import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, BuildingOfficeIcon, UserGroupIcon, KeyIcon } from '@heroicons/react/24/outline';

const Navigation = () => {
  const navItems = [
    { name: 'Översikt', path: '/', icon: HomeIcon },
    { name: 'Lägenheter', path: '/apartments', icon: BuildingOfficeIcon },
    { name: 'Hyresgäster', path: '/tenants', icon: UserGroupIcon },
    { name: 'Nycklar', path: '/keys', icon: KeyIcon },
  ];

  return (
    <nav className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="font-cinzel text-xl">DFRM</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobil meny */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary transition-colors block"
            >
              <item.icon className="h-5 w-5 mr-2" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 