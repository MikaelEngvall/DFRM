import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { tenantService, apartmentService, keyService } from '../services';
import { formatShortDate, formatDateForInput } from '../utils/formatters';
import { useLocale } from '../contexts/LocaleContext';
import RelatedTasks from '../components/RelatedTasks';

// Definiera nyckeltyper
const keyTypes = [
  { value: 'D', label: 'keys.types.D' },
  { value: 'P', label: 'keys.types.P' },
  { value: 'T', label: 'keys.types.T' },
  { value: 'F', label: 'keys.types.F' },
  { value: 'G', label: 'keys.types.G' },
  { value: 'HN', label: 'keys.types.HN' },
  { value: 'Ö', label: 'keys.types.Ö' }
];

// Hjälpfunktion för att rendera nyckeltyp
const renderKeyType = (typeValue) => {
  const typeOption = keyTypes.find(t => t.value === typeValue);
  return typeOption ? typeOption.label : typeValue;
};

const Tenants = () => {
  const { t } = useLocale();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personnummer: '',
    email: '',
    phone: '',
    movedInDate: '',
    resiliationDate: '',
    comment: '',
    apartmentId: '',
    keyIds: [],
  });
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    street: '',
    number: '',
    firstName: '',
    lastName: ''
  });
  
  // Unika städer, gator, förnamn och efternamn för filter
  const uniqueCities = useMemo(() => {
    // Hämta alla unika städer från hyresgästernas lägenheter
    const cities = tenants
      .filter(tenant => tenant.apartment)
      .map(tenant => {
        const apartmentId = typeof tenant.apartment === 'object' ? tenant.apartment.id : tenant.apartment;
        const apartment = apartments.find(a => a.id === apartmentId);
        return apartment?.city;
      })
      .filter(Boolean);
    
    return [...new Set(cities)].sort();
  }, [tenants, apartments]);
  
  const uniqueStreets = useMemo(() => {
    // Hämta alla unika gator från hyresgästernas lägenheter
    const streets = tenants
      .filter(tenant => tenant.apartment)
      .map(tenant => {
        const apartmentId = typeof tenant.apartment === 'object' ? tenant.apartment.id : tenant.apartment;
        const apartment = apartments.find(a => a.id === apartmentId);
        return apartment?.street;
      })
      .filter(Boolean);
    
    return [...new Set(streets)].sort();
  }, [tenants, apartments]);
  
  const uniqueFirstNames = useMemo(() => {
    return [...new Set(tenants.map(tenant => tenant.firstName))].filter(Boolean).sort();
  }, [tenants]);
  
  const uniqueLastNames = useMemo(() => {
    return [...new Set(tenants.map(tenant => tenant.lastName))].filter(Boolean).sort();
  }, [tenants]);

  // Uppdatera keyTypes med översättningar
  const translatedKeyTypes = keyTypes.map(type => ({
    ...type,
    label: t(type.label)
  }));

  // Hjälpfunktion för att kontrollera om en hyresgäst har lägenhet
  const hasTenantApartment = (tenant) => {
    // Kontrollera om apartment finns som objekt eller ID
    return Boolean(tenant.apartment); // Detta returnerar false för null, undefined och tomma strängar
  };

  const columns = [
    { key: 'firstName', label: t('tenants.fields.firstName') },
    { key: 'lastName', label: t('tenants.fields.lastName') },
    { key: 'phone', label: t('tenants.fields.phoneNumber') },
    { 
      key: 'status', 
      label: t('common.status'),
      render: (_, tenant) => hasTenantApartment(tenant) ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          {t('apartments.isOccupied')}
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {t('apartments.isVacant')}
        </span>
      )
    },
    {
      key: 'movedInDate',
      label: t('tenants.fields.movedInDate'),
      render: (value) => formatShortDate(value)
    },
    {
      key: 'resiliationDate',
      label: t('tenants.fields.resiliationDate'),
      render: (value) => formatShortDate(value)
    },
    {
      key: 'apartment',
      label: t('tenants.fields.apartment'),
      render: (apartmentId) => {
        if (!apartmentId) return '-';
        const apartment = apartments.find(a => a.id === apartmentId);
        return apartment 
          ? `${apartment.street} ${apartment.number}, LGH ${apartment.apartmentNumber}` 
          : '-';
      }
    },
    {
      key: 'keys',
      label: t('tenants.fields.keys'),
      render: (keysValue, tenant) => {
        // Om keys inte finns eller är en tom array
        if (!tenant.keys || (Array.isArray(tenant.keys) && tenant.keys.length === 0)) {
          return '-';
        }
        
        // Om keys är en array, räkna antalet nycklar och typer
        if (Array.isArray(tenant.keys)) {
          // Filtrera bort ogiltiga nycklar
          const validKeys = tenant.keys.filter(key => key && (typeof key === 'string' || key.id));
          
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
  }, []);
  
  // Applicera filter när de ändras eller när data ändras
  useEffect(() => {
    applyFilters();
  }, [filters, tenants, apartments]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [tenantsData, apartmentsData, keysData] = await Promise.all([
        tenantService.getAllTenants(),
        apartmentService.getAllApartments(),
        keyService.getAllKeys(),
      ]);
      
      setTenants(tenantsData);
      setFilteredTenants(tenantsData);
      setApartments(apartmentsData);
      setKeys(keysData);
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === 'keyIds') {
      // Hantera flervalslista för nycklar
      const selectedKeyIds = Array.from(
        e.target.selectedOptions || [],
        option => option.value
      );
      setFormData(prev => ({
        ...prev,
        keyIds: selectedKeyIds
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
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
    let result = [...tenants];
    
    // Filtrera baserat på förnamn
    if (filters.firstName) {
      result = result.filter(tenant => tenant.firstName === filters.firstName);
    }
    
    // Filtrera baserat på efternamn
    if (filters.lastName) {
      result = result.filter(tenant => tenant.lastName === filters.lastName);
    }
    
    // Filtrera baserat på stad
    if (filters.city) {
      result = result.filter(tenant => {
        if (!tenant.apartment) return false;
        
        const apartmentId = typeof tenant.apartment === 'object' ? tenant.apartment.id : tenant.apartment;
        const apartment = apartments.find(a => a.id === apartmentId);
        
        return apartment && apartment.city === filters.city;
      });
    }
    
    // Filtrera baserat på gata
    if (filters.street) {
      result = result.filter(tenant => {
        if (!tenant.apartment) return false;
        
        const apartmentId = typeof tenant.apartment === 'object' ? tenant.apartment.id : tenant.apartment;
        const apartment = apartments.find(a => a.id === apartmentId);
        
        return apartment && apartment.street === filters.street;
      });
    }
    
    // Filtrera baserat på nummer
    if (filters.number) {
      result = result.filter(tenant => {
        if (!tenant.apartment) return false;
        
        const apartmentId = typeof tenant.apartment === 'object' ? tenant.apartment.id : tenant.apartment;
        const apartment = apartments.find(a => a.id === apartmentId);
        
        return apartment && apartment.number === filters.number;
      });
    }
    
    setFilteredTenants(result);
  };
  
  const clearFilters = () => {
    setFilters({
      city: '',
      street: '',
      number: '',
      firstName: '',
      lastName: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let { apartmentId, keyIds, ...tenantData } = formData;
      
      // Säkerställ att vi har giltiga värden
      apartmentId = apartmentId || null;
      keyIds = keyIds || [];
      
      // Rensa adressfält som ska ärvas från lägenheten
      tenantData.street = '';
      tenantData.postalCode = '';
      tenantData.city = '';
      
      let savedTenant;
      
      if (selectedTenant) {
        // Identifiera ändrade fält genom att jämföra med selectedTenant
        const changedFields = {};
        for (const key in tenantData) {
          // Jämför värdena och lägg endast till ändrade fält som inte är tomma eller null
          if (tenantData[key] !== selectedTenant[key] && tenantData[key] !== '' && tenantData[key] !== null) {
            changedFields[key] = tenantData[key];
          }
        }
        
        console.log("Ändrade fält:", changedFields);
        
        // Uppdatera grundläggande information om hyresgästen (endast ändrade fält)
        savedTenant = Object.keys(changedFields).length > 0 
          ? await tenantService.patchTenant(selectedTenant.id, changedFields)
          : selectedTenant;
        
        // Hantera lägenhet och nycklar separat efter att hyresgästen har uppdaterats
        const updateOperations = [];
        
        // Hantera lägenhet
        const currentApartmentId = selectedTenant?.apartment?.id || null;
        if (apartmentId && apartmentId !== currentApartmentId) {
          updateOperations.push(tenantService.assignApartment(savedTenant.id, apartmentId));
        } else if (!apartmentId && currentApartmentId) {
          updateOperations.push(tenantService.removeApartment(savedTenant.id));
        }
        
        // Hantera nycklar - mer komplext med flera nycklar
        const currentKeyIds = Array.isArray(selectedTenant?.keys) 
          ? selectedTenant.keys.map(k => typeof k === 'object' ? k.id : k) 
          : [];
        
        // Nycklar att lägga till (finns i keyIds men inte i currentKeyIds)
        const keysToAdd = keyIds.filter(id => !currentKeyIds.includes(id));
        
        // Nycklar att ta bort (finns i currentKeyIds men inte i keyIds)
        const keysToRemove = currentKeyIds.filter(id => !keyIds.includes(id));
        
        // Lägg till nya nycklar
        for (const keyId of keysToAdd) {
          updateOperations.push(tenantService.assignKey(savedTenant.id, keyId));
        }
        
        // Ta bort nycklar som inte längre ska vara kopplade
        for (const keyId of keysToRemove) {
          updateOperations.push(tenantService.removeKey(savedTenant.id, keyId));
        }
        
        if (updateOperations.length > 0) {
          await Promise.all(updateOperations);
        }
      } else {
        // Skapa en ny hyresgäst
        savedTenant = await tenantService.createTenant(tenantData);
        
        // Hantera relationer för ny hyresgäst
        const assignOperations = [];
        
        // Tilldela lägenhet om vald
        if (apartmentId) {
          assignOperations.push(tenantService.assignApartment(savedTenant.id, apartmentId));
        }
        
        // Hantera nycklar för ny hyresgäst
        for (const keyId of keyIds) {
          assignOperations.push(tenantService.assignKey(savedTenant.id, keyId));
        }
        
        if (assignOperations.length > 0) {
          await Promise.all(assignOperations);
        }
      }

      await fetchInitialData();
      setIsModalOpen(false);
      setSelectedTenant(null);
      setFormData({
        firstName: '',
        lastName: '',
        personnummer: '',
        email: '',
        phone: '',
        movedInDate: '',
        resiliationDate: '',
        comment: '',
        apartmentId: '',
        keyIds: [],
      });
    } catch (err) {
      setError(t('tenants.messages.saveError'));
      console.error('Error saving tenant:', err);
    }
  };

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant);
    
    let apartmentId = '';
    if (tenant.apartment) {
      if (typeof tenant.apartment === 'object') {
        apartmentId = tenant.apartment.id || '';
      } else if (typeof tenant.apartment === 'string') {
        apartmentId = tenant.apartment;
      }
    }
    
    // Extrahera nyckel-ID från tenant.keys
    let keyIds = [];
    if (Array.isArray(tenant.keys)) {
      keyIds = tenant.keys.map(key => {
        if (typeof key === 'object' && key.id) {
          return key.id;
        }
        return key;
      }).filter(Boolean);
    }
    
    setFormData({
      firstName: tenant.firstName || '',
      lastName: tenant.lastName || '',
      personnummer: tenant.personnummer || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      movedInDate: tenant.movedInDate 
        ? (typeof tenant.movedInDate === 'string' 
           ? tenant.movedInDate.substring(0, 10) 
           : tenant.movedInDate instanceof Date 
             ? tenant.movedInDate.toISOString().substring(0, 10)
             : '')
        : '',
      resiliationDate: tenant.resiliationDate 
        ? (typeof tenant.resiliationDate === 'string' 
           ? tenant.resiliationDate.substring(0, 10) 
           : tenant.resiliationDate instanceof Date 
             ? tenant.resiliationDate.toISOString().substring(0, 10)
             : '')
        : '',
      comment: tenant.comment || '',
      apartmentId: apartmentId,
      keyIds: keyIds,
    });
    
    setIsModalOpen(true);
  };

  const handleDelete = async (tenant) => {
    setTenantToDelete(tenant);
    // Visa bekräftelsemodalen (utan att stänga redigeringsmodalen)
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await tenantService.deleteTenant(tenantToDelete.id);
      await fetchInitialData();
      // Stäng båda modalerna efter radering
      setIsModalOpen(false);
      setIsAlertOpen(false);
      setSelectedTenant(null);
      setTenantToDelete(null);
      setFormData({
        firstName: '',
        lastName: '',
        personnummer: '',
        email: '',
        phone: '',
        movedInDate: '',
        resiliationDate: '',
        comment: '',
        apartmentId: '',
        keyIds: [],
      });
    } catch (err) {
      setError('Ett fel uppstod när hyresgästen skulle tas bort');
      console.error('Error deleting tenant:', err);
      // Behåll redigeringsmodalen öppen vid fel, stäng bara alertmodalen
      setIsAlertOpen(false);
      setTenantToDelete(null);
    }
  };

  // Filtrera ut lediga hyresgäster (utan lägenhet)
  const getAvailableTenants = (tenantList) => {
    return selectedTenant 
      ? tenantList.filter(t => !hasTenantApartment(t) || t.id === selectedTenant.id)
      : tenantList.filter(t => !hasTenantApartment(t));
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
        <h1 className="text-3xl font-cinzel dark:text-white">{t('tenants.title')}</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            {t('common.filters')}
          </button>
          <button
            onClick={() => {
              setSelectedTenant(null);
              setFormData({
                firstName: '',
                lastName: '',
                personnummer: '',
                email: '',
                phone: '',
                movedInDate: '',
                resiliationDate: '',
                comment: '',
                apartmentId: '',
                keyIds: [],
              });
              setIsModalOpen(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('tenants.addNew')}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Förnamn Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tenants.fields.firstName')}
              </label>
              <select
                name="firstName"
                value={filters.firstName}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                {uniqueFirstNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            
            {/* Efternamn Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tenants.fields.lastName')}
              </label>
              <select
                name="lastName"
                value={filters.lastName}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                {uniqueLastNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            
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
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredTenants.length} {t('tenants.filteredResults', { count: filteredTenants.length })}
            </div>
          </div>
        </div>
      )}

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
          data={filteredTenants}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTenant(null);
          setFormData({
            firstName: '',
            lastName: '',
            personnummer: '',
            email: '',
            phone: '',
            movedInDate: '',
            resiliationDate: '',
            comment: '',
            apartmentId: '',
            keyIds: [],
          });
        }}
        title={selectedTenant ? t('tenants.edit') : t('tenants.addNew')}
        size="small"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label={t('tenants.fields.firstName')}
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label={t('tenants.fields.lastName')}
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label={t('tenants.fields.personnummer')}
              name="personnummer"
              value={formData.personnummer}
              onChange={handleInputChange}
              placeholder="ÅÅÅÅMMDD-XXXX"
              required
            />
            <FormInput
              label={t('tenants.fields.email')}
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <FormInput
              label={t('tenants.fields.phoneNumber')}
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label={t('tenants.fields.movedInDate')}
              name="movedInDate"
              type="date"
              value={formatDateForInput(formData.movedInDate)}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label={t('tenants.fields.resiliationDate')}
              name="resiliationDate"
              type="date"
              value={formatDateForInput(formData.resiliationDate)}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tenants.fields.apartment')}
              </label>
              <select
                name="apartmentId"
                value={formData.apartmentId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="">{t('tenants.fields.noApartment')}</option>
                {apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {`${apartment.street} ${apartment.number}, ${apartment.apartmentNumber}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="keyIds"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('tenants.fields.keys')}
              </label>
              <select
                id="keyIds"
                name="keyIds"
                multiple
                value={formData.keyIds}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white sm:text-sm"
                size={Math.min(5, keys.length)}
              >
                {keys.map((key) => (
                  <option key={key.id} value={key.id}>
                    {t(`keys.types.${key.type}`)} ({key.serie}-{key.number})
                    {key.copyNumber ? ` #${key.copyNumber}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <FormInput
                label={t('tenants.fields.comment')}
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex justify-between gap-4 mt-6">
            {selectedTenant && (
              <button
                type="button"
                onClick={() => handleDelete(selectedTenant)}
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
                  setSelectedTenant(null);
                  setFormData({
                    firstName: '',
                    lastName: '',
                    personnummer: '',
                    email: '',
                    phone: '',
                    movedInDate: '',
                    resiliationDate: '',
                    comment: '',
                    apartmentId: '',
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
                {selectedTenant ? t('common.save') : t('common.add')}
              </button>
            </div>
          </div>

          {/* Visa RelatedTasks endast när vi redigerar en befintlig hyresgäst */}
          {selectedTenant && selectedTenant.id && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <RelatedTasks entityType="tenant" entityId={selectedTenant.id} />
            </div>
          )}
        </form>
      </Modal>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={confirmDelete}
        title={t('tenants.confirmDelete')}
        message={
          tenantToDelete ? 
          t('tenants.deleteMessage', { 
            firstName: tenantToDelete.firstName, 
            lastName: tenantToDelete.lastName 
          }) : ''
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default Tenants; 