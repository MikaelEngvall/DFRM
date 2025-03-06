import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { tenantService } from '../services';

const Tenants = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const data = await tenantService.getAllTenants();
      setTenants(data);
      setError(null);
    } catch (err) {
      setError('Ett fel uppstod när hyresgästerna skulle hämtas');
      console.error('Error fetching tenants:', err);
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
      if (selectedTenant) {
        await tenantService.updateTenant(selectedTenant.id, formData);
      } else {
        await tenantService.createTenant(formData);
      }
      await fetchTenants();
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
    } catch (err) {
      setError('Ett fel uppstod när hyresgästen skulle sparas');
      console.error('Error saving tenant:', err);
    }
  };

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant);
    setFormData(tenant);
    setIsModalOpen(true);
  };

  const handleDelete = async (tenant) => {
    if (window.confirm('Är du säker på att du vill ta bort denna hyresgäst?')) {
      try {
        await tenantService.deleteTenant(tenant.id);
        await fetchTenants();
      } catch (err) {
        setError('Ett fel uppstod när hyresgästen skulle tas bort');
        console.error('Error deleting tenant:', err);
      }
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
        onDelete={handleDelete}
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
            phoneNumber: '',
            street: '',
            postalCode: '',
            city: '',
            movedInDate: '',
            resiliationDate: '',
            comment: '',
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