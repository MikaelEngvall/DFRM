import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
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
import Import from './pages/Import';

// Wrapper-komponent för sidor som kräver navigation
const NavigationWrapper = ({ children }) => (
  <div className="flex min-h-screen">
    <Navigation />
    <div className="flex-1 overflow-auto mt-16 ml-16 lg:ml-60 bg-gray-100 dark:bg-gray-800">
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
                  <PrivateRoute>
                    <NavigationWrapper>
                      <Navigate to="/dashboard" replace />
                    </NavigationWrapper>
                  </PrivateRoute>
                } />
                
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <NavigationWrapper>
                      <Dashboard />
                    </NavigationWrapper>
                  </PrivateRoute>
                } />
                
                <Route path="/apartments" element={
                  <PrivateRoute>
                    <NavigationWrapper>
                      <Apartments />
                    </NavigationWrapper>
                  </PrivateRoute>
                } />
                
                <Route path="/tenants" element={
                  <PrivateRoute>
                    <NavigationWrapper>
                      <Tenants />
                    </NavigationWrapper>
                  </PrivateRoute>
                } />
                
                <Route path="/keys" element={
                  <PrivateRoute>
                    <NavigationWrapper>
                      <Keys />
                    </NavigationWrapper>
                  </PrivateRoute>
                } />
                
                <Route path="/tasks" element={
                  <PrivateRoute>
                    <NavigationWrapper>
                      <Tasks />
                    </NavigationWrapper>
                  </PrivateRoute>
                } />
                
                <Route path="/pending-tasks" element={
                  <PrivateRoute>
                    <NavigationWrapper>
                      <PendingTasks />
                    </NavigationWrapper>
                  </PrivateRoute>
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
                
                <Route path="/import" element={
                  <PrivateRoute requiredRoles={['SUPERADMIN']}>
                    <NavigationWrapper>
                      <Import />
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