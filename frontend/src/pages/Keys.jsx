import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { keyService, apartmentService, tenantService } from '../services';
import { useLocale } from '../contexts/LocaleContext';

const Keys = () => {
  const { t } = useLocale();
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
    copyNumber: '',
    apartmentId: '',
    tenantId: '',
  });

  const columns = [
    {
      key: 'type',
      label: t('keys.fields.type'),
      render: (type) => t(`keys.types.${type}`)
    },
    {
      key: 'serie',
      label: t('keys.fields.serie')
    },
    {
      key: 'number',
      label: t('keys.fields.number')
    },
    {
      key: 'copyNumber',
      label: t('keys.fields.copyNumber'),
      render: (copyNumber) => copyNumber || '-'
    },
    {
      key: 'apartment',
      label: t('keys.fields.apartment'),
      render: (_, key) => {
        if (!key.apartment) return '-';
        
        const apartmentId = typeof key.apartment === 'object' ? key.apartment.id : key.apartment;
        
        const apartment = apartments.find(a => a.id === apartmentId);
        
        if (!apartment) return '-';
        
        return `${apartment.street} ${apartment.number}${apartment.apartmentNumber ? `, LGH ${apartment.apartmentNumber}` : ''}`;
      }
    },
    {
      key: 'tenant',
      label: t('keys.fields.tenant'),
      render: (_, key) => {
        if (!key.tenant) return '-';
        
        const tenantId = typeof key.tenant === 'object' ? key.tenant.id : key.tenant;
        
        const tenant = tenants.find(t => t.id === tenantId);
        
        if (!tenant) return '-';
        
        return `${tenant.firstName} ${tenant.lastName}`;
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
      
      // Bearbeta nycklar för att säkerställa att apartment och tenant-referenserna är korrekta
      const processedKeys = keysData.map(key => {
        // Skapa en kopia av nyckeln för att undvika referensproblem
        const processedKey = { ...key };
        
        return processedKey;
      });
      
      console.log('Processade nycklar:', processedKeys);
      
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
        copyNumber: '',
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
      copyNumber: key.copyNumber || '',
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
        copyNumber: '',
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('keys.title')}</h1>
        <button
          onClick={() => {
            setSelectedKey(null);
            setFormData({
              type: '',
              serie: '',
              number: '',
              copyNumber: '',
              apartmentId: '',
              tenantId: ''
            });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('keys.addNew')}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">{t('common.loading')}</div>
      ) : error ? (
        <div className="text-center py-4 text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={keys}
          onEdit={handleEdit}
          rowClassName={() => "cursor-pointer"}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedKey ? t('keys.edit') : t('keys.addNew')}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('keys.fields.type')}
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">{t('keys.types.selectType')}</option>
              <option value="D">{t('keys.types.D')}</option>
              <option value="P">{t('keys.types.P')}</option>
              <option value="T">{t('keys.types.T')}</option>
              <option value="F">{t('keys.types.F')}</option>
              <option value="G">{t('keys.types.G')}</option>
              <option value="HN">{t('keys.types.HN')}</option>
              <option value="Ö">{t('keys.types.Ö')}</option>
            </select>
          </div>
          <FormInput
            label={t('keys.fields.serie')}
            name="serie"
            type="text"
            value={formData.serie}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormInput
            label={t('keys.fields.number')}
            name="number"
            type="text"
            value={formData.number}
            onChange={handleInputChange}
            required
          />
          <FormInput
            label={t('keys.fields.copyNumber')}
            name="copyNumber"
            type="text"
            value={formData.copyNumber}
            onChange={handleInputChange}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('keys.fields.apartment')}
          </label>
          <select
            name="apartmentId"
            value={formData.apartmentId}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">{t('keys.fields.noApartment')}</option>
            {apartments.map((apartment) => (
              <option key={apartment.id} value={apartment.id}>
                {apartment.street} {apartment.number}, LGH {apartment.apartmentNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('keys.fields.tenant')}
          </label>
          <select
            name="tenantId"
            value={formData.tenantId}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">{t('keys.fields.noTenant')}</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.firstName} {tenant.lastName}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={t('keys.confirmDelete')}
        message={
          keyToDelete ? 
          t('keys.deleteMessage', { 
            type: t(`keys.types.${keyToDelete.type}`),
            serie: keyToDelete.serie,
            number: keyToDelete.number
          }) : ''
        }
        buttons={[
          {
            label: t('common.delete'),
            onClick: handleDelete,
            variant: 'danger'
          },
          {
            label: t('common.cancel'),
            onClick: () => setIsAlertOpen(false)
          }
        ]}
      />
    </div>
  );
};

export default Keys; 