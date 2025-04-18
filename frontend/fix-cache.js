// Fix cache script
console.log('Rensar applikationscache...');

try {
  // Rensa alla auth tokens
  localStorage.removeItem('auth_auth_token');
  localStorage.removeItem('fallback_token');
  localStorage.removeItem('raw_token');
  
  // Rensa userData
  localStorage.removeItem('userData');
  
  // Rensa eventuella flaggor
  localStorage.removeItem('auth_redirect');
  
  // Rensa sessionStorage
  sessionStorage.removeItem('savedLocation');
  
  console.log('Cache rensad!');
  console.log('Ladda om sidan och försök logga in igen.');
} catch (error) {
  console.error('Fel vid rensning av cache:', error);
}
