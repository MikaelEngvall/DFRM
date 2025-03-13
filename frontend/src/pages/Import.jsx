import React, { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
// Behöver importera xlsx-biblioteket för att hantera Excel-filer
import * as XLSX from 'xlsx';
import api from '../services/api';
import axios from 'axios';

// Enkel uppslagstabell för vanliga adresser i Karlskrona
const POSTAL_CODE_LOOKUP = {
  // Format: 'gata nummer ort': 'postnummer'
  'utridarevägen 3 karlskrona': '37156',
  'storgatan 1 karlskrona': '37123',
  'ronnebygatan 2 karlskrona': '37132',
  'landbrogatan 5 karlskrona': '37134',
  'östra köpmansgatan 2 karlskrona': '37138',
  'norra smedjegatan 8 karlskrona': '37133',
  'arklimästaregatan 32 karlskrona': '37138',
  'hantverkaregatan 15 karlskrona': '37135',
  'drottninggatan 54 karlskrona': '37138',
  'vallgatan 22 karlskrona': '37140',
  'styrmangatan 1 karlskrona': '37138',
  'v. prinsgatan 1 karlskrona': '37131',
  'valhallavägen 1 karlskrona': '37141',
  // Ronneby gator
  'kungsgatan 1 ronneby': '37230',
  'hagagatan 5 ronneby': '37235',
  'gångbrogatan 13 ronneby': '37237',
  'tingsgatan 9 ronneby': '37234',
  // Lägg till fler populära gator och nummer
  'ronnebygatan': '37132', // Standardpostnummer för hela gatan
  'storgatan': '37123',
  'drottninggatan': '37138',
  'landbrogatan': '37134',
  'östra köpmansgatan': '37138',
  'norra smedjegatan': '37133',
  'vallgatan': '37140',
  'hantverkaregatan': '37135',
  'utridarevägen': '37156',
  'arklimästaregatan': '37138',
  'styrmangatan': '37138',
  'v. prinsgatan': '37131',
  'valhallavägen': '37141',
  // Standardpostnummer för Ronneby gator
  'kungsgatan': '37230',
  'hagagatan': '37235',
  'gångbrogatan': '37237',
  'tingsgatan': '37234'
};

// Förenklad hjälpfunktion för att hämta postnummer utan Google Maps API
const getPostalCode = (street, number, city) => {
  try {
    // Normalisera input
    const streetLower = street.toLowerCase();
    const numberLower = number.toLowerCase();
    const cityLower = city.toLowerCase();
    
    // SPECIALFALL: Kontrollera Valhallavägen först (högsta prioritet)
    if (streetLower.includes('valhallavägen')) {
      console.log(`Hittade Valhallavägen, returnerar alltid postnummer 37141`);
      return '37141';
    }
    
    // Försök med exakt matchning först
    const exactKey = `${streetLower} ${numberLower} ${cityLower}`;
    if (POSTAL_CODE_LOOKUP[exactKey]) {
      console.log(`Hittade postnummer ${POSTAL_CODE_LOOKUP[exactKey]} för exakt adress: ${exactKey}`);
      return POSTAL_CODE_LOOKUP[exactKey];
    }
    
    // Använd gatans standardvärde om det finns
    if (POSTAL_CODE_LOOKUP[streetLower]) {
      console.log(`Hittade postnummer ${POSTAL_CODE_LOOKUP[streetLower]} för gata: ${streetLower}`);
      return POSTAL_CODE_LOOKUP[streetLower];
    }
    
    // Matcha på olika sätt baserat på gatunamn och stad
    // Karlskrona gator
    if (cityLower === 'karlskrona') {
      switch (streetLower) {
        case 'ronnebygatan':
          return '37132';
        case 'storgatan':
          return '37123';
        case 'drottninggatan':
          return '37138';
        case 'landbrogatan':
          return '37134';
        case 'östra köpmansgatan':
          return '37138';
        case 'norra smedjegatan':
          return '37133';
        case 'vallgatan':
          return '37140';
        case 'hantverkaregatan':
          return '37135';
        case 'utridarevägen':
          return '37156';
        case 'arklimästaregatan':
          return '37138';
        case 'styrmangatan':
          return '37138';
        case 'v. prinsgatan':
          return '37131';
        case 'valhallavägen':
          return '37141';
        default:
          // Standardvärde för Karlskrona om inget annat hittas
          console.log(`Kunde inte hitta postnummer för ${street} ${number}, ${city}, använder standardvärde för Karlskrona`);
          return '37100';
      }
    } 
    // Ronneby gator
    else if (cityLower === 'ronneby') {
      switch (streetLower) {
        case 'kungsgatan':
          return '37230';
        case 'hagagatan':
          return '37235';
        case 'gångbrogatan':
          return '37237';
        case 'tingsgatan':
          return '37234';
        default:
          // Standardvärde för Ronneby om inget annat hittas
          console.log(`Kunde inte hitta postnummer för ${street} ${number}, ${city}, använder standardvärde för Ronneby`);
          return '37200';
      }
    }
    // Om ingen matchning på stad, använd postnummer baserat på gata
    else {
      // Kolla om det är en Ronneby-gata oavsett angiven stad
      if (['kungsgatan', 'hagagatan', 'gångbrogatan', 'tingsgatan'].includes(streetLower)) {
        switch (streetLower) {
          case 'kungsgatan':
            return '37230';
          case 'hagagatan':
            return '37235';
          case 'gångbrogatan':
            return '37237';
          case 'tingsgatan':
            return '37234';
          default:
            break;
        }
      }
      
      // Standardvärde om inget annat passar
      console.log(`Kunde inte hitta postnummer för ${street} ${number}, ${city}, använder standardvärde`);
      return '37100';
    }
  } catch (error) {
    console.error('Fel vid hämtning av postnummer:', error);
    // Standardvärde om något gick fel
    return '37100';
  }
};

const Import = () => {
  const { t } = useLocale();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [xlsxLoaded, setXlsxLoaded] = useState(false);

  // Dynamiskt ladda xlsx-biblioteket om det inte finns
  useEffect(() => {
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      script.async = true;
      script.onload = () => setXlsxLoaded(true);
      document.body.appendChild(script);
    } else {
      setXlsxLoaded(true);
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(false);
    setImportResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError(t('import.errors.noFile'));
      return;
    }

    // Kontrollera att xlsx-biblioteket är laddat
    if (!window.XLSX && !xlsxLoaded) {
      setError('Excel-biblioteket laddas fortfarande. Vänta några sekunder och försök igen.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Läs filen som en binär Excel-fil istället för textfil
      const data = await readExcelFile(file);
      
      // Konvertera Excel-data till vårt format
      const processedData = await processExcelData(data);
      
      if (processedData.tenants.length === 0 || processedData.apartments.length === 0) {
        throw new Error('Inga giltiga rader hittades i filen.');
      }
      
      console.log('Försöker importera', processedData.tenants.length, 'hyresgäster och', 
                 processedData.apartments.length, 'lägenheter till databasen');
      
      // Kontrollera att användaren har en giltig token
      const token = localStorage.getItem('auth_token');
      console.log('Token finns:', !!token);
      
      // Skapa apartments och tenants och koppla dem till varandra
      const createdApartments = [];
      const createdTenants = [];
      const errors = [];
      
      // Loopar igenom alla rader och skapar lägenhet och hyresgäst för varje rad
      for (let i = 0; i < processedData.tenants.length; i++) {
        try {
          const tenant = processedData.tenants[i];
          const apartment = processedData.apartments[i];
          
          console.log(`Bearbetar rad ${i+1}: ${tenant.firstName} ${tenant.lastName}, lägenhet ${apartment.apartmentNumber}`);
          
          // STEG 1: Skapa lägenhet först (inga relation-fält)
          const apartmentData = {
            street: apartment.street,
            number: apartment.number,
            apartmentNumber: apartment.apartmentNumber,
            postalCode: apartment.postalCode || "",
            city: apartment.city,
            rooms: apartment.rooms || 1,
            area: apartment.area || 50,
            price: apartment.price || 5000,
            electricity: false,
            storage: true,
            internet: false
          };

          console.log('Skapar lägenhet:', { 
            apartmentNumber: apartmentData.apartmentNumber,
            street: apartmentData.street
          });
          
          // Skapa lägenheten i databasen
          const apartmentResponse = await api.post('/api/apartments', apartmentData);
          const createdApartment = apartmentResponse.data;
          createdApartments.push(createdApartment);
          console.log(`Lägenhet skapad med ID: ${createdApartment.id}`);
          
          // STEG 2: Skapa hyresgäst (utan apartment-fält)
          const tenantData = {
            firstName: tenant.firstName || `Hyresgäst${i + 1}`,
            lastName: tenant.lastName || `Efternamn${i + 1}`,
            email: tenant.email || `hyresgast${i + 1}@example.com`,
            phone: tenant.phone || '',
            personnummer: '8001010011',
            street: tenant.street || 'Storgatan',
            number: tenant.number || '1',
            postalCode: tenant.postalCode || '',
            city: tenant.city || 'Karlskrona',
            movedInDate: tenant.movedInDate || '2023-01-01'
            // OBS: INTE apartment-fält här!
          };
          
          console.log('Skapar hyresgäst:', { 
            namn: `${tenantData.firstName} ${tenantData.lastName}`
          });
          
          // Skapa hyresgästen utan apartment-koppling
          const tenantResponse = await api.post('/api/tenants', tenantData);
          const createdTenant = tenantResponse.data;
          createdTenants.push(createdTenant);
          console.log(`Hyresgäst skapad med ID: ${createdTenant.id}`);
          
          // STEG 3: Använd det SPECIELLA APARTMENT-API:ET för att koppla lägenhet till hyresgäst
          // Detta är nyckeln! Backend har ett speciellt API för att tilldela lägenhet, TenantController.assignApartment
          console.log(`Kopplar hyresgäst ${createdTenant.id} till lägenhet ${createdApartment.id} med KORREKT API-anrop`);
          
          try {
            // Använd PUT till den särskilda apartment-endpointen med apartmentId som query parameter
            const assignResponse = await api.put(
              `/api/tenants/${createdTenant.id}/apartment?apartmentId=${createdApartment.id}`
            );
            
            if (assignResponse.status === 200) {
              console.log(`✓✓✓ FRAMGÅNG: Hyresgäst kopplad till lägenhet med specialanrop!`);
              // Kontrollera resultatet
              const updatedTenant = assignResponse.data;
              console.log('Uppdaterad hyresgäst från API:', updatedTenant);
              
              // Verifiera att apartment-fältet faktiskt sattes korrekt
              if (updatedTenant.apartment === createdApartment.id) {
                console.log(`Apartment-fält bekräftat!`);
              } else {
                console.warn(`Apartment-fält verkar vara i ett annat format:`, updatedTenant.apartment);
              }
            } else {
              console.error(`❌ Misslyckades med att koppla hyresgäst till lägenhet via specialanrop: ${assignResponse.status}`);
            }
          } catch (assignError) {
            console.error('Fel vid koppling av hyresgäst till lägenhet:', assignError.message);
          }
          
          // Rapportera framsteg var 10:e rad
          if ((i + 1) % 10 === 0 || i === processedData.tenants.length - 1) {
            console.log(`Framsteg: ${i + 1} av ${processedData.tenants.length} (${Math.round((i + 1) / processedData.tenants.length * 100)}%)`);
          }
          
        } catch (error) {
          console.error(`Fel vid import av rad ${i+1}:`, error);
          errors.push(`Rad ${i+1}: ${error.message}`);
          
          // Fortsätt med nästa rad även om denna misslyckades
          continue;
        }
      }
      
      const responseData = {
        tenantsCreated: createdTenants.length,
        apartmentsCreated: createdApartments.length,
        errors: errors
      };
      
      console.log('Import slutförd:', responseData);
      
      setSuccess(true);
      setImportResult(responseData);
      setFile(null);
      // Återställ fil-input
      e.target.reset();
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || t('import.errors.uploadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Hjälpfunktion för att läsa Excel-filer
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData);
        } catch (err) {
          console.error('Fel vid läsning av Excel-fil:', err);
          reject(new Error('Kunde inte tolka Excel-filen. Kontrollera filformatet.'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Bearbeta Excel-data till vårt format
  const processExcelData = async (rows) => {
    console.log('Excel-data (första raden):', rows[0]);
    
    // Hoppa över rubrikraden om den finns
    const dataRows = rows[0] && (String(rows[0][0]).toLowerCase().includes('name') || 
                     String(rows[0][0]).toLowerCase().includes('namn')) ? 
                     rows.slice(1) : rows;
    
    console.log(`Antal rader i data: ${dataRows.length}`);
    
    const result = {
      tenants: [],
      apartments: []
    };
    
    // Använd Promise.all för att göra alla postnummeruppslag parallellt
    await Promise.all(dataRows.map(async (row, index) => {
      if (!row || row.length === 0) {
        console.log(`Rad ${index + 1} är tom, hoppar över.`);
        return; // Hoppa över tomma rader
      }
      
      console.log(`Rad ${index + 1} har ${row.length} kolumner:`, row.slice(0, 3));
      
      if (row.length < 5) {
        console.warn(`Rad ${index + 1} har för få kolumner (${row.length}), hoppar över.`);
        return;
      }
      
      try {
        // Kolumn A: Namn (förnamn efternamn)
        const fullName = row[0] ? String(row[0]) : '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Kolumn B: E-post
        const email = row[1] ? String(row[1]) : '';
        
        // Kolumn C: Telefon
        const phone = row[2] ? String(row[2]) : '';
        
        // Kolumn D: Lägenhetsinformation (ex: "Lgh 1001/1")
        const apartmentInfo = row[3] ? String(row[3]) : '';
        let apartmentNumber = '';
        if (apartmentInfo.includes('/')) {
          const parts = apartmentInfo.split('/');
          apartmentNumber = parts[0].includes('Lgh') ? parts[0].replace(/Lgh\s*/i, '').trim() : parts[0].trim();
        } else if (apartmentInfo.toLowerCase().includes('lgh')) {
          apartmentNumber = apartmentInfo.toLowerCase().replace(/lgh\s*/i, '').trim();
        } else {
          apartmentNumber = apartmentInfo;
        }
        
        // Kolumn E: Adress (ex: "Storgatan 5")
        const addressInfo = row[4] ? String(row[4]) : '';
        
        // Korrigera uppdelningen av gata och nummer
        // Hitta det första ordet (gatan) och resten är numret
        const addressMatch = addressInfo.match(/^(\S+)\s+(.+)$/);
        let street = addressInfo;
        let number = '1';
        
        if (addressMatch) {
          street = addressMatch[1]; // Första ordet blir gatan
          number = addressMatch[2]; // Resten blir numret
        }
        
        // Bestäm stad baserat på gata
        let city = 'Karlskrona'; // Standard är Karlskrona
        
        // Kontrollera om det är en Ronneby-gata
        const streetLower = street.toLowerCase();
        if (['kungsgatan', 'hagagatan', 'gångbrogatan', 'tingsgatan'].includes(streetLower)) {
          city = 'Ronneby'; // Sätt ort till Ronneby för specifika gator
          console.log(`Gatan ${street} är i Ronneby, ändrar ort från Karlskrona till Ronneby`);
        }
        
        // Hämta postnummer baserat på adressuppgifter
        const postalCode = getPostalCode(street, number, city);
        console.log(`Använder postnummer för ${street} ${number}, ${city}: ${postalCode}`);
        
        // Kolumn F: Yta (kvm)
        const area = row[5] ? parseFloat(row[5]) || 0 : 0;
        
        // Kolumn H: Inflyttningsdatum
        const moveInDateRaw = row[7] ? String(row[7]) : '';
        let moveInDate = '';
        if (moveInDateRaw) {
          try {
            // För Excel-datum (som kan vara seriella nummer)
            let dateObj;
            if (typeof row[7] === 'number') {
              // Excel lagrar datum som dagar sedan 1900-01-01
              dateObj = new Date(Date.UTC(1900, 0, row[7] - 1));
            } else if (moveInDateRaw.includes('.') || moveInDateRaw.includes('/')) {
              const parts = moveInDateRaw.split(/[.\/]/);
              if (parts.length === 3) {
                // Anta formatet dd.mm.yyyy
                dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
              } else {
                dateObj = new Date(moveInDateRaw);
              }
            } else {
              dateObj = new Date(moveInDateRaw);
            }
            
            if (!isNaN(dateObj.getTime())) {
              moveInDate = dateObj.toISOString().split('T')[0];
            } else {
              console.warn(`Ogiltigt datum '${moveInDateRaw}' för rad ${index + 1}`);
              moveInDate = '';
            }
          } catch (e) {
            console.warn(`Kunde inte formatera datum '${moveInDateRaw}' för rad ${index + 1}: ${e.message}`);
            moveInDate = '';
          }
        }
        
        // Kolumn K: Hyra (kr/mån)
        // Säkerställ att hyran konverteras korrekt till ett flyttal
        let rent = 0;
        if (row[10] !== undefined && row[10] !== null) {
          // Om det är ett nummer direkt, använd det
          if (typeof row[10] === 'number') {
            rent = row[10];
          } else {
            // Annars konvertera strängen, ta bort eventuella icke-numeriska tecken
            const rentString = String(row[10]).replace(/[^\d.,]/g, '').replace(',', '.');
            rent = parseFloat(rentString) || 0;
          }
        }
        
        // Generera ett unikt appartment-nummer om det saknas
        if (!apartmentNumber) {
          apartmentNumber = `A${index + 100}`;
          console.log(`Genererade lägenhetsnummer ${apartmentNumber} för rad ${index + 1}`);
        }
        
        // Skapa tenant-objekt - OBS! apartment ska INTE sättas här, det sätts senare till lägenhetens ID
        const tenant = {
          firstName: firstName || `Hyresgäst${index + 1}`,
          lastName: lastName || `Efternamn${index + 1}`,
          email: email || `hyresgast${index + 1}@example.com`,
          phone: phone || '',
          personnummer: '8001010011',  // Standardvärde
          street: street || 'Storgatan',
          number: number || '1',
          postalCode: postalCode || '',  // Använd det hämtade postnumret
          city: city,                    // Använd den bestämda orten (Karlskrona eller Ronneby)
          movedInDate: moveInDate || '2023-01-01'
          // VIKTIGT: Ta bort apartment-fältet här, vi sätter det senare med rätt ID
        };
        
        // Skapa apartment-objekt
        const apartment = {
          street: street || 'Storgatan',
          number: number || '1',
          apartmentNumber: apartmentNumber,
          postalCode: postalCode || '',  // Använd det hämtade postnumret
          city: city,                    // Använd den bestämda orten (Karlskrona eller Ronneby)
          rooms: 1,                      // Standardvärde
          area: area || 50,              // Från kolumn F eller standardvärde
          price: rent || 5000,           // Från kolumn K eller standardvärde
          tenant: `${firstName} ${lastName}` || `Hyresgäst${index + 1} Efternamn${index + 1}`
        };
        
        console.log(`Skapad hyresgäst och lägenhet för rad ${index + 1}:`, {
          tenant: tenant.firstName + ' ' + tenant.lastName,
          apartment: apartment.apartmentNumber,
          postalCode: postalCode || 'Inget hittat',
          city: city
        });
        
        result.tenants.push(tenant);
        result.apartments.push(apartment);
      } catch (err) {
        console.error(`Fel vid bearbetning av rad ${index + 1}:`, err);
      }
    }));
    
    console.log(`Resultat: ${result.tenants.length} hyresgäster, ${result.apartments.length} lägenheter`);
    
    return result;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('import.title')}</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-lg mx-auto mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('import.selectFile')}
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary-dark
                dark:file:bg-primary-dark dark:hover:file:bg-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              Endast Excel-filer (.xlsx, .xls)
            </p>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 dark:text-green-400 text-sm">
              {t('import.success')}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md
              hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              dark:bg-primary-dark dark:hover:bg-primary"
          >
            {loading ? t('common.loading') : t('import.upload')}
          </button>
        </form>
      </div>

      {/* Resultatsektion */}
      {importResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-4">{t('import.results')}</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">{t('import.tenantsCreated')}:</span> {importResult.tenantsCreated || 0}
            </p>
            <p>
              <span className="font-medium">{t('import.apartmentsCreated')}:</span> {importResult.apartmentsCreated || 0}
            </p>
            {importResult.errors && importResult.errors.length > 0 && (
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">{t('import.errors.title')}:</p>
                <ul className="list-disc pl-5 text-sm text-red-600 dark:text-red-400">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informationssektion om Excel-format */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-lg mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-4">{t('import.instructions')}</h2>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Excelfilen ska ha följande kolumner:</p>
          <ul className="list-disc pl-5">
            <li><strong>Kolumn A:</strong> Namn (förnamn efternamn) - delas upp automatiskt</li>
            <li><strong>Kolumn B:</strong> E-postadress</li>
            <li><strong>Kolumn C:</strong> Telefonnummer</li>
            <li><strong>Kolumn D:</strong> Lägenhetsinformation (ex: "Lgh 1001/1") - lägenhetsnummer extraheras</li>
            <li><strong>Kolumn E:</strong> Adress (ex: "Storgatan 5") - delas upp i gata och nummer</li>
            <li><strong>Kolumn F:</strong> Yta (kvm)</li>
            <li><strong>Kolumn H:</strong> Inflyttningsdatum</li>
            <li><strong>Kolumn K:</strong> Hyra (kr/mån)</li>
          </ul>
          <p className="mt-2">Alla hyresgäster får automatiskt personnummer 8001010011 och ort sätts till Karlskrona.</p>
        </div>
      </div>
    </div>
  );
};

export default Import; 