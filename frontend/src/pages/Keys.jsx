import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { keyService, apartmentService, tenantService } from '../services';

const Keys = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [keys, setKeys] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    serie: '',
    number: '',
    apartmentId: '',
    tenantId: '',
  });

  const columns = [
    { 
      key: 'type', 
      label: 'Typ',
      render: (typeValue) => {
        const typeOption = keyTypes.find(t => t.value === typeValue);
        return typeOption ? typeOption.label : typeValue;
      }
    },
    { key: 'serie', label: 'Serie' },
    { key: 'number', label: 'Nummer' },
    { 
      key: 'apartment',
      label: 'Lägenhet',
      render: (apartmentValue, row) => {
        console.log("Rendering apartment column:", apartmentValue, row);
        
        if (apartmentValue === undefined || apartmentValue === null) return '-';
        
        if (typeof apartmentValue === 'object' && apartmentValue.id) {
          return `${apartmentValue.street} ${apartmentValue.number}, LGH ${apartmentValue.apartmentNumber}`;
        }
        
        if (typeof apartmentValue === 'string') {
          const apartmentObj = apartments.find(a => a.id === apartmentValue);
          if (apartmentObj) {
            return `${apartmentObj.street} ${apartmentObj.number}, LGH ${apartmentObj.apartmentNumber}`;
          }
        }
        
        return '-';
      }
    },
    {
      key: 'tenant',
      label: 'Hyresgäst',
      render: (tenantValue, row) => {
        console.log("Rendering tenant column:", tenantValue, row);
        
        if (tenantValue === undefined || tenantValue === null) return '-';
        
        if (typeof tenantValue === 'object' && tenantValue.id) {
          return `${tenantValue.firstName} ${tenantValue.lastName}`;
        }
        
        if (typeof tenantValue === 'string') {
          const tenantObj = tenants.find(t => t.id === tenantValue);
          if (tenantObj) {
            return `${tenantObj.firstName} ${tenantObj.lastName}`;
          }
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
      const [keysData, apartmentsData, tenantsData] = await Promise.all([
        keyService.getAllKeys(),
        apartmentService.getAllApartments(),
        tenantService.getAllTenants(),
      ]);
      
      console.log('Nycklar från API:', keysData);
      console.log('Lägenheter från API:', apartmentsData);
      console.log('Hyresgäster från API:', tenantsData);
      
      const processedKeys = keysData.map(key => {
        const processedKey = { ...key };
        
        if (typeof key.tenant === 'string') {
          const tenant = tenantsData.find(t => t.id === key.tenant);
          if (tenant) {
            console.log(`Hittade tenant för ID ${key.tenant}:`, tenant);
            processedKey.tenant = tenant;
          }
        }
        
        if (typeof key.apartment === 'string') {
          const apartment = apartmentsData.find(a => a.id === key.apartment);
          if (apartment) {
            console.log(`Hittade apartment för ID ${key.apartment}:`, apartment);
            processedKey.apartment = apartment;
          }
        }
        
        return processedKey;
      });
      
      console.log('Processade nycklar med referenser:', processedKeys);
      
      setKeys(processedKeys);
      setApartments(apartmentsData);
      setTenants(tenantsData);
      setError(null);
    } catch (err) {
      setError('Ett fel uppstod när data skulle hämtas');
      console.error('Error fetching initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let { apartmentId, tenantId, ...keyData } = formData;
      
      console.log('Form data före sparande:', formData);
      
      apartmentId = apartmentId || null;
      tenantId = tenantId || null;
      
      console.log('Apartment ID att spara:', apartmentId);
      console.log('Tenant ID att spara:', tenantId);
      
      let savedKey;
      
      if (selectedKey) {
        console.log('Uppdaterar befintlig nyckel med ID:', selectedKey.id);
        
        // Identifiera ändrade fält genom att jämföra med selectedKey
        const changedFields = {};
        for (const key in keyData) {
          // Jämför värdena och lägg endast till ändrade fält
          if (keyData[key] !== selectedKey[key]) {
            changedFields[key] = keyData[key];
          }
        }
        
        console.log("Ändrade fält:", changedFields);
        
        // Uppdatera grundläggande information om nyckeln (endast ändrade fält)
        savedKey = Object.keys(changedFields).length > 0 
          ? await keyService.patchKey(selectedKey.id, changedFields)
          : selectedKey;
        
        console.log('Nyckel uppdaterad:', savedKey);
        
        // Utför relationsuppdateringar sekventiellt istället för parallellt
        
        // Uppdatera lägenhet om nödvändigt
        const currentApartmentId = (selectedKey.apartment && selectedKey.apartment.id) || null;
        console.log('Nuvarande Apartment ID:', currentApartmentId, 'Ny Apartment ID:', apartmentId);
        
        if (apartmentId && apartmentId !== currentApartmentId) {
          console.log('Tilldelar ny lägenhet:', apartmentId);
          const apartmentResult = await keyService.assignApartment(savedKey.id, apartmentId);
          console.log('Resultat av lägenhetstilldelning:', apartmentResult);
          // Uppdatera savedKey med senaste versionen som har lägenhet kopplad
          savedKey = await keyService.getKeyById(savedKey.id);
        } else if (!apartmentId && currentApartmentId) {
          console.log('Tar bort lägenhet från nyckel');
          const apartmentRemovalResult = await keyService.removeApartment(savedKey.id);
          console.log('Resultat av lägenhets-borttagning:', apartmentRemovalResult);
          // Uppdatera savedKey efter borttagning
          savedKey = await keyService.getKeyById(savedKey.id);
        }
        
        // Uppdatera hyresgäst (efter lägenhet) om nödvändigt
        const currentTenantId = (selectedKey.tenant && selectedKey.tenant.id) || null;
        console.log('Nuvarande Tenant ID:', currentTenantId, 'Ny Tenant ID:', tenantId);
        
        if (tenantId && tenantId !== currentTenantId) {
          console.log('Tilldelar ny hyresgäst:', tenantId);
          const tenantResult = await keyService.assignTenant(savedKey.id, tenantId);
          console.log('Resultat av hyresgästtilldelning:', tenantResult);
        } else if (!tenantId && currentTenantId) {
          console.log('Tar bort hyresgäst från nyckel');
          const tenantRemovalResult = await keyService.removeTenant(savedKey.id);
          console.log('Resultat av hyresgäst-borttagning:', tenantRemovalResult);
        }
      } else {
        console.log('Skapar ny nyckel');
        savedKey = await keyService.createKey(keyData);
        console.log('Nyckel skapad:', savedKey);
        
        // Utför tilldelning av relationer sekventiellt istället för parallellt
        
        // Steg 1: Tilldela lägenhet först (om det finns)
        if (apartmentId) {
          console.log('Tilldelar lägenhet till ny nyckel:', apartmentId);
          const apartmentResult = await keyService.assignApartment(savedKey.id, apartmentId);
          console.log('Resultat av lägenhetstilldelning:', apartmentResult);
          // Uppdatera savedKey med senaste versionen som har lägenhet kopplad
          savedKey = await keyService.getKeyById(savedKey.id);
        }
        
        // Steg 2: Tilldela hyresgäst efter att lägenhet har tilldelats (om det finns)
        if (tenantId) {
          console.log('Tilldelar hyresgäst till ny nyckel:', tenantId);
          const tenantResult = await keyService.assignTenant(savedKey.id, tenantId);
          console.log('Resultat av hyresgästtilldelning:', tenantResult);
        }
      }
      
      console.log('Uppdaterar data efter sparande/uppdatering');
      await fetchInitialData();
      setIsModalOpen(false);
      setSelectedKey(null);
      setFormData({
        type: '',
        serie: '',
        number: '',
        apartmentId: '',
        tenantId: '',
      });
    } catch (err) {
      setError('Ett fel uppstod när nyckeln skulle sparas');
      console.error('Error saving key:', err);
    }
  };

  const handleEdit = (key) => {
    console.log('Redigerar nyckel:', key);
    
    setSelectedKey(key);
    
    let apartmentId = '';
    let tenantId = '';
    
    if (key.tenant) {
      if (typeof key.tenant === 'object') {
        tenantId = key.tenant.id || '';
      } else if (typeof key.tenant === 'string') {
        tenantId = key.tenant;
      }
    }
    
    if (key.apartment) {
      if (typeof key.apartment === 'object') {
        apartmentId = key.apartment.id || '';
      } else if (typeof key.apartment === 'string') {
        apartmentId = key.apartment;
      }
    }
    
    console.log('Lägenhet ID:', apartmentId, 'Hyresgäst ID:', tenantId);
    
    setFormData({
      type: key.type || '',
      serie: key.serie || '',
      number: key.number || '',
      apartmentId: apartmentId,
      tenantId: tenantId
    });
    
    setIsModalOpen(true);
  };

  const handleDelete = async (key) => {
    setKeyToDelete(key);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await keyService.deleteKey(keyToDelete.id);
      await fetchInitialData();
      setIsModalOpen(false);
      setIsAlertOpen(false);
      setSelectedKey(null);
      setKeyToDelete(null);
      setFormData({
        type: '',
        serie: '',
        number: '',
        apartmentId: '',
        tenantId: '',
      });
    } catch (err) {
      setError('Ett fel uppstod när nyckeln skulle tas bort');
      console.error('Error deleting key:', err);
      setIsAlertOpen(false);
      setKeyToDelete(null);
    }
  };

  const keyTypes = [
    { value: 'D', label: 'Dörr (D)' },
    { value: 'P', label: 'Post (P)' },
    { value: 'T', label: 'Tvätt (T)' },
    { value: 'F', label: 'Förråd (F)' },
    { value: 'G', label: 'Garage (G)' },
    { value: 'HN', label: 'Huvudnyckel (HN)' },
    { value: 'Ö', label: 'Övrigt (Ö)' }
  ];

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
        <h1 className="text-3xl font-cinzel">Nycklar</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Lägg till nyckel
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
        data={keys}
        onEdit={handleEdit}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedKey(null);
          setFormData({
            type: '',
            serie: '',
            number: '',
            apartmentId: '',
            tenantId: '',
          });
        }}
        title={selectedKey ? 'Redigera nyckel' : 'Lägg till nyckel'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Typ
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              >
                <option value="">Välj typ</option>
                {keyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Serie"
              name="serie"
              value={formData.serie}
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

            <div>
              <label
                htmlFor="apartmentId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lägenhet
              </label>
              <select
                id="apartmentId"
                name="apartmentId"
                value={formData.apartmentId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              >
                <option value="">Välj lägenhet</option>
                {apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {`${apartment.street} ${apartment.number}, ${apartment.apartmentNumber}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tenantId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Hyresgäst
              </label>
              <select
                id="tenantId"
                name="tenantId"
                value={formData.tenantId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">Ingen hyresgäst</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {`${tenant.firstName} ${tenant.lastName}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between gap-4 mt-6">
            {selectedKey && (
              <button
                type="button"
                onClick={() => handleDelete(selectedKey)}
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
                  setSelectedKey(null);
                  setFormData({
                    type: '',
                    serie: '',
                    number: '',
                    apartmentId: '',
                    tenantId: '',
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
                {selectedKey ? 'Spara ändringar' : 'Lägg till'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={confirmDelete}
        title="Ta bort nyckel"
        message={keyToDelete ? `Är du säker på att du vill ta bort nyckeln ${keyToDelete.type} (${keyToDelete.serie}-${keyToDelete.number})? Detta går inte att ångra.` : ''}
        confirmText="Ta bort"
        cancelText="Avbryt"
      />
    </div>
  );
};

export default Keys; 