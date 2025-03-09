import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { apartmentService, tenantService, keyService } from '../services';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';

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

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [apartmentsData, tenantsData, keysData] = await Promise.all([
        apartmentService.getAllApartments(),
        tenantService.getAllTenants(),
        keyService.getAllKeys(),
      ]);
      setApartments(apartmentsData);
      setTenants(tenantsData);
      setKeys(keysData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError(t('common.error'));
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
        
        // Hyresgäster att lägga till (finns i tenantIds men inte i currentTenantIds)
        const tenantsToAdd = tenantIds.filter(id => !currentTenantIds.includes(id));
        
        // Hyresgäster att ta bort (finns i currentTenantIds men inte i tenantIds)
        const tenantsToRemove = currentTenantIds.filter(id => !tenantIds.includes(id));
        
        // Nycklar att lägga till (finns i keyIds men inte i currentKeyIds)
        const keysToAdd = keyIds.filter(id => !currentKeyIds.includes(id));
        
        // Nycklar att ta bort (finns i currentKeyIds men inte i keyIds)
        const keysToRemove = currentKeyIds.filter(id => !keyIds.includes(id));
        
        // Lägg till uppdateringsoperationer för hyresgäster
        for (const id of tenantsToAdd) {
          updateOperations.push(apartmentService.assignTenant(savedApartment.id, id));
        }
        
        // Lägg till uppdateringsoperationer för hyresgäster att ta bort
        for (const id of tenantsToRemove) {
          updateOperations.push(apartmentService.removeTenant(savedApartment.id, id));
        }
        
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
        savedApartment = await apartmentService.createApartment(apartmentData);
        
        // Lägg till hyresgäster till ny lägenhet
        for (const id of tenantIds) {
          updateOperations.push(apartmentService.assignTenant(savedApartment.id, id));
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
      console.error('Error saving apartment:', err);
      setError(t('apartments.messages.saveError'));
    }
  };

  const handleEdit = (apartment) => {
    // Rensa upp dubletter i tenant arrays
    const cleanedApartment = cleanupDuplicateTenants(apartment);
    setSelectedApartment(cleanedApartment);
    
    // Extrahera tenant IDs från apartment.tenants
    let tenantIds = [];
    if (Array.isArray(cleanedApartment.tenants)) {
      tenantIds = cleanedApartment.tenants.map(tenant => {
        if (typeof tenant === 'object' && tenant.id) {
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
        if (typeof key === 'object' && key.id) {
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
    const selectedTenantIds = selectedApartmentTenants
      .map(tenant => typeof tenant === 'object' ? tenant.id : tenant)
      .filter(Boolean);
    
    return tenantList.filter(tenant => {
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
        <h1 className="text-3xl font-cinzel dark:text-white">{t('apartments.title')}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('apartments.addNew')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Flikar för att visa alla/lediga lägenheter */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => {
            setShowOnlyVacant(false);
            setActiveTab('all');
          }}
        >
          {t('apartments.all')} ({apartments.length})
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'vacant'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => {
            setShowOnlyVacant(true);
            setActiveTab('vacant');
          }}
        >
          {t('apartments.vacant')} ({countVacantApartments(apartments)})
        </button>
      </div>
      
      <DataTable
        columns={columns}
        data={showOnlyVacant ? getVacantApartments(apartments) : apartments}
        onEdit={handleEdit}
        rowClassName={(apartment) => isApartmentVacant(apartment) ? 'bg-green-50 dark:bg-green-900/10' : ''}
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
        title={selectedApartment ? t('apartments.edit') : t('apartments.addNew')}
        size="small"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ändra layout till 2 kolumner */}
          <div className="grid grid-cols-2 gap-4">
            {/* Vänster kolumn */}
            <div className="space-y-4">
              <FormInput
                label={t('apartments.fields.street')}
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label={t('apartments.fields.apartmentNumber')}
                name="apartmentNumber"
                value={formData.apartmentNumber}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label={t('apartments.fields.city')}
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <FormInput
                label={t('apartments.fields.area')}
                name="area"
                type="number"
                value={formData.area}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Höger kolumn */}
            <div className="space-y-4">
              <FormInput
                label={t('apartments.fields.number')}
                name="number"
                value={formData.number}
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
              <FormInput
                label={t('apartments.fields.rooms')}
                name="rooms"
                type="number"
                value={formData.rooms}
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
    </div>
  );
};

export default Apartments; 