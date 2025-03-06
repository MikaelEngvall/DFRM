import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { apartmentService } from '../services';

const Apartments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setIsLoading(true);
      const data = await apartmentService.getAllApartments();
      setApartments(data);
      setError(null);
    } catch (err) {
      setError('Ett fel uppstod när lägenheterna skulle hämtas');
      console.error('Error fetching apartments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedApartment) {
        await apartmentService.updateApartment(selectedApartment.id, formData);
      } else {
        await apartmentService.createApartment(formData);
      }
      await fetchApartments();
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
    } catch (err) {
      setError('Ett fel uppstod när lägenheten skulle sparas');
      console.error('Error saving apartment:', err);
    }
  };

  const handleEdit = (apartment) => {
    setSelectedApartment(apartment);
    setFormData(apartment);
    setIsModalOpen(true);
  };

  const handleDelete = async (apartment) => {
    if (window.confirm('Är du säker på att du vill ta bort denna lägenhet?')) {
      try {
        await apartmentService.deleteApartment(apartment.id);
        await fetchApartments();
      } catch (err) {
        setError('Ett fel uppstod när lägenheten skulle tas bort');
        console.error('Error deleting apartment:', err);
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
        onDelete={handleDelete}
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