import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAuthToken } from '../utils/tokenStorage';

const DebugAuthHelper = () => {
  const { user } = useAuth();
  const [token, setToken] = useState(null);
  const [tokenInfo, setTokenInfo] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState({});

  useEffect(() => {
    const authToken = getAuthToken();
    setToken(authToken);
    
    if (authToken) {
      try {
        // Tolka JWT token
        const parts = authToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setTokenInfo(payload);
          
          // Beräkna om tokenet har gått ut
          const now = Math.floor(Date.now() / 1000);
          const isExpired = payload.exp && payload.exp < now;
          
          setDiagnosticInfo({
            isExpired,
            expiresIn: payload.exp ? `${Math.floor((payload.exp - now) / 60)} minuter` : 'Okänt',
            roles: payload.roles || payload.authorities || 'Inga roller hittades',
            userId: payload.sub || 'Okänt',
            sessionStarted: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'Okänt'
          });
        }
      } catch (e) {
        console.error('Fel vid tolkning av token', e);
        setDiagnosticInfo({ error: 'Kunde inte tolka token' });
      }
    } else {
      setDiagnosticInfo({ error: 'Ingen token hittades' });
    }
  }, [user]);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 bg-red-500 text-white px-3 py-2 rounded-md shadow-lg"
      >
        Debug Auth
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-4 rounded-md shadow-lg w-96">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Auth Diagnostics</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
        >
          X
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <div className="font-semibold">Användare:</div>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {user ? (
              <div>
                <div>Namn: {user.firstName} {user.lastName}</div>
                <div>Email: {user.email}</div>
                <div>Roll: {user.role}</div>
                <div>ID: {user.id}</div>
              </div>
            ) : (
              'Inte inloggad'
            )}
          </div>
        </div>
        
        <div>
          <div className="font-semibold">Token status:</div>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {diagnosticInfo.error ? (
              <div className="text-red-500">{diagnosticInfo.error}</div>
            ) : (
              <div>
                <div className={`${diagnosticInfo.isExpired ? 'text-red-500' : 'text-green-500'}`}>
                  {diagnosticInfo.isExpired ? 'Token har gått ut!' : 'Token är giltig'}
                </div>
                <div>Går ut om: {diagnosticInfo.expiresIn}</div>
                <div>Roller: {JSON.stringify(diagnosticInfo.roles)}</div>
                <div>Användar-ID: {diagnosticInfo.userId}</div>
                <div>Session startad: {diagnosticInfo.sessionStarted}</div>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => window.location.href = '/login'}
          className="bg-blue-500 text-white px-3 py-1 rounded w-full hover:bg-blue-600"
        >
          Gå till inloggning
        </button>
      </div>
    </div>
  );
};

export default DebugAuthHelper; 