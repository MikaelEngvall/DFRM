import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Apartments from './pages/Apartments';
import Tenants from './pages/Tenants';
import Keys from './pages/Keys';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/apartments" element={<Apartments />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/keys" element={<Keys />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 