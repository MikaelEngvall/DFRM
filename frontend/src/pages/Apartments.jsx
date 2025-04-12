import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import EmailModal from '../components/EmailModal';
import FormInput from '../components/FormInput';
import Title from '../components/Title';
import { PlusIcon, FunnelIcon, XMarkIcon, EnvelopeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { apartmentService, tenantService, keyService, emailService } from '../services';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import RelatedTasks from '../components/RelatedTasks';

// Definiera nyckeltyper
const keyTypes = [
  { value: 'D', label: 'Dörr (D)' },
  { value: 'P', label: 'Post (P)' },
  { value: 'T', label: 'Tvätt (T)' },
  { value: 'F', label: 'Förråd (F)' },
  { value: 'G', label: 'Garage (G)' },
  { value: 'HN', label: 'Huvudnyckel (HN)' },
  { value: 'Ö', label: 'Övrigt (Ö)' }
];

// Hjälpfunktion för att rendera nyckeltyp
const renderKeyType = (typeValue) => {
  const typeOption = keyTypes.find(t => t.value === typeValue);
  return typeOption ? typeOption.label : typeValue;
};

const Apartments = () => {
  const { t } = useLocale();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState(null);
  const [showOnlyVacant, setShowOnlyVacant] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSendSuccess, setEmailSendSuccess] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    number: '',
    apartmentNumber: '',
    postalCode: '',
    city: '',
    rooms: '',
    area: '',
    price: '',
    electricity: false,
    storage: false,
    internet: false,
    tenantIds: [],
    keyIds: [],
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all' eller 'vacant'
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    street: '',
    number: '',
    tenantId: ''
  });
  
  // Unika städer och gator för filter
  const uniqueCities = useMemo(() => {
    return [...new Set(apartments.map(apt => apt.city))].filter(Boolean).sort();
  }, [apartments]);
  
  const uniqueStreets = useMemo(() => {
    return [...new Set(apartments.map(apt => apt.street))].filter(Boolean).sort();
  }, [apartments]);

  // Samla e-postadresser från filtrerade hyresgäster
  const filteredTenantEmails = useMemo(() => {
    const emails = new Set();
    
    // Gå igenom alla filtrerade lägenheter
    filteredApartments.forEach(apartment => {
      // Kontrollera om lägenheten har hyresgäster
      if (apartment.tenants && Array.isArray(apartment.tenants) && apartment.tenants.length > 0) {
        // Hitta detaljerad information för varje hyresgäst
        apartment.tenants.forEach(tenantRef => {
          // Tenant kan vara antingen en sträng (ID) eller ett objekt med ID-fält
          const tenantId = typeof tenantRef === 'object' ? tenantRef.id : tenantRef;
          
          // Hitta hyresgästen i tenants-listan
          const tenant = tenants.find(t => t.id === tenantId);
          
          // Om hyresgästen hittades och har en e-postadress, lägg till den
          if (tenant && tenant.email) {
            emails.add(tenant.email);

          }
        });
      } else {
        console.log(` - Inga hyresgäster`);
      }
    });
    
    // Konvertera Set till Array
    const emailArray = Array.from(emails);
    return emailArray;
  }, [filteredApartments, tenants]);
  
  // Hantera e-postutskick
  const handleSendEmail = async (subject, content, recipients) => {
    try {
      console.log(`Apartments.jsx handleSendEmail: initierar utskick till ${recipients.length} mottagare`);
      
      // Visa de första mottagarna för felsökning (max 3)
      if (recipients.length > 0) {
        console.log("Exempel på mottagare:", 
          recipients.slice(0, Math.min(3, recipients.length)).join(", ") + 
          (recipients.length > 3 ? ` och ${recipients.length - 3} fler...` : ""));
      }
      
      const result = await emailService.sendBulkEmail(subject, content, recipients);
      console.log("E-post resultat:", result);
      
      setEmailSendSuccess(true);
      // Visa bekräftelsemeddelande i 3 sekunder
      setTimeout(() => setEmailSendSuccess(false), 3000);
      
      // Om det var delvis framgång, visa ett meddelande
      if (result && result.partialSuccess) {
        alert(t('email.partialSuccess', { 
          sent: result.recipientCount || 0, 
          total: recipients.length 
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      const errorMessage = error.message || t('email.errors.sendFailed');
      alert(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Kolumner för datatabellen
  const columns = [
    {
      key: 'address',
      label: `${t('apartments.fields.street')} / ${t('apartments.fields.apartmentNumber')}`,
      render: (_, apartment) => (
        <>
          {apartment.street} {apartment.number}, {apartment.apartmentNumber}
          <br />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {apartment.postalCode} {apartment.city}
          </span>
        </>
      ),
    },
    {
      key: 'details',
      label: `${t('apartments.fields.rooms')} / ${t('apartments.fields.area')}`,
      render: (_, apartment) => (
        <>
          {apartment.rooms} {t('common.rooms')} · {apartment.area} m²
          <br />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {apartment.price} kr/mån
          </span>
        </>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (_, apartment) => isApartmentVacant(apartment) ? (
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-green-100 bg-green-600 dark:bg-green-700 rounded-full">
          {t('apartments.isVacant')}
        </span>
      ) : (
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 dark:bg-red-700 rounded-full">
          {t('apartments.isOccupied')}
        </span>
      ),
    },
    {
      key: 'tenants',
      label: t('apartments.fields.tenants'),
      render: (tenantIds, apartment) => {
        // Om tenants inte finns eller är en tom array
        if (!apartment.tenants || (Array.isArray(apartment.tenants) && apartment.tenants.length === 0)) {
          return <span className="text-gray-400 dark:text-gray-500">{t('apartments.fields.noTenant')}</span>;
        }
        
        // Om tenants är en array, skapa lista över hyresgäster
        if (Array.isArray(apartment.tenants)) {
          // Filtrera bort ogiltiga hyresgäster
          const validTenants = apartment.tenants.filter(tenant => 
            tenant && (typeof tenant === 'string' || tenant.id)
          );
          
          if (validTenants.length === 0) {
            return <span className="text-gray-400 dark:text-gray-500">{t('apartments.fields.noTenant')}</span>;
          }
          
          // Skapa en lista över hyresgäster
          return (
            <div className="space-y-1">
              {validTenants.map((tenant, index) => {
                const tenantObj = typeof tenant === 'string' 
                  ? tenants.find(t => t.id === tenant) 
                  : tenant;
                
                if (!tenantObj) return null;
                
                return (
                  <div key={index} className="flex items-center">
                    <span className="text-sm">
                      {tenantObj.firstName} {tenantObj.lastName}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }
        
        // Om tenants är ett objekt, visa den enskilda hyresgästen
        if (typeof apartment.tenants === 'object' && apartment.tenants.id) {
          return (
            <div className="flex items-center">
              <span>{apartment.tenants.firstName} {apartment.tenants.lastName}</span>
            </div>
          );
        }
        
        return <span className="text-gray-400 dark:text-gray-500">{t('apartments.fields.noTenant')}</span>;
      }
    },
    {
      key: 'keys',
      label: t('apartments.fields.keys'),
      render: (keysValue, apartment) => {
        // Om keys inte finns eller är en tom array
        if (!keysValue || (Array.isArray(keysValue) && keysValue.length === 0)) {
          return <span className="text-gray-400 dark:text-gray-500">{t('apartments.fields.noKey')}</span>;
        }
        
        // Om keys är en array, räkna antalet nycklar
        if (Array.isArray(keysValue)) {
          // Filtrera bort ogiltiga nycklar
          const validKeys = keysValue.filter(key => key && (typeof key === 'string' || key.id));
          
          if (validKeys.length === 0) {
            return <span className="text-gray-400 dark:text-gray-500">{t('apartments.fields.noKey')}</span>;
          }
          
          // Räkna antalet typer (unique serie-number kombinationer)
          const keyTypes = new Set();
          
          // För fullständiga nyckelobjekt (där vi har tillgång till alla egenskaper)
          const fullKeyObjects = validKeys.filter(key => typeof key === 'object' && key.id && key.serie && key.number);
          
          // För nyckel-IDs, hämta motsvarande objekt från keys-listan
          const keyIdsWithObjects = validKeys
            .filter(key => typeof key === 'string')
            .map(keyId => keys.find(k => k.id === keyId))
            .filter(Boolean);
          
          // Kombinera alla giltiga nyckelobjekt
          const allKeyObjects = [...fullKeyObjects, ...keyIdsWithObjects];
          
          // Räkna typer
          allKeyObjects.forEach(key => {
            keyTypes.add(`${key.type}-${key.serie}-${key.number}`);
          });
          
          // Räkna det faktiska antalet nycklar baserat på kopienummer
          let totalKeyCount = 0;
          
          allKeyObjects.forEach(key => {
            if (key.copyNumber) {
              // Om copyNumber representerar ett antal (t.ex. "3") eller en lista (t.ex. "L1,L2,L3")
              if (key.copyNumber.includes(',')) {
                // Räkna antalet separata kopior om flera är listade
                totalKeyCount += key.copyNumber.split(',').length;
              } else if (key.copyNumber.match(/^L\d+$/)) {
                // Om copyNumber är på formen "L1", "L2" etc. räknar vi det som 1 nyckel
                totalKeyCount += 1;
              } else if (!isNaN(key.copyNumber)) {
                // Om copyNumber är ett nummer, t.ex. "3", representerar det antalet kopior
                totalKeyCount += parseInt(key.copyNumber, 10);
              } else {
                // Annars räknar vi det som en nyckel
                totalKeyCount += 1;
              }
            } else {
              // Om ingen copyNumber angetts, antar vi att det är 1 nyckel
              totalKeyCount += 1;
            }
          });
          
          // Om vi inte kunde beräkna antalet (inga kopienummer finns), använd antal typer
          if (totalKeyCount === 0) {
            totalKeyCount = allKeyObjects.length;
          }
          
          // Visa både totala antalet nycklar och antalet typer
          return (
            <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {totalKeyCount}{keyTypes.size > 0 ? `(${keyTypes.size})` : ''}
            </span>
          );
        }
        
        return '-';
      }
    },
  ];

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchInitialData();
    
    // Kontrollera om vi bör visa bara lediga lägenheter från URL-parametrar
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam === 'vacant') {
      setShowOnlyVacant(true);
      setActiveTab('vacant');
    }
  }, [location.search]);

  // Applicera filter när de ändras eller när data ändras
  useEffect(() => {
    if (activeTab === 'vacant') {
      setFilteredApartments(getVacantApartments(apartments));
    } else {
      applyFilters();
    }
  }, [activeTab, filters, apartments]);

  const fetchInitialData = async (bypassCache = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Hämta alla apartments och tenants
      const [apartmentsData, tenantsData, keysData] = await Promise.all([
        apartmentService.getAllApartments(bypassCache),
        tenantService.getAllTenants(bypassCache),
        keyService.getAllKeys(bypassCache)
      ]);
      
      // Transformera data för att säkerställa korrekt presentation
      const enhancedApartments = apartmentsData.map(apartment => {
        // Säkerställ att tenants-listan är ett giltigt array
        const tenantsList = apartment.tenants || [];
        
        // Expandera tenant-referenserna med faktiska hyresgästobjekt
        const enhancedTenants = tenantsList.map(tenantRef => {
          if (typeof tenantRef === 'string') {
            // Om vi bara har tenant-ID, hämta fullständig tenant från tenantsData
            const fullTenant = tenantsData.find(t => t.id === tenantRef);
            return fullTenant || { id: tenantRef };
          }
          return tenantRef;
        }).filter(Boolean); // Filtrera bort eventuella null/undefined
        
        return {
          ...apartment,
          tenants: enhancedTenants
        };
      });
      
      setApartments(enhancedApartments);
      setTenants(tenantsData);
      setKeys(keysData);
      setFilteredApartments(enhancedApartments);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`${t('common.fetchError')}: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Specialhantering för flervalslista (select multiple)
    if (name === 'tenantIds' || name === 'keyIds') {
      if (type === 'select-multiple') {
        const selectedIds = Array.from(
          e.target.selectedOptions,
          option => option.value
        );
        setFormData(prev => ({
          ...prev,
          [name]: selectedIds
        }));
      }
    } else {
      // Vanlig hantering för övriga fält
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const applyFilters = () => {
    let result = [...apartments];
    
    // Filtrera baserat på stad
    if (filters.city) {
      result = result.filter(apartment => apartment.city === filters.city);
    }
    
    // Filtrera baserat på gata
    if (filters.street) {
      result = result.filter(apartment => apartment.street === filters.street);
    }
    
    // Filtrera baserat på nummer
    if (filters.number) {
      result = result.filter(apartment => apartment.number === filters.number);
    }
    
    // Filtrera baserat på hyresgäst
    if (filters.tenantId) {
      result = result.filter(apartment => {
        if (!apartment.tenants || !apartment.tenants.length) return false;
        
        // Kontrollera om hyresgästen finns i lägenheten
        return apartment.tenants.some(tenant => {
          const tenantId = typeof tenant === 'object' ? tenant.id : tenant;
          return tenantId === filters.tenantId;
        });
      });
    }
    
    setFilteredApartments(result);
  };
  
  const clearFilters = () => {
    setFilters({
      city: '',
      street: '',
      number: '',
      tenantId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Kopiera formData för att hantera kopplingar separat
      let { tenantIds, keyIds, ...apartmentData } = formData;
      
      // Rensa bort eventuella tomma strängar för nummer, rum, yta och pris
      apartmentData.number = apartmentData.number.trim();
      apartmentData.rooms = apartmentData.rooms ? parseInt(apartmentData.rooms, 10) : null;
      apartmentData.area = apartmentData.area ? parseFloat(apartmentData.area) : null;
      apartmentData.price = apartmentData.price ? parseFloat(apartmentData.price) : null;
      
      // Säkerställ att tenantIds och keyIds är arrays och inte innehåller dubbletter
      tenantIds = tenantIds || [];
      keyIds = keyIds || [];
      tenantIds = [...new Set(tenantIds)]; // Tar bort eventuella dubbletter med hjälp av Set
      keyIds = [...new Set(keyIds)];
      
      // Spara lägenhetsdata först
      let savedApartment;
      let updateOperations = [];
      
      if (selectedApartment) {
        // För en befintlig lägenhet, hitta fält som faktiskt har ändrats
        const changedFields = Object.entries(apartmentData).reduce((acc, [key, value]) => {
          // Ignorera fält som inte har ändrats
          if (selectedApartment[key] !== value) {
            acc[key] = value;
          }
          return acc;
        }, {});
        
        if (Object.keys(changedFields).length > 0) {
          // Använd PATCH för att bara uppdatera ändrade fält
          savedApartment = await apartmentService.patchApartment(selectedApartment.id, changedFields);
        } else {
          // Om inga fält ändrades, använd den befintliga lägenheten
          savedApartment = selectedApartment;
        }
        
        // Hantera relationer (hyresgäster och nycklar) för befintlig lägenhet
        const currentTenantIds = Array.isArray(selectedApartment.tenants) 
          ? selectedApartment.tenants.map(t => typeof t === 'object' ? t.id : t).filter(Boolean)
          : [];
        
        const currentKeyIds = Array.isArray(selectedApartment.keys)
          ? selectedApartment.keys.map(k => typeof k === 'object' ? k.id : k).filter(Boolean)
          : [];
        
        // Kontrollera om hyresgästlistan har ändrats
        const tenantListChanged = JSON.stringify(currentTenantIds.sort()) !== JSON.stringify(tenantIds.sort());
        
        if (tenantListChanged) {
          // Istället för att ta bort och lägga till hyresgäster en och en, 
          // uppdatera hela listan på en gång med en PATCH-operation
          updateOperations.push(
            apartmentService.patchApartment(savedApartment.id, { tenants: tenantIds })
          );
        }
        
        // Nycklar att lägga till (finns i keyIds men inte i currentKeyIds)
        const keysToAdd = keyIds.filter(id => !currentKeyIds.includes(id));
        
        // Nycklar att ta bort (finns i currentKeyIds men inte i keyIds)
        const keysToRemove = currentKeyIds.filter(id => !keyIds.includes(id));
        
        // Lägg till uppdateringsoperationer för nycklar
        for (const id of keysToAdd) {
          updateOperations.push(apartmentService.assignKey(savedApartment.id, id));
        }
        
        // Lägg till uppdateringsoperationer för nycklar att ta bort
        for (const id of keysToRemove) {
          updateOperations.push(apartmentService.removeKey(savedApartment.id, id));
        }
      } else {
        // För en ny lägenhet, skapa den först
        // Säkerställ att tenants och keys är null när de saknas (istället för att utesluta dem)
        apartmentData.tenants = null;
        apartmentData.keys = null;
        
        try {
          // Prova först att använda apartmentService
          savedApartment = await apartmentService.createApartment(apartmentData);
          
          // Om det inte fungerade, prova direkt fetch
          if (!savedApartment || !savedApartment.id) {
            
            // Skapa ett alternativt fetch-anrop för att testa
            try {
              const token = localStorage.getItem('auth_token');
              const fetchResponse = await fetch('http://localhost:8080/api/apartments', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  street: apartmentData.street,
                  number: apartmentData.number,
                  apartmentNumber: apartmentData.apartmentNumber,
                  postalCode: apartmentData.postalCode,
                  city: apartmentData.city,
                  rooms: typeof apartmentData.rooms === 'number' ? apartmentData.rooms : parseInt(apartmentData.rooms, 10),
                  area: typeof apartmentData.area === 'number' ? apartmentData.area : parseFloat(apartmentData.area),
                  price: typeof apartmentData.price === 'number' ? apartmentData.price : parseFloat(apartmentData.price),
                  electricity: apartmentData.electricity,
                  storage: apartmentData.storage,
                  internet: apartmentData.internet,
                  tenants: null,
                  keys: null
                })
              });
              
              if (fetchResponse.ok) {
                const fetchData = await fetchResponse.json();
                
                if (!savedApartment) {
                  savedApartment = fetchData;
                }
              } else {
                console.error('❌ FETCH MISSLYCKADES:', fetchResponse.status, fetchResponse.statusText);
              }
            } catch (fetchError) {
              console.error('❌ FEL VID FETCH-ANROP:', fetchError);
            }
          }
        } catch (error) {
          console.error('❌ FEL VID SKAPANDE AV LÄGENHET:', error);
          throw error;
        }
        
        // Om det finns hyresgäster att lägga till, uppdatera lägenheten med alla hyresgäster på en gång
        if (tenantIds.length > 0) {
          updateOperations.push(
            apartmentService.patchApartment(savedApartment.id, { tenants: tenantIds })
          );
        }
        
        // Lägg till nycklar till ny lägenhet
        for (const id of keyIds) {
          updateOperations.push(apartmentService.assignKey(savedApartment.id, id));
        }
      }
      
      // Utför alla uppdateringsoperationer parallellt
      if (updateOperations.length > 0) {
        await Promise.all(updateOperations);
      }
      
      // Uppdatera data efter sparande
      // Lägg till en kort timeout för att säkerställa att servern hunnit behandla alla ändringar
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchInitialData();
      
      setIsModalOpen(false);
      setSelectedApartment(null);
      setFormData({
        street: '',
        number: '',
        apartmentNumber: '',
        postalCode: '',
        city: '',
        rooms: '',
        area: '',
        price: '',
        electricity: false,
        storage: false,
        internet: false,
        tenantIds: [],
        keyIds: [],
      });
    } catch (err) {
      console.error('❌ FEL VID SPARANDE AV LÄGENHET:', err);
      
      // Visa mer detaljerad felinformation 
      if (err.response) {
        console.error('❌ SERVERFEL:', err.response.status, err.response.data);
        setError(`${t('apartments.messages.saveError')} - ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.error('❌ INGET SVAR FRÅN SERVER:', err.request);
        setError(`${t('apartments.messages.saveError')} - Ingen respons från servern`);
      } else {
        console.error('❌ FELMEDDELANDE:', err.message);
        setError(`${t('apartments.messages.saveError')} - ${err.message}`);
      }
    }
  };

  const handleEdit = (apartment) => {
    // Säkerställ att apartment inte är null
    if (!apartment) {
      console.error('Försöker redigera null-lägenhet');
      return;
    }
    
    // Rensa upp dubletter i tenant arrays
    const cleanedApartment = cleanupDuplicateTenants(apartment);
    setSelectedApartment(cleanedApartment);
    
    // Extrahera tenant IDs från apartment.tenants
    let tenantIds = [];
    if (Array.isArray(cleanedApartment.tenants)) {
      tenantIds = cleanedApartment.tenants.map(tenant => {
        if (typeof tenant === 'object' && tenant && tenant.id) {
          return tenant.id;
        }
        return tenant;
      }).filter(Boolean);
    }
    
    // Ta bort dubbletter från tenant IDs
    tenantIds = [...new Set(tenantIds)];
    
    // Extrahera key IDs från apartment.keys
    let keyIds = [];
    if (Array.isArray(cleanedApartment.keys)) {
      keyIds = cleanedApartment.keys.map(key => {
        if (typeof key === 'object' && key && key.id) {
          return key.id;
        }
        return key;
      }).filter(Boolean);
    }
    
    setFormData({
      street: cleanedApartment.street || '',
      number: cleanedApartment.number || '',
      apartmentNumber: cleanedApartment.apartmentNumber || '',
      postalCode: cleanedApartment.postalCode || '',
      city: cleanedApartment.city || '',
      rooms: cleanedApartment.rooms || '',
      area: cleanedApartment.area || '',
      price: cleanedApartment.price || '',
      electricity: cleanedApartment.electricity || false,
      storage: cleanedApartment.storage || false,
      internet: cleanedApartment.internet || false,
      tenantIds: tenantIds,
      keyIds: keyIds,
    });
    
    setIsModalOpen(true);
  };

  const handleDelete = async (apartment) => {
    setApartmentToDelete(apartment);
    // Visa bekräftelsemodalen (utan att stänga redigeringsmodalen)
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await apartmentService.deleteApartment(apartmentToDelete.id);
      await fetchInitialData();
      // Stäng båda modalerna efter radering
      setIsModalOpen(false);
      setIsAlertOpen(false);
      setSelectedApartment(null);
      setApartmentToDelete(null);
      setFormData({
        street: '',
        number: '',
        apartmentNumber: '',
        postalCode: '',
        city: '',
        rooms: '',
        area: '',
        price: '',
        electricity: false,
        storage: false,
        internet: false,
        tenantIds: [],
        keyIds: [],
      });
    } catch (err) {
      setError(t('apartments.messages.deleteError'));
      console.error('Error deleting apartment:', err);
      // Behåll redigeringsmodalen öppen vid fel, stäng bara alertmodalen
      setIsAlertOpen(false);
      setApartmentToDelete(null);
    }
  };

  // Hjälpfunktion för att hitta lediga hyresgäster och nuvarande hyresgäster för en lägenhet
  const getAvailableTenants = (tenantList, selectedApartmentTenants = []) => {
    // Säkerställ att selectedApartmentTenants inte är null
    const safeSelectedApartmentTenants = selectedApartmentTenants || [];
    
    const selectedTenantIds = safeSelectedApartmentTenants
      .map(tenant => typeof tenant === 'object' && tenant ? tenant.id : tenant)
      .filter(Boolean);
    
    // Säkerställ att tenantList inte är null
    if (!tenantList) return [];
    
    return tenantList.filter(tenant => {
      if (!tenant) return false;
      
      // Hyresgäst har ingen lägenhet eller är redan kopplad till denna lägenhet
      const hasNoApartment = !tenant.apartment;
      const isAlreadyAssigned = selectedTenantIds.includes(tenant.id);
      return hasNoApartment || isAlreadyAssigned;
    });
  };

  // Hjälpfunktion för att avgöra om en lägenhet är ledig (inga hyresgäster)
  const isApartmentVacant = (apartment) => {
    if (!apartment.tenants) return true;
    if (Array.isArray(apartment.tenants) && apartment.tenants.length === 0) return true;
    if (Array.isArray(apartment.tenants)) {
      // Filtrera bort null/undefined värden
      const validTenants = apartment.tenants.filter(t => t);
      return validTenants.length === 0;
    }
    return false;
  };

  // Hjälpfunktion för att filtrera fram lediga lägenheter
  const getVacantApartments = (apartmentList) => {
    return apartmentList.filter(isApartmentVacant);
  };

  // Hjälpfunktion för att räkna antalet lediga lägenheter
  const countVacantApartments = (apartmentList) => {
    return getVacantApartments(apartmentList).length;
  };
  
  // Hjälpfunktion för att rensa bort dubletter från tenant arrays
  const cleanupDuplicateTenants = (apartment) => {
    if (!apartment || !apartment.tenants) return apartment;
    
    // Clona objektet för att inte ändra originalet
    const cleanedApartment = { ...apartment };
    
    if (Array.isArray(cleanedApartment.tenants)) {
      // Skapa en map för att spåra tenant ID:n vi redan har
      const seenIds = new Map();
      
      // Filtrera bort dubletter baserat på tenant ID
      cleanedApartment.tenants = cleanedApartment.tenants.filter(tenant => {
        if (!tenant) return false;
        
        const id = typeof tenant === 'string' ? tenant : tenant.id;
        if (!id) return false;
        
        // Om id:t redan setts, filtrera bort denna tenant
        if (seenIds.has(id)) return false;
        
        // Annars markera den som sedd och behåll den
        seenIds.set(id, true);
        return true;
      });
    }
    
    return cleanedApartment;
  };

  // Hantera export till SQL
  const handleExportToSql = async () => {
    try {
      setIsExporting(true);
      await apartmentService.exportToSql();
    } catch (error) {
      console.error('Fel vid export till SQL:', error);
      setError(`${t('apartments.exportError')}: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <Title level="h1">
          {activeTab === 'vacant' ? t('apartments.vacant') : t('apartments.title')}
        </Title>
        <div className="flex space-x-2">
          <button
            onClick={handleExportToSql}
            disabled={isExporting}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            {isExporting ? t('common.exporting') : t('common.export')}
          </button>
          
          {filteredTenantEmails.length > 0 && (
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              title={`${t('email.button')} (${filteredTenantEmails.length} ${t('email.recipients')})`}
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              {t('email.button')}
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            {t('common.filters')}
          </button>
          <button
            onClick={() => {
              setSelectedApartment(null);
              setFormData({
                street: '',
                number: '',
                apartmentNumber: '',
                postalCode: '',
                city: '',
                rooms: '',
                area: '',
                price: '',
                electricity: false,
                storage: false,
                internet: false,
                tenantIds: [],
                keyIds: [],
              });
              setIsModalOpen(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('apartments.addNew')}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('common.filters')}</h2>
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              {t('common.clear')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stad Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('apartments.fields.city')}
              </label>
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            {/* Gata Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('apartments.fields.street')}
              </label>
              <select
                name="street"
                value={filters.street}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                {uniqueStreets.map(street => (
                  <option key={street} value={street}>{street}</option>
                ))}
              </select>
            </div>
            
            {/* Nummer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('apartments.fields.number')}
              </label>
              <input
                type="text"
                name="number"
                value={filters.number}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            {/* Hyresgäst Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tenants.title')}
              </label>
              <select
                name="tenantId"
                value={filters.tenantId}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.firstName} {tenant.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredApartments.length} {t('apartments.filteredResults', { count: filteredApartments.length })}
            </div>
          </div>
        </div>
      )}

      <div className="flex mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-l-md ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('apartments.all')}
        </button>
        <button
          onClick={() => setActiveTab('vacant')}
          className={`px-4 py-2 text-sm font-medium rounded-r-md ${
            activeTab === 'vacant'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('apartments.vacant')} ({countVacantApartments(apartments)})
        </button>
      </div>

      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredApartments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApartment(null);
          setFormData({
            street: '',
            number: '',
            apartmentNumber: '',
            postalCode: '',
            city: '',
            rooms: '',
            area: '',
            price: '',
            electricity: false,
            storage: false,
            internet: false,
            tenantIds: [],
            keyIds: [],
          });
        }}
        title={selectedApartment ? t('apartments.edit') : t('apartments.addNew')}
        size="small"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ändra layout till 2 kolumner i en gemensam grid för korrekt tab-ordning */}
          <div className="grid grid-cols-2 gap-4">
            {/* Första raden */}
            <FormInput
              label={t('apartments.fields.street')}
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label={t('apartments.fields.number')}
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              required
            />
            
            {/* Andra raden */}
            <FormInput
              label={t('apartments.fields.apartmentNumber')}
              name="apartmentNumber"
              value={formData.apartmentNumber}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label={t('apartments.fields.postalCode')}
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              required
            />
            
            {/* Tredje raden */}
            <FormInput
              label={t('apartments.fields.city')}
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label={t('apartments.fields.rooms')}
              name="rooms"
              type="number"
              value={formData.rooms}
              onChange={handleInputChange}
              required
            />
            
            {/* Fjärde raden */}
            <FormInput
              label={t('apartments.fields.area')}
              name="area"
              type="number"
              value={formData.area}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label={t('apartments.fields.price')}
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Ändra från kolumn till rad */}
          <div className="flex flex-row gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="electricity"
                checked={formData.electricity}
                onChange={handleInputChange}
                className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:bg-gray-700"
              />
              <span className="ml-2 dark:text-gray-300">{t('apartments.fields.features.electricity')}</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="storage"
                checked={formData.storage}
                onChange={handleInputChange}
                className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:bg-gray-700"
              />
              <span className="ml-2 dark:text-gray-300">{t('apartments.fields.features.storage')}</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="internet"
                checked={formData.internet}
                onChange={handleInputChange}
                className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:bg-gray-700"
              />
              <span className="ml-2 dark:text-gray-300">{t('apartments.fields.features.internet')}</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('apartments.fields.tenants')}
              </label>
              <select
                multiple
                size="5"
                name="tenantIds"
                value={formData.tenantIds || []}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                {getAvailableTenants(tenants, selectedApartment?.tenants).map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {`${tenant.firstName} ${tenant.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('apartments.fields.keys')}
              </label>
              <select
                multiple
                size="5"
                name="keyIds"
                value={formData.keyIds || []}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                {keys.map((key) => (
                  <option key={key.id} value={key.id}>
                    {`${t(`keys.types.${key.type}`)} - ${key.serie}-${key.number}${key.copyNumber ? ' ' + key.copyNumber : ''}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between gap-4 mt-6">
            {selectedApartment && (
              <button
                type="button"
                onClick={() => handleDelete(selectedApartment)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                {t('common.delete')}
              </button>
            )}
            <div className="flex gap-4 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedApartment(null);
                  setFormData({
                    street: '',
                    number: '',
                    apartmentNumber: '',
                    postalCode: '',
                    city: '',
                    rooms: '',
                    area: '',
                    price: '',
                    electricity: false,
                    storage: false,
                    internet: false,
                    tenantIds: [],
                    keyIds: [],
                  });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary dark:bg-primary dark:hover:bg-secondary"
              >
                {selectedApartment ? t('common.saveChanges') : t('common.add')}
              </button>
            </div>
          </div>
        </form>

        {/* Visa RelatedTasks endast när vi redigerar en befintlig lägenhet */}
        {selectedApartment && selectedApartment.id && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <RelatedTasks entityType="apartment" entityId={selectedApartment.id} />
          </div>
        )}
      </Modal>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={confirmDelete}
        title={t('apartments.confirmDelete')}
        message={apartmentToDelete ? t('apartments.deleteMessage', { 
          street: apartmentToDelete.street, 
          number: apartmentToDelete.number, 
          apartmentNumber: apartmentToDelete.apartmentNumber 
        }) : ''}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      {/* E-post-modal */}
      <EmailModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSend={handleSendEmail}
        recipients={filteredTenantEmails}
      />
    </div>
  );
};

export default Apartments; 