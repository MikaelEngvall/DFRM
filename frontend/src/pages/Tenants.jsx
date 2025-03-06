import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';

const Tenants = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personnummer: '',
    phoneNumber: '',
    street: '',
    postalCode: '',
    city: '',
    movedInDate: '',
    resiliationDate: '',
    comment: '',
  });

  const columns = [
    { key: 'firstName', label: 'Förnamn' },
    { key: 'lastName', label: 'Efternamn' },
    { key: 'personnummer', label: 'Personnummer' },
    { key: 'phoneNumber', label: 'Telefon' },
    { key: 'movedInDate', label: 'Inflyttningsdatum' },
    {
      key: 'resiliationDate',
      label: 'Uppsägningsdatum',
      render: (value) => value || '-',
    },
  ];

  // Exempel på data (ersätt med API-anrop)
  const tenants = [
    {
      id: '1',
      firstName: 'Anna',
      lastName: 'Andersson',
      personnummer: '198501011234',
      phoneNumber: '0701234567',
      street: 'Storgatan 1',
      postalCode: '12345',
      city: 'Stockholm',
      movedInDate: '2023-01-01',
      resiliationDate: '',
      comment: 'Betalar hyran i tid',
    },
    // Fler hyresgäster...
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
    setSelectedTenant(null);
    setFormData({
      firstName: '',
      lastName: '',
      personnummer: '',
      phoneNumber: '',
      street: '',
      postalCode: '',
      city: '',
      movedInDate: '',
      resiliationDate: '',
      comment: '',
    });
  };

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant);
    setFormData(tenant);
    setIsModalOpen(true);
  };

  const handleDelete = (tenant) => {
    // Här implementerar vi API-anrop för att ta bort hyresgäst
    console.log('Delete tenant:', tenant);
  };

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

      <DataTable
        columns={columns}
        data={tenants}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTenant(null);
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
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Gata"
              name="street"
              value={formData.street}
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
              label="Inflyttningsdatum"
              name="movedInDate"
              type="date"
              value={formData.movedInDate}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Uppsägningsdatum"
              name="resiliationDate"
              type="date"
              value={formData.resiliationDate}
              onChange={handleInputChange}
            />
            <div className="sm:col-span-2">
              <FormInput
                label="Kommentar"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedTenant(null);
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
        </form>
      </Modal>
    </div>
  );
};

export default Tenants; 