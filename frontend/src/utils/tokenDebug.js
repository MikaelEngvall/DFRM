export function decodeJwtToken() {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    // Dela upp token och dekoda mittendelen (payload)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Fel vid avkodning av token:', e);
    return null;
  }
} 