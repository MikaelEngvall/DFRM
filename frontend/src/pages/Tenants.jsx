import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { tenantService, apartmentService, keyService } from '../services';
import { formatShortDate, formatDateForInput } from '../utils/formatters';

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

const Tenants = () => {
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
    phone: '',
    street: '',
    postalCode: '',
    city: '',
    movedInDate: '',
    resiliationDate: '',
    comment: '',
    apartmentId: '',
    keyId: '',
  });

  // Hjälpfunktion för att kontrollera om en hyresgäst har lägenhet
  const hasTenantApartment = (tenant) => {
    // Kontrollera om apartment finns som objekt eller ID
    return Boolean(tenant.apartment); // Detta returnerar false för null, undefined och tomma strängar
  };

  const columns = [
    { key: 'firstName', label: 'Förnamn' },
    { key: 'lastName', label: 'Efternamn' },
    { key: 'phone', label: 'Telefon' },
    { 
      key: 'status', 
      label: 'Status',
      render: (_, tenant) => hasTenantApartment(tenant) ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Boende
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Ej boende
        </span>
      )
    },
    {
      key: 'movedInDate',
      label: 'IN',
      render: (value) => formatShortDate(value)
    },
    {
      key: 'resiliationDate',
      label: 'UPS',
      render: (value) => formatShortDate(value)
    },
    {
      key: 'apartment',
      label: 'Lägenhet',
      render: (apartmentId) => {
        if (!apartmentId) return '-';
        const apartment = apartments.find(a => a.id === apartmentId);
        return apartment 
          ? `${apartment.street} ${apartment.number}, LGH ${apartment.apartmentNumber}` 
          : '-';
      }
    },
    {
      key: 'key',
      label: 'Nyckel',
      render: (keyId) => {
        if (!keyId) return '-';
        const key = keys.find(k => k.id === keyId);
        return key 
          ? `${renderKeyType(key.type)} (${key.serie}-${key.number})` 
          : '-';
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
      let { apartmentId, keyId, ...tenantData } = formData;
      
      // Säkerställ att vi har giltiga värden
      apartmentId = apartmentId || null;
      keyId = keyId || null;
      
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
        
        // Hantera lägenhet och nyckel separat efter att hyresgästen har uppdaterats
        const updateOperations = [];
        
        // Hantera lägenhet
        const currentApartmentId = selectedTenant?.apartment?.id || null;
        if (apartmentId && apartmentId !== currentApartmentId) {
          updateOperations.push(tenantService.assignApartment(savedTenant.id, apartmentId));
        } else if (!apartmentId && currentApartmentId) {
          updateOperations.push(tenantService.removeApartment(savedTenant.id));
        }
        
        // Hantera nyckel
        const currentKeyId = selectedTenant?.key?.id || null;
        if (keyId && keyId !== currentKeyId) {
          updateOperations.push(tenantService.assignKey(savedTenant.id, keyId));
        } else if (!keyId && currentKeyId) {
          updateOperations.push(tenantService.removeKey(savedTenant.id));
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
        
        // Tilldela nyckel om vald
        if (keyId) {
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
        phone: '',
        street: '',
        postalCode: '',
        city: '',
        movedInDate: '',
        resiliationDate: '',
        comment: '',
        apartmentId: '',
        keyId: '',
      });
    } catch (err) {
      setError('Ett fel uppstod när hyresgästen skulle sparas');
      console.error('Error saving tenant:', err);
    }
  };

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      ...tenant,
      apartmentId: tenant.apartment?.id || '',
      keyId: tenant.key?.id || '',
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
        phone: '',
        street: '',
        postalCode: '',
        city: '',
        movedInDate: '',
        resiliationDate: '',
        comment: '',
        apartmentId: '',
        keyId: '',
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
        <h1 className="text-3xl font-cinzel">Hyresgäster</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Lägg till hyresgäst
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
            phone: '',
            street: '',
            postalCode: '',
            city: '',
            movedInDate: '',
            resiliationDate: '',
            comment: '',
            apartmentId: '',
            keyId: '',
          });
        }}
        title={selectedTenant ? 'Redigera hyresgäst' : 'Lägg till hyresgäst'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Förnamn"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Efternamn"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Personnummer"
              name="personnummer"
              value={formData.personnummer}
              onChange={handleInputChange}
              placeholder="ÅÅÅÅMMDDXXXX"
              required
            />
            <FormInput
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="IN"
              name="movedInDate"
              type="date"
              value={formatDateForInput(formData.movedInDate)}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="UPS"
              name="resiliationDate"
              type="date"
              value={formatDateForInput(formData.resiliationDate)}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lägenhet
              </label>
              <select
                name="apartmentId"
                value={formData.apartmentId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">Ingen lägenhet</option>
                {apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {`${apartment.street} ${apartment.number}, ${apartment.apartmentNumber}`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                En hyresgäst kan endast vara kopplad till en lägenhet, men en lägenhet kan ha flera hyresgäster.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nyckel
              </label>
              <select
                name="keyId"
                value={formData.keyId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">Ingen nyckel</option>
                {keys.map((key) => (
                  <option key={key.id} value={key.id}>
                    {`${renderKeyType(key.type)} - ${key.serie}-${key.number}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <FormInput
                label="Kommentar"
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
                  setSelectedTenant(null);
                  setFormData({
                    firstName: '',
                    lastName: '',
                    personnummer: '',
                    phone: '',
                    street: '',
                    postalCode: '',
                    city: '',
                    movedInDate: '',
                    resiliationDate: '',
                    comment: '',
                    apartmentId: '',
                    keyId: '',
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
                {selectedTenant ? 'Spara ändringar' : 'Lägg till'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={confirmDelete}
        title="Ta bort hyresgäst"
        message={tenantToDelete ? `Är du säker på att du vill ta bort hyresgästen ${tenantToDelete.firstName} ${tenantToDelete.lastName}? Detta går inte att ångra.` : ''}
        confirmText="Ta bort"
        cancelText="Avbryt"
      />
    </div>
  );
};

export default Tenants; 