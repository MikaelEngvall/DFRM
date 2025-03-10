import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { userService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';

const Staff = () => {
  const { t } = useLocale();
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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
      label: t('staff.fields.firstName')
    },
    {
      key: 'lastName',
      label: t('staff.fields.lastName')
    },
    {
      key: 'email',
      label: t('staff.fields.email')
    },
    {
      key: 'role',
      label: t('staff.fields.role')
    },
    {
      key: 'active',
      label: t('staff.fields.active'),
      render: (active) => active ? t('common.yes') : t('common.no')
    },
    {
      key: 'lastLogin',
      label: t('staff.fields.lastLogin'),
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching users:', err);
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
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, formData);
      } else {
        await userService.createUser(formData);
      }
      
      await fetchUsers();
      setIsModalOpen(false);
      setSelectedUser(null);
      resetForm();
    } catch (err) {
      setError(t('staff.messages.saveError'));
      console.error('Error saving user:', err);
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

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '', // Lösenord visas inte vid redigering
      role: user.role || 'USER',
      active: user.active !== undefined ? user.active : true
    });
    setIsModalOpen(true);
  };

  const handleDelete = (user) => {
    // Förhindra att radera sig själv
    if (user.id === currentUser?.id) {
      setError(t('staff.messages.cannotDeleteSelf'));
      return;
    }
    
    setUserToDelete(user);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(userToDelete.id);
      await fetchUsers();
      setIsAlertOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(t('staff.messages.deleteError'));
      console.error('Error deleting user:', err);
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
          {t('navigation.staff')}
        </h1>
        {isAdmin() && (
          <button
            onClick={() => {
              resetForm();
              setSelectedUser(null);
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
        data={users}
        isLoading={isLoading}
        onEdit={isAdmin() ? handleEdit : undefined}
        onDelete={isAdmin() ? handleDelete : undefined}
      />
      
      {/* Modal för att lägga till/redigera personal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          resetForm();
        }}
        title={selectedUser ? t('staff.edit') : t('staff.add')}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('staff.fields.firstName')}
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            
            <FormInput
              label={t('staff.fields.lastName')}
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <FormInput
            label={t('staff.fields.email')}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          
          <FormInput
            label={t('staff.fields.password')}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required={!selectedUser}
            placeholder={selectedUser ? t('staff.leaveBlankToKeep') : ''}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('staff.fields.role')}
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="USER">{t('staff.roles.user')}</option>
              <option value="ADMIN">{t('staff.roles.admin')}</option>
              <option value="SUPERADMIN">{t('staff.roles.superadmin')}</option>
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
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {t('staff.fields.active')}
            </label>
          </div>
        </div>
      </Modal>
      
      {/* Bekräftelsemodal för radering */}
      <AlertModal
        isOpen={isAlertOpen}
        title={t('staff.delete.title')}
        message={t('staff.delete.message', { name: userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsAlertOpen(false);
          setUserToDelete(null);
        }}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default Staff; 