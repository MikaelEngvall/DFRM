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

// Wrapper-komponent för sidor som kräver navigation
const NavigationWrapper = ({ children }) => (
  <div>
    <Navigation />
    <main className="pt-16">
      {children}
    </main>
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
              </Routes>
            </div>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App; 