import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Apartments from './pages/Apartments';
import Tenants from './pages/Tenants';
import Keys from './pages/Keys';
import Login from './pages/Login';

const PrivateLayout = () => (
  <div>
    <Navigation />
    <main className="pt-16">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apartments" element={<Apartments />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/keys" element={<Keys />} />
      </Routes>
    </main>
  </div>
);

const App = () => {
  return (
    <Router>
      <LocaleProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <PrivateLayout />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </LocaleProvider>
    </Router>
  );
};

export default App; 