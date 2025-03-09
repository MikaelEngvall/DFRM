import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
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

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [tenantsData, apartmentsData, keysData] = await Promise.all([
        tenantService.getAllTenants(),
        apartmentService.getAllApartments(),
        keyService.getAllKeys(),
      ]);
      setTenants(tenantsData);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-cinzel dark:text-white">{t('tenants.title')}</h1>
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

      <DataTable
        columns={columns}
        data={tenants}
        onEdit={handleEdit}
        rowClassName={(tenant) => hasTenantApartment(tenant) ? 'opacity-60' : ''}
      />

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