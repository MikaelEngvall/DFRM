import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
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
  const [formData, setFormData] = useState({
    type: '',
    serie: '',
    number: '',
    apartmentId: '',
    tenantId: '',
  });

  const columns = [
    { key: 'type', label: 'Typ' },
    { key: 'serie', label: 'Serie' },
    { key: 'number', label: 'Nummer' },
    { 
      key: 'apartment',
      label: 'Lägenhet',
      render: (value) => value ? `${value.street} ${value.number}, ${value.apartmentNumber}` : '-',
    },
    {
      key: 'tenant',
      label: 'Hyresgäst',
      render: (value) => value ? `${value.firstName} ${value.lastName}` : '-',
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
      setKeys(keysData);
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
      if (selectedKey) {
        await keyService.updateKey(selectedKey.id, formData);
      } else {
        await keyService.createKey(formData);
      }
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
    setSelectedKey(key);
    setFormData({
      ...key,
      apartmentId: key.apartment?.id || '',
      tenantId: key.tenant?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (key) => {
    if (window.confirm('Är du säker på att du vill ta bort denna nyckel?')) {
      try {
        await keyService.deleteKey(key.id);
        await fetchInitialData();
      } catch (err) {
        setError('Ett fel uppstod när nyckeln skulle tas bort');
        console.error('Error deleting key:', err);
      }
    }
  };

  const keyTypes = ['Huvudnyckel', 'Lägenhetsnyckel', 'Förrådsnyckel', 'Portnyckel'];

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
        onDelete={handleDelete}
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
                  <option key={type} value={type}>
                    {type}
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

          <div className="flex justify-end gap-4 mt-6">
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
        </form>
      </Modal>
    </div>
  );
};

export default Keys; 