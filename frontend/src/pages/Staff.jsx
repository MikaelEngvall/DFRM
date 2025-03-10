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
  const { user: currentUser, hasRole } = useAuth();
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
    phoneNumber: '',
    password: '',
    role: 'USER',
    active: true
  });

  // Hjälpfunktioner för att hantera rollprefix
  const stripRolePrefix = (role) => {
    return role?.startsWith('ROLE_') ? role.substring(5) : role;
  };
  
  const addRolePrefix = (role) => {
    return role?.startsWith('ROLE_') ? role : `ROLE_${role}`;
  };

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
      key: 'phoneNumber',
      label: t('staff.fields.phone'),
      render: (phoneNumber) => {
        // Om telefonnumret saknas, visa ett streck
        if (!phoneNumber) return '-';
        
        // Skapa en klickbar länk för att ringa numret
        return (
          <a href={`tel:${phoneNumber}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {phoneNumber}
          </a>
        );
      }
    },
    {
      key: 'active',
      label: t('staff.fields.active'),
      render: (active) => active ? t('common.yes') : t('common.no')
    },
    {
      key: 'lastLoginAt',
      label: t('staff.fields.lastLogin'),
      render: (lastLoginAt, user) => {
        // Logga datumet för felsökning
        console.log(`Rendering lastLoginAt for ${user.email}:`, lastLoginAt);
        
        if (!lastLoginAt) return '-';
        
        try {
          let date;
          
          // Kontrollera om lastLoginAt är en array (från Java LocalDateTime)
          if (Array.isArray(lastLoginAt) && lastLoginAt.length === 7) {
            // Format: [år, månad(0-baserad i JS), dag, timme, minut, sekund, nanosekund]
            // Notera: I Java är månader 1-baserade, men i JavaScript är de 0-baserade
            const [year, month, day, hour, minute, second] = lastLoginAt;
            date = new Date(year, month - 1, day, hour, minute, second);
          } else {
            // Fallback till vanlig date-parsing
            date = new Date(lastLoginAt);
          }
          
          // Kontrollera om datumet är giltigt
          if (isNaN(date.getTime())) {
            console.error('Invalid date format:', lastLoginAt);
            return '-';
          }
          
          // Formatera till "Mars 10 21:29"
          const options = {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          };
          
          return new Intl.DateTimeFormat('sv-SE', options).format(date);
        } catch (e) {
          console.error('Error formatting date:', e, lastLoginAt);
          return '-';
        }
      }
    }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      
      // Om användaren är USER, visa bara deras egen information
      if (hasRole('USER')) {
        const filteredData = data.filter(u => u.id === currentUser.id);
        setUsers(filteredData);
      } else {
        setUsers(data);
      }
      
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
      const formDataToSubmit = {...formData};
      
      // USER kan inte ändra sin roll eller aktiv-status
      if (hasRole('USER')) {
        formDataToSubmit.role = currentUser.role;
        formDataToSubmit.active = currentUser.active;
      } else {
        formDataToSubmit.role = addRolePrefix(formData.role);
      }
      
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, formDataToSubmit);
      } else {
        await userService.createUser(formDataToSubmit);
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
      phoneNumber: '',
      password: '',
      role: 'USER',
      active: true
    });
  };

  const handleEdit = (user) => {
    // USER kan bara redigera sin egen profil
    if (hasRole('USER') && user.id !== currentUser.id) {
      return;
    }

    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      password: '',
      role: stripRolePrefix(user.role) || 'USER',
      active: user.active !== undefined ? user.active : true
    });
    setIsModalOpen(true);
  };
  
  const handleAddUser = () => {
    resetForm();
    setSelectedUser(null);
    setIsModalOpen(true);
  };
  
  const handleToggleActive = async (user, newActiveState) => {
    try {
      await userService.updateUser(user.id, { ...user, active: newActiveState });
      await fetchUsers();
    } catch (err) {
      setError(t('staff.messages.saveError'));
      console.error('Error toggling user active state:', err);
    }
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
  
  const isSuperAdmin = () => {
    return stripRolePrefix(currentUser?.role) === 'SUPERADMIN';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-cinzel dark:text-white">
          {t('navigation.staff')}
        </h1>
        {!hasRole('USER') && (
          <button
            onClick={handleAddUser}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('staff.add')}
          </button>
        )}
      </div>
      
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        onRowClick={handleEdit}
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
            disabled={hasRole('USER')}
          />
          
          <FormInput
            label={t('staff.fields.phoneNumber')}
            name="phoneNumber"
            type="text"
            value={formData.phoneNumber}
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
            placeholder={selectedUser ? t('staff.fields.leaveBlankToKeep') : ''}
          />
          
          {!hasRole('USER') && (
            <>
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
                  <option value="USER">{t('staff.roles.USER')}</option>
                  <option value="ADMIN">{t('staff.roles.ADMIN')}</option>
                  {isSuperAdmin() && (
                    <option value="SUPERADMIN">{t('staff.roles.SUPERADMIN')}</option>
                  )}
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
            </>
          )}
        </div>
      </Modal>
      
      {/* Bekräftelsemodal för radering */}
      <AlertModal
        isOpen={isAlertOpen}
        title={t('staff.confirmDelete')}
        message={t('staff.deleteMessage', { 
          firstName: userToDelete ? userToDelete.firstName : '', 
          lastName: userToDelete ? userToDelete.lastName : ''
        })}
        onClose={() => {
          setIsAlertOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default Staff; 