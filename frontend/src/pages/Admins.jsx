import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { adminService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';

const Admins = () => {
  const { t } = useLocale();
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER',
    active: true
  });

  const columns = [
    {
      key: 'firstName',
      label: t('admins.fields.firstName')
    },
    {
      key: 'lastName',
      label: t('admins.fields.lastName')
    },
    {
      key: 'email',
      label: t('admins.fields.email')
    },
    {
      key: 'role',
      label: t('admins.fields.role')
    },
    {
      key: 'active',
      label: t('admins.fields.active'),
      render: (active) => active ? t('common.yes') : t('common.no')
    },
    {
      key: 'lastLogin',
      label: t('admins.fields.lastLogin'),
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    }
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllAdmins();
      setAdmins(data);
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching admins:', err);
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
      if (selectedAdmin) {
        await adminService.updateAdmin(selectedAdmin.id, formData);
      } else {
        await adminService.createAdmin(formData);
      }
      
      await fetchAdmins();
      setIsModalOpen(false);
      setSelectedAdmin(null);
      resetForm();
    } catch (err) {
      setError(t('admins.messages.saveError'));
      console.error('Error saving admin:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'USER',
      active: true
    });
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      email: admin.email || '',
      password: '', // Lösenord visas inte vid redigering
      role: admin.role || 'USER',
      active: admin.active !== undefined ? admin.active : true
    });
    setIsModalOpen(true);
  };

  const handleDelete = (admin) => {
    // Förhindra att radera sig själv
    if (admin.id === currentUser?.id) {
      setError(t('admins.messages.cannotDeleteSelf'));
      return;
    }
    
    setAdminToDelete(admin);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await adminService.deleteAdmin(adminToDelete.id);
      await fetchAdmins();
      setIsAlertOpen(false);
      setAdminToDelete(null);
    } catch (err) {
      setError(t('admins.messages.deleteError'));
      console.error('Error deleting admin:', err);
    }
  };

  const isAdmin = () => {
    return currentUser?.role === 'ADMIN';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('navigation.admins')}
        </h1>
        {isAdmin() && (
          <button
            onClick={() => {
              resetForm();
              setSelectedAdmin(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            <span>{t('common.add')}</span>
          </button>
        )}
      </div>
      
      <DataTable
        columns={columns}
        data={admins}
        isLoading={isLoading}
        onEdit={isAdmin() ? handleEdit : undefined}
        onDelete={isAdmin() ? handleDelete : undefined}
      />
      
      {/* Modal för att lägga till/redigera administratörer */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAdmin(null);
          resetForm();
        }}
        title={selectedAdmin ? t('admins.edit') : t('admins.add')}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('admins.fields.firstName')}
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            
            <FormInput
              label={t('admins.fields.lastName')}
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <FormInput
            label={t('admins.fields.email')}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          
          <FormInput
            label={t('admins.fields.password')}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required={!selectedAdmin}
            placeholder={selectedAdmin ? t('admins.leaveBlankToKeep') : ''}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('admins.fields.role')}
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="USER">{t('admins.roles.user')}</option>
              <option value="ADMIN">{t('admins.roles.admin')}</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              {t('admins.fields.active')}
            </label>
          </div>
        </div>
      </Modal>
      
      {/* Bekräftelsemodal för radering */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={confirmDelete}
        title={t('admins.confirmDelete')}
        message={`${t('admins.confirmDeleteMessage')} ${adminToDelete?.firstName} ${adminToDelete?.lastName}?`}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default Admins; 