import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { apartmentService, tenantService, keyService } from '../services';

const Apartments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState(null);
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

  const columns = [
    { key: 'street', label: 'Gata' },
    { key: 'number', label: 'Nummer' },
    { key: 'apartmentNumber', label: 'LGH' },
    { key: 'city', label: 'Stad' },
    { key: 'rooms', label: 'Rum' },
    { key: 'area', label: 'Yta (m²)' },
    { key: 'price', label: 'Hyra (kr)', render: (value) => `${value} kr` },
    {
      key: 'tenants',
      label: 'Hyresgäster',
      render: (tenantIds) => {
        if (!tenantIds || tenantIds.length === 0) return '-';
        return tenantIds.map(id => {
          const tenant = tenants.find(t => t.id === id);
          return tenant ? `${tenant.firstName} ${tenant.lastName}` : '';
        }).filter(Boolean).join(', ') || '-';
      }
    },
    {
      key: 'keys',
      label: 'Nycklar',
      render: (keyIds) => {
        if (!keyIds || keyIds.length === 0) return '-';
        return keyIds.map(id => {
          const key = keys.find(k => k.id === id);
          return key ? `${key.type} (${key.serie}-${key.number})` : '';
        }).filter(Boolean).join(', ') || '-';
      }
    },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
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
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({
        ...prev,
        [name]: selectedOptions,
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
      let { tenantIds, keyIds, ...apartmentData } = formData;
      // Säkerställ att vi har giltiga arrayer och filtrera bort eventuella falsy-värden (null, undefined, etc.)
      tenantIds = (tenantIds || []).filter(Boolean);
      keyIds = (keyIds || []).filter(Boolean);
      
      let savedApartment;
      
      if (selectedApartment) {
        // Uppdatera grundläggande information om lägenheten
        savedApartment = await apartmentService.updateApartment(selectedApartment.id, apartmentData);
        
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
    setSelectedApartment(apartment);
    setFormData({
      ...apartment,
      tenantIds: apartment.tenants?.map(t => t.id) || [],
      keyIds: apartment.keys?.map(k => k.id) || [],
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

      <DataTable
        columns={columns}
        data={apartments}
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
                name="tenantIds"
                value={formData.tenantIds}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {`${tenant.firstName} ${tenant.lastName}`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Håll ner Ctrl (Windows) eller Cmd (Mac) för att välja flera
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nycklar
              </label>
              <select
                multiple
                name="keyIds"
                value={formData.keyIds}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                {keys.map((key) => (
                  <option key={key.id} value={key.id}>
                    {`${key.type} - ${key.serie}-${key.number}`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Håll ner Ctrl (Windows) eller Cmd (Mac) för att välja flera
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