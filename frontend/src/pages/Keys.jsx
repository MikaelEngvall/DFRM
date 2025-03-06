import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';

const Keys = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
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

  // Exempel på data (ersätt med API-anrop)
  const keys = [
    {
      id: '1',
      type: 'Huvudnyckel',
      serie: 'A123',
      number: '456',
      apartment: {
        street: 'Storgatan',
        number: '1',
        apartmentNumber: 'A101',
      },
      tenant: {
        firstName: 'Anna',
        lastName: 'Andersson',
      },
    },
    // Fler nycklar...
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Här implementerar vi API-anrop för att spara data
    console.log('Form data:', formData);
    setIsModalOpen(false);
    setSelectedKey(null);
    setFormData({
      type: '',
      serie: '',
      number: '',
      apartmentId: '',
      tenantId: '',
    });
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

  const handleDelete = (key) => {
    // Här implementerar vi API-anrop för att ta bort nyckel
    console.log('Delete key:', key);
  };

  // Exempel på data för select-listor (ersätt med API-anrop)
  const keyTypes = ['Huvudnyckel', 'Lägenhetsnyckel', 'Förrådsnyckel', 'Portnyckel'];
  const apartments = [
    { id: '1', label: 'Storgatan 1, A101' },
    { id: '2', label: 'Storgatan 1, A102' },
  ];
  const tenants = [
    { id: '1', label: 'Anna Andersson' },
    { id: '2', label: 'Erik Eriksson' },
  ];

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
                    {apartment.label}
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
                    {tenant.label}
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