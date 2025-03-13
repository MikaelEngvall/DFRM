// updateValhallaPostalCode.js
// Skript för att uppdatera postnummer för alla Valhallavägen-adresser till 37141

const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:8080/api';

// Hämta token från kommandoradsargument
let TOKEN = process.argv[2];

if (!TOKEN) {
  console.error('Ingen token angiven!');
  console.log('Användning: node updateValhallaPostalCode.js <token>');
  console.log('Om du vill hämta token från localStorage, kör detta i webbläsarens konsol:');
  console.log('  console.log(localStorage.getItem("auth_token"))');
  process.exit(1);
}

// Funktion för att hämta alla lägenheter
async function getAllApartments() {
  try {
    const response = await axios.get(`${API_URL}/apartments`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    return response.data;
  } catch (error) {
    console.error('Fel vid hämtning av lägenheter:', error.message);
    return [];
  }
}

// Funktion för att hämta alla hyresgäster
async function getAllTenants() {
  try {
    const response = await axios.get(`${API_URL}/tenants`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    return response.data;
  } catch (error) {
    console.error('Fel vid hämtning av hyresgäster:', error.message);
    return [];
  }
}

// Funktion för att uppdatera en lägenhet
async function updateApartment(id, data) {
  try {
    const response = await axios.patch(`${API_URL}/apartments/${id}`, data, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Fel vid uppdatering av lägenhet ${id}:`, error.message);
    return null;
  }
}

// Funktion för att uppdatera en hyresgäst
async function updateTenant(id, data) {
  try {
    const response = await axios.patch(`${API_URL}/tenants/${id}`, data, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Fel vid uppdatering av hyresgäst ${id}:`, error.message);
    return null;
  }
}

// Huvudfunktion för att uppdatera alla Valhallavägen-adresser
async function updateValhallaAddresses() {
  console.log('Startar uppdatering av postnummer för Valhallavägen...');
  console.log('Använder token:', TOKEN.substring(0, 10) + '...');
  
  // Hämta alla lägenheter och hyresgäster
  const [apartments, tenants] = await Promise.all([getAllApartments(), getAllTenants()]);
  
  console.log(`Hittade ${apartments.length} lägenheter och ${tenants.length} hyresgäster`);
  
  // Filtrera ut lägenheter på Valhallavägen
  const valhalaApartments = apartments.filter(apt => 
    apt.street && apt.street.toLowerCase().includes('valhallavägen')
  );
  
  console.log(`Hittade ${valhalaApartments.length} lägenheter på Valhallavägen`);
  
  // Uppdatera postnummer för alla Valhallavägen-lägenheter
  let updatedApartments = 0;
  for (const apt of valhalaApartments) {
    console.log(`Uppdaterar lägenhet ${apt.id} (${apt.street} ${apt.number}): ${apt.postalCode || 'inget postnummer'} -> 37141`);
    
    const updated = await updateApartment(apt.id, { postalCode: '37141' });
    if (updated) updatedApartments++;
  }
  
  // Filtrera ut hyresgäster på Valhallavägen
  const valhallaTenants = tenants.filter(tenant => 
    tenant.street && tenant.street.toLowerCase().includes('valhallavägen')
  );
  
  console.log(`Hittade ${valhallaTenants.length} hyresgäster på Valhallavägen`);
  
  // Uppdatera postnummer för alla Valhallavägen-hyresgäster
  let updatedTenants = 0;
  for (const tenant of valhallaTenants) {
    console.log(`Uppdaterar hyresgäst ${tenant.id} (${tenant.firstName} ${tenant.lastName}, ${tenant.street} ${tenant.number}): ${tenant.postalCode || 'inget postnummer'} -> 37141`);
    
    const updated = await updateTenant(tenant.id, { postalCode: '37141' });
    if (updated) updatedTenants++;
  }
  
  console.log(`\nUppdateringen klar!`);
  console.log(`Totalt uppdaterade: ${updatedApartments} lägenheter och ${updatedTenants} hyresgäster.`);
}

// Kör skriptet
console.log('Startar skriptet för att uppdatera Valhallavägen-postnummer...');
updateValhallaAddresses()
  .then(() => console.log('Skriptet slutfört!'))
  .catch(error => console.error('Ett fel inträffade:', error)); 