import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { apartmentService, tenantService, keyService } from '../services';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState(null);
  const [showOnlyVacant, setShowOnlyVacant] = useState(false);
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

  const columns = [
    { key: 'street', label: 'Gata' },
    { key: 'number', label: 'Nummer' },
    { key: 'apartmentNumber', label: 'LGH' },
    { key: 'city', label: 'Stad' },
    { key: 'rooms', label: 'Rum' },
    { key: 'area', label: 'Yta (m²)' },
    { key: 'price', label: 'Hyra (kr)', render: (value) => `${value} kr` },
    { 
      key: 'status', 
      label: 'Status',
      render: (_, apartment) => isApartmentVacant(apartment) ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Ledig
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Uthyrd
        </span>
      )
    },
    {
      key: 'tenants',
      label: 'Hyresgäster',
      render: (tenantsValue, apartment) => {
        console.log('Rendering tenants column:', tenantsValue, apartment);
        
        if (!tenantsValue || (Array.isArray(tenantsValue) && tenantsValue.length === 0)) return '-';
        
        // Om tenants är en array av objekt eller ID-strängar
        if (Array.isArray(tenantsValue)) {
          return tenantsValue.map(tenant => {
            if (typeof tenant === 'string') {
              // Om tenant är ett ID, hitta motsvarande objekt
              const tenantObj = tenants.find(t => t.id === tenant);
              return tenantObj ? `${tenantObj.firstName} ${tenantObj.lastName}` : tenant;
            } else if (tenant && tenant.id) {
              // Om tenant är ett objekt
              return `${tenant.firstName} ${tenant.lastName}`;
            }
            return '';
          }).filter(Boolean).join(', ') || '-';
        }
        
        return '-';
      }
    },
    {
      key: 'keys',
      label: 'Nycklar',
      render: (keysValue, apartment) => {
        // Om keys inte finns eller är en tom array
        if (!keysValue || (Array.isArray(keysValue) && keysValue.length === 0)) return '0';
        
        // Om keys är en array, räkna antalet nycklar
        if (Array.isArray(keysValue)) {
          // Filtrera bort ogiltiga nycklar
          const validKeys = keysValue.filter(key => key && (typeof key === 'string' || key.id));
          
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
            <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {totalKeyCount}{keyTypes.size > 0 ? `(${keyTypes.size})` : ''}
            </span>
          );
        }
        
        return '0';
      }
    },
  ];

  useEffect(() => {
    fetchInitialData();
    
    // Kontrollera om filter=vacant finns i URL:en
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam === 'vacant') {
      setShowOnlyVacant(true);
    }
  }, [location.search]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [apartmentsData, tenantsData, keysData] = await Promise.all([
        apartmentService.getAllApartments(),
        tenantService.getAllTenants(),
        keyService.getAllKeys(),
      ]);
      
      console.log('Original apartments data:', apartmentsData);
      console.log('Original tenants data:', tenantsData);
      console.log('Original keys data:', keysData);
      
      // Processera lägenhetsdata för att säkerställa att vi har fullständiga references 
      // och rensa bort eventuella dubletter av hyresgäster
      const processedApartments = apartmentsData.map(apartment => {
        // Först processera lägenheten enligt normalt
        const processedApartment = { ...apartment };
        
        // Hantera tenant-relationen - kolla format och konvertera vid behov
        if (apartment.tenants) {
          console.log('Processing tenants for apartment:', apartment.id, apartment.tenants);
          
          if (Array.isArray(apartment.tenants)) {
            // I vissa fall kan tenants vara en array av ID-strängar eller objekt med ID
            const processedTenants = apartment.tenants.map(tenant => {
              if (typeof tenant === 'string') {
                // Om tenant är ett ID, hämta hela tenant-objektet
                return tenantsData.find(t => t.id === tenant) || tenant;
              } else if (tenant && tenant.id) {
                // Om tenant är ett objekt med ID
                return tenant;
              }
              return tenant; // Behåll oförändrad om okänt format
            });
            processedApartment.tenants = processedTenants;
          } else {
            // Om tenants inte är en array, men ändå existerar (okänt format)
            // Skapa en tom array
            processedApartment.tenants = [];
            console.warn('Unexpected tenants format for apartment:', apartment.id, apartment.tenants);
          }
        } else {
          // Om tenants saknas, skapa en tom array
          processedApartment.tenants = [];
        }
        
        // Rensa eventuella dubletter av hyresgäster
        const cleanedApartment = cleanupDuplicateTenants(processedApartment);
        
        // Hantera key-relationen - kolla format och konvertera vid behov
        if (apartment.keys) {
          console.log('Processing keys for apartment:', apartment.id, apartment.keys);
          
          if (Array.isArray(apartment.keys)) {
            // I vissa fall kan keys vara en array av ID-strängar eller objekt med ID
            const processedKeys = apartment.keys.map(key => {
              if (typeof key === 'string') {
                // Om key är ett ID, hämta hela key-objektet
                return keysData.find(k => k.id === key) || key;
              } else if (key && key.id) {
                // Om key är ett objekt med ID
                return key;
              }
              return key; // Behåll oförändrad om okänt format
            });
            cleanedApartment.keys = processedKeys;
          } else {
            // Om keys inte är en array, men ändå existerar (okänt format)
            // Skapa en tom array
            cleanedApartment.keys = [];
            console.warn('Unexpected keys format for apartment:', apartment.id, apartment.keys);
          }
        } else {
          // Om keys saknas, skapa en tom array
          cleanedApartment.keys = [];
        }
        
        console.log('Processed apartment:', cleanedApartment.id, {
          tenants: cleanedApartment.tenants,
          keys: cleanedApartment.keys
        });
        
        return cleanedApartment;
      });
      
      console.log('All processed apartments:', processedApartments);
      
      setApartments(processedApartments);
      setTenants(tenantsData);
      setKeys(keysData);
      setError(null);
    } catch (err) {
      setError('Ett fel uppstod när data skulle hämtas');
      console.error('Error fetching initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'tenantIds' || name === 'keyIds') {
      // Hantera multival för tenant och key selects
      console.log(`Handling multiselect for ${name}:`, e.target.selectedOptions);
      
      const selectedOptions = Array.from(
        e.target.selectedOptions || [], 
        option => option.value
      );
      
      console.log(`Selected ${name}:`, selectedOptions);
      
      setFormData(prev => ({
        ...prev,
        [name]: selectedOptions,
      }));
      
      console.log(`Updated formData for ${name}:`, selectedOptions);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let { tenantIds, keyIds, ...apartmentData } = formData;
      // Säkerställ att vi har giltiga arrayer och filtrera bort eventuella falsy-värden (null, undefined, etc.)
      tenantIds = (tenantIds || []).filter(Boolean);
      keyIds = (keyIds || []).filter(Boolean);
      
      // Säkerställ att vi inte har dubbletter i tenant-IDs
      tenantIds = [...new Set(tenantIds)]; // Tar bort eventuella dubbletter med hjälp av Set
      
      let savedApartment;
      
      if (selectedApartment) {
        // Identifiera ändrade fält genom att jämföra med selectedApartment
        const changedFields = {};
        for (const key in apartmentData) {
          // Jämför värdena och lägg endast till ändrade fält
          if (apartmentData[key] !== selectedApartment[key]) {
            changedFields[key] = apartmentData[key];
          }
        }
        
        console.log("Ändrade fält:", changedFields);
        
        // Uppdatera grundläggande information om lägenheten (endast ändrade fält)
        savedApartment = Object.keys(changedFields).length > 0 
          ? await apartmentService.patchApartment(selectedApartment.id, changedFields)
          : selectedApartment;
        
        // Hantera hyresgäst-relationer
        const existingTenantIds = selectedApartment.tenants?.map(t => t.id) || [];
        const tenantsToAdd = tenantIds.filter(id => !existingTenantIds.includes(id));
        const tenantsToRemove = existingTenantIds.filter(id => !tenantIds.includes(id));
        
        // Hantera nyckel-relationer
        const existingKeyIds = selectedApartment.keys?.map(k => k.id) || [];
        const keysToAdd = keyIds.filter(id => !existingKeyIds.includes(id));
        const keysToRemove = existingKeyIds.filter(id => !keyIds.includes(id));
        
        // Kör alla uppdateringar parallellt
        const updateOperations = [];
        
        // Lägg till hyresgäster
        for (const id of tenantsToAdd) {
          if (id) { // Säkerställ att id:t är giltigt
            updateOperations.push(apartmentService.assignTenant(savedApartment.id, id));
          }
        }
        
        // Ta bort hyresgäster
        for (const id of tenantsToRemove) {
          if (id) { // Säkerställ att id:t är giltigt
            updateOperations.push(apartmentService.removeTenant(savedApartment.id, id));
          }
        }
        
        // Lägg till nycklar
        for (const id of keysToAdd) {
          if (id) { // Säkerställ att id:t är giltigt
            updateOperations.push(apartmentService.assignKey(savedApartment.id, id));
          }
        }
        
        // Ta bort nycklar
        for (const id of keysToRemove) {
          if (id) { // Säkerställ att id:t är giltigt
            updateOperations.push(apartmentService.removeKey(savedApartment.id, id));
          }
        }
        
        if (updateOperations.length > 0) {
          await Promise.all(updateOperations);
        }
      } else {
        // Skapa en ny lägenhet
        savedApartment = await apartmentService.createApartment(apartmentData);
        
        // Hantera relationer för ny lägenhet
        const assignOperations = [];
        
        // Lägg till hyresgäster till ny lägenhet
        for (const id of tenantIds) {
          if (id) { // Säkerställ att id:t är giltigt
            assignOperations.push(apartmentService.assignTenant(savedApartment.id, id));
          }
        }
        
        // Lägg till nycklar till ny lägenhet
        for (const id of keyIds) {
          if (id) { // Säkerställ att id:t är giltigt
            assignOperations.push(apartmentService.assignKey(savedApartment.id, id));
          }
        }
        
        if (assignOperations.length > 0) {
          await Promise.all(assignOperations);
        }
      }

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
      setError('Ett fel uppstod när lägenheten skulle sparas');
      console.error('Error saving apartment:', err);
    }
  };

  const handleEdit = (apartment) => {
    console.log('Editing apartment:', apartment);
    
    // Rensa bort eventuella dubletter av hyresgäster innan redigering
    const cleanedApartment = cleanupDuplicateTenants(apartment);
    
    setSelectedApartment(cleanedApartment);
    
    // Extrahera tenant IDs, oavsett om tenants är en array av objekt eller ID-strängar
    let tenantIds = [];
    if (cleanedApartment.tenants && Array.isArray(cleanedApartment.tenants)) {
      tenantIds = cleanedApartment.tenants.map(tenant => {
        if (typeof tenant === 'string') return tenant;
        return tenant.id;
      }).filter(Boolean);
      
      // Säkerställ att inga dubletter finns
      tenantIds = [...new Set(tenantIds)];
    }
    
    // Extrahera key IDs, oavsett om keys är en array av objekt eller ID-strängar
    let keyIds = [];
    if (cleanedApartment.keys && Array.isArray(cleanedApartment.keys)) {
      keyIds = cleanedApartment.keys.map(key => {
        if (typeof key === 'string') return key;
        return key.id;
      }).filter(Boolean);
    }
    
    console.log('Extracted tenant IDs:', tenantIds);
    console.log('Extracted key IDs:', keyIds);
    
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
      setError('Ett fel uppstod när lägenheten skulle tas bort');
      console.error('Error deleting apartment:', err);
      // Behåll redigeringsmodalen öppen vid fel, stäng bara alertmodalen
      setIsAlertOpen(false);
      setApartmentToDelete(null);
    }
  };

  // Filtrera ut lediga hyresgäster (utan lägenhet)
  const getAvailableTenants = (tenantList, selectedApartmentTenants = []) => {
    // Hämta ID:n för hyresgäster som redan är associerade med lägenheten
    const selectedTenantIds = selectedApartmentTenants.map(t => 
      typeof t === 'object' ? t.id : t
    );
    
    return tenantList.filter(tenant => 
      // Inkludera hyresgäster som antingen:
      // 1. Redan är kopplade till denna lägenhet (finns i selectedTenantIds)
      // 2. Inte har någon lägenhet alls (tenant.apartment är null/undefined)
      selectedTenantIds.includes(tenant.id) || !tenant.apartment
    );
  };

  // Hjälpfunktion för att kontrollera om en lägenhet är ledig (har inga hyresgäster)
  const isApartmentVacant = (apartment) => {
    // En lägenhet är ledig om den inte har några hyresgäster
    if (!apartment.tenants) {
      return true;
    }
    
    if (!Array.isArray(apartment.tenants)) {
      return true; // Om tenants inte är en array, anta att den är ledig
    }
    
    // Filtrera bort tomma värden och kontrollera antalet
    const validTenants = apartment.tenants.filter(t => t && (typeof t === 'string' || t.id));
    return validTenants.length === 0;
  };

  // Filtrera och ge oss bara lediga lägenheter
  const getVacantApartments = (apartmentList) => {
    return apartmentList.filter(isApartmentVacant);
  };

  // Räkna antalet lediga lägenheter
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-cinzel">Lägenheter</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Lägg till lägenhet
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowOnlyVacant(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                !showOnlyVacant
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Alla lägenheter
            </button>
            <button
              onClick={() => setShowOnlyVacant(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                showOnlyVacant
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Lediga lägenheter ({countVacantApartments(apartments)})
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={showOnlyVacant ? getVacantApartments(apartments) : apartments}
        onEdit={handleEdit}
      />

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
        title={selectedApartment ? 'Redigera lägenhet' : 'Lägg till lägenhet'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Gata"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Nummer"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="LGH"
              name="apartmentNumber"
              value={formData.apartmentNumber}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Postnummer"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Stad"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Antal rum"
              name="rooms"
              type="number"
              value={formData.rooms}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Yta (m²)"
              name="area"
              type="number"
              value={formData.area}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Hyra (kr)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="electricity"
                checked={formData.electricity}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2">El ingår</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="storage"
                checked={formData.storage}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2">Förråd ingår</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="internet"
                checked={formData.internet}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2">Internet ingår</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hyresgäster
              </label>
              <select
                multiple
                size="5"
                name="tenantIds"
                value={formData.tenantIds || []}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                {getAvailableTenants(tenants, selectedApartment?.tenants).map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {`${tenant.firstName} ${tenant.lastName}`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Välj alla hyresgäster som står på kontraktet för denna lägenhet. Du kan bara välja hyresgäster som antingen redan bor i lägenheten eller som inte har någon lägenhet. Håll ner Ctrl (Windows) eller Cmd (Mac) för att välja flera.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nycklar
              </label>
              <select
                multiple
                size="5"
                name="keyIds"
                value={formData.keyIds || []}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                {keys.map((key) => (
                  <option key={key.id} value={key.id}>
                    {`${renderKeyType(key.type)} - ${key.serie}-${key.number}${key.copyNumber ? ' ' + key.copyNumber : ''}`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Välj alla nycklar som tillhör lägenheten. Håll ner Ctrl (Windows) eller Cmd (Mac) för att välja flera.
              </p>
            </div>
          </div>

          <div className="flex justify-between gap-4 mt-6">
            {selectedApartment && (
              <button
                type="button"
                onClick={() => handleDelete(selectedApartment)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Ta bort
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
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
              >
                {selectedApartment ? 'Spara ändringar' : 'Lägg till'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={confirmDelete}
        title="Ta bort lägenhet"
        message={apartmentToDelete ? `Är du säker på att du vill ta bort lägenheten ${apartmentToDelete.street} ${apartmentToDelete.number}, LGH ${apartmentToDelete.apartmentNumber}? Detta går inte att ångra.` : ''}
        confirmText="Ta bort"
        cancelText="Avbryt"
      />
    </div>
  );
};

export default Apartments; 