import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Apartments from './pages/Apartments';
import Tenants from './pages/Tenants';
import Keys from './pages/Keys';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import PendingTasks from './pages/PendingTasks';
import Calendar from './pages/Calendar';
import Staff from './pages/Staff';

// Wrapper-komponent för sidor som kräver navigation
const NavigationWrapper = ({ children }) => (
  <div className="flex min-h-screen">
    <Navigation />
    <div className="flex-1 overflow-auto mt-16 ml-16 lg:ml-60">
      {children}
    </div>
  </div>
);

const App = () => {
  return (
    <Router future={{ 
      v7_relativeSplatPath: true,
      v7_startTransition: true 
    }}>
      <ThemeProvider>
        <LocaleProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Skyddade rutter med navigation */}
                <Route path="/" element={
                  <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <NavigationWrapper>
                      <Navigate to="/dashboard" replace />
                    </NavigationWrapper>
                  </RoleBasedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <NavigationWrapper>
                      <Dashboard />
                    </NavigationWrapper>
                  </RoleBasedRoute>
                } />
                
                <Route path="/apartments" element={
                  <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <NavigationWrapper>
                      <Apartments />
                    </NavigationWrapper>
                  </RoleBasedRoute>
                } />
                
                <Route path="/tenants" element={
                  <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <NavigationWrapper>
                      <Tenants />
                    </NavigationWrapper>
                  </RoleBasedRoute>
                } />
                
                <Route path="/keys" element={
                  <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <NavigationWrapper>
                      <Keys />
                    </NavigationWrapper>
                  </RoleBasedRoute>
                } />
                
                <Route path="/tasks" element={
                  <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <NavigationWrapper>
                      <Tasks />
                    </NavigationWrapper>
                  </RoleBasedRoute>
                } />
                
                <Route path="/pending-tasks" element={
                  <RoleBasedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                    <NavigationWrapper>
                      <PendingTasks />
                    </NavigationWrapper>
                  </RoleBasedRoute>
                } />
                
                <Route path="/calendar" element={
                  <PrivateRoute>
                    <NavigationWrapper>
                      <Calendar />
                    </NavigationWrapper>
                  </PrivateRoute>
                } />
                
                <Route path="/staff" element={
                  <PrivateRoute>
                    <NavigationWrapper>
                      <Staff />
                    </NavigationWrapper>
                  </PrivateRoute>
                } />
              </Routes>
            </div>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App; 