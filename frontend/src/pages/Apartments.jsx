import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';

const Apartments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
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
  });

  const columns = [
    { key: 'street', label: 'Gata' },
    { key: 'number', label: 'Nummer' },
    { key: 'apartmentNumber', label: 'Lägenhetsnummer' },
    { key: 'city', label: 'Stad' },
    { key: 'rooms', label: 'Rum' },
    { key: 'area', label: 'Yta (m²)' },
    { key: 'price', label: 'Hyra (kr)', render: (value) => `${value} kr` },
  ];

  // Exempel på data (ersätt med API-anrop)
  const apartments = [
    {
      id: '1',
      street: 'Storgatan',
      number: '1',
      apartmentNumber: 'A101',
      postalCode: '12345',
      city: 'Stockholm',
      rooms: 3,
      area: 75,
      price: 8500,
      electricity: true,
      storage: true,
      internet: true,
    },
    // Fler lägenheter...
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Här implementerar vi API-anrop för att spara data
    console.log('Form data:', formData);
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
    });
  };

  const handleEdit = (apartment) => {
    setSelectedApartment(apartment);
    setFormData(apartment);
    setIsModalOpen(true);
  };

  const handleDelete = (apartment) => {
    // Här implementerar vi API-anrop för att ta bort lägenhet
    console.log('Delete apartment:', apartment);
  };

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

      <DataTable
        columns={columns}
        data={apartments}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApartment(null);
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
              label="Lägenhetsnummer"
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

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedApartment(null);
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
        </form>
      </Modal>
    </div>
  );
};

export default Apartments; 