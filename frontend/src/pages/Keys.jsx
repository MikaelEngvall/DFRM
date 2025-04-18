import React, { useState, useEffect, useMemo } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon, FunnelIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { keyService, apartmentService, tenantService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import Title from '../components/Title';

const Keys = () => {
  const { t } = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [keys, setKeys] = useState([]);
  const [filteredKeys, setFilteredKeys] = useState([]);
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
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    apartmentId: '',
    tenantId: '',
  });

  const [isExporting, setIsExporting] = useState(false);

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
  
  // Filter keys when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, keys]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [keysData, apartmentsData, tenantsData] = await Promise.all([
        keyService.getAllKeys(),
        apartmentService.getAllApartments(),
        tenantService.getAllTenants(),
      ]);

      // Bearbeta nycklar för att säkerställa att apartment och tenant-referenserna är korrekta
      const processedKeys = keysData.map(key => {
        // Skapa en kopia av nyckeln för att undvika referensproblem
        const processedKey = { ...key };
        
        return processedKey;
      });
      
      
      setKeys(processedKeys);
      setFilteredKeys(processedKeys);
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
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const applyFilters = () => {
    let result = [...keys];
    
    // Filtrera baserat på nyckeltyp
    if (filters.type) {
      result = result.filter(key => key.type === filters.type);
    }
    
    // Filtrera baserat på stad
    if (filters.city) {
      result = result.filter(key => {
        if (!key.apartment) return false;
        
        const apartmentId = typeof key.apartment === 'object' ? key.apartment.id : key.apartment;
        const apartment = apartments.find(a => a.id === apartmentId);
        
        return apartment && apartment.city === filters.city;
      });
    }
    
    // Filtrera baserat på lägenhet
    if (filters.apartmentId) {
      result = result.filter(key => {
        if (!key.apartment) return false;
        
        const apartmentId = typeof key.apartment === 'object' ? key.apartment.id : key.apartment;
        return apartmentId === filters.apartmentId;
      });
    }
    
    // Filtrera baserat på hyresgäst
    if (filters.tenantId) {
      result = result.filter(key => {
        if (!key.tenant) return false;
        
        const tenantId = typeof key.tenant === 'object' ? key.tenant.id : key.tenant;
        return tenantId === filters.tenantId;
      });
    }
    
    setFilteredKeys(result);
  };
  
  const clearFilters = () => {
    setFilters({
      type: '',
      city: '',
      apartmentId: '',
      tenantId: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { serie, number, copyNumber, type, isAvailable, description } = formData;
      const apartmentId = formData.apartment || null;
      const tenantId = formData.tenant || null;
      

      let keyData = {
        serie,
        number,
        copyNumber,
        type,
        isAvailable: isAvailable === true || isAvailable === 'true',
        description
      };
      
      let savedKey;
      
      if (selectedKey && selectedKey.id) {
        keyData.id = selectedKey.id;
        savedKey = await keyService.updateKey(selectedKey.id, keyData);
        
        // Uppdatera lägenhet (om nödvändigt)
        const currentApartmentId = (selectedKey.apartment && selectedKey.apartment.id) || null;

        
        if (apartmentId && apartmentId !== currentApartmentId) {

          try {
            const apartmentResult = await keyService.assignApartment(savedKey.id, apartmentId);

            // Uppdatera savedKey med senaste versionen som har lägenhet kopplad
            savedKey = await keyService.getKeyById(savedKey.id);
          } catch (apartmentError) {

          }
        } else if (!apartmentId && currentApartmentId) {

          try {
            const apartmentRemovalResult = await keyService.removeApartment(savedKey.id);
           // Uppdatera savedKey efter borttagning
            savedKey = await keyService.getKeyById(savedKey.id);
          } catch (removalError) {
            console.error('Fel vid borttagning av lägenhet:', removalError);
          }
        }
        
        // Uppdatera hyresgäst (efter lägenhet) om nödvändigt
        const currentTenantId = (selectedKey.tenant && selectedKey.tenant.id) || null;
        
        if (tenantId && tenantId !== currentTenantId) {
          try {
            const tenantResult = await keyService.assignTenant(savedKey.id, tenantId);
          } catch (tenantError) {
            console.error('Fel vid tilldelning av hyresgäst:', tenantError);
          }
        } else if (!tenantId && currentTenantId) {
          try {
            const tenantRemovalResult = await keyService.removeTenant(savedKey.id);
          } catch (removalError) {
          }
        }
      } else {
        try {
          savedKey = await keyService.createKey(keyData);
        } catch (createError) {
          console.error('Fel vid skapande av nyckel:', createError);
          throw createError;
        }
        
        // Utför tilldelning av relationer sekventiellt istället för parallellt
        
        // Steg 1: Tilldela lägenhet först (om det finns)
        if (apartmentId) {
          try {
            const apartmentResult = await keyService.assignApartment(savedKey.id, apartmentId);         // Uppdatera savedKey med senaste versionen som har lägenhet kopplad
            savedKey = await keyService.getKeyById(savedKey.id);
          } catch (apartmentError) {
          }
        }
        
        // Steg 2: Tilldela hyresgäst efter att lägenhet har tilldelats (om det finns)
        if (tenantId) {
          try {
            const tenantResult = await keyService.assignTenant(savedKey.id, tenantId);
          } catch (tenantError) {
            console.error('Fel vid tilldelning av hyresgäst till ny nyckel:', tenantError);
          }
        }
      }
      
      await fetchInitialData();
      setIsModalOpen(false);
      setSelectedKey(null);
      
    } catch (error) {
      console.error('Error saving key:', error);
      setError(error.response?.data?.message || 'Kunde inte spara nyckeln. Försök igen senare.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (key) => {
    
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

  // Få unika städer från lägenheter (för filteralternativ)
  const uniqueCities = [...new Set(apartments.map(apt => apt.city).filter(Boolean))].sort();

  // Hantera export till SQL
  const handleExportToSql = async () => {
    try {
      setIsExporting(true);
      await keyService.exportToSql();
    } catch (error) {
      console.error('Fel vid export till SQL:', error);
      setError(`${t('keys.messages.exportError')}: ${error.message}`);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Title level="h1">
          {t('keys.title')}
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            {t('common.filters')}
          </button>
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
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('keys.addNew')}
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
            {/* Nyckeltyp Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('keys.fields.type')}
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                <option value="D">{t('keys.types.D')}</option>
                <option value="P">{t('keys.types.P')}</option>
                <option value="T">{t('keys.types.T')}</option>
                <option value="F">{t('keys.types.F')}</option>
                <option value="G">{t('keys.types.G')}</option>
                <option value="HN">{t('keys.types.HN')}</option>
                <option value="Ö">{t('keys.types.Ö')}</option>
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
            
            {/* Lägenhet Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('keys.fields.apartment')}
              </label>
              <select
                name="apartmentId"
                value={filters.apartmentId}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                {apartments.map(apartment => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.street} {apartment.number}{apartment.apartmentNumber ? `, LGH ${apartment.apartmentNumber}` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Hyresgäst Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('keys.fields.tenant')}
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
              {filteredKeys.length} {t('keys.filteredResults', { count: filteredKeys.length })}
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="text-center py-4 text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredKeys}
          onEdit={handleEdit}
          rowClassName={() => "cursor-pointer"}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedKey ? t('keys.edit') : t('keys.addNew')}
        onSubmit={handleSubmit}
        showFooter={false}
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
        
        <div className="flex justify-between gap-4 mt-6">
          <div>
            {selectedKey && (
              <button
                type="button"
                onClick={() => handleDelete(selectedKey)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                {t('common.delete')}
              </button>
            )}
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary dark:bg-primary dark:hover:bg-secondary"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('common.cancel')}
            </button>
          </div>
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