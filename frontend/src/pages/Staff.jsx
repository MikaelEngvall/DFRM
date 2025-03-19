import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import Title from '../components/Title';
import { PlusIcon } from '@heroicons/react/24/outline';
import { userService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';

const Staff = () => {
  const { t, availableLocales, currentLocale } = useLocale();
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
    active: true,
    preferredLanguage: currentLocale || 'sv'
  });

  // Hjälpfunktioner för att hantera rollprefix
  const stripRolePrefix = (role) => {
    return role?.startsWith('ROLE_') ? role.substring(5) : role;
  };
  
  const addRolePrefix = (role) => {
    return role?.startsWith('ROLE_') ? role : `ROLE_${role}`;
  };

  // Kontrollera om användaren endast har USER-rollen
  const isRegularUser = () => {
    return hasRole('USER') && !hasRole('ADMIN') && !hasRole('SUPERADMIN');
  };

  // Hjälpfunktioner för rollkontroll
  const isSuperAdmin = () => {
    return stripRolePrefix(currentUser?.role) === 'SUPERADMIN';
  };
  
  const isAdmin = () => {
    return stripRolePrefix(currentUser?.role) === 'ADMIN';
  };
  
  // Kontrollera om nuvarande användare får redigera given användare
  const canEditUser = (userToEdit) => {
    const targetRole = stripRolePrefix(userToEdit?.role);
    
    // SUPERADMIN kan redigera alla
    if (isSuperAdmin()) return true;
    
    // ADMIN kan inte redigera SUPERADMIN
    if (isAdmin() && targetRole === 'SUPERADMIN') return false;
    
    // Användare kan bara redigera sig själva
    if (isRegularUser() && userToEdit?.id !== currentUser?.id) return false;
    
    return true;
  };
  
  // Kontrollera om nuvarande användare får inaktivera given användare
  const canToggleActiveState = (userToToggle) => {
    const targetRole = stripRolePrefix(userToToggle?.role);
    
    // Ingen kan inaktivera sig själv
    if (userToToggle?.id === currentUser?.id) return false;
    
    // USER kan inte inaktivera någon
    if (isRegularUser()) return false;
    
    // ADMIN kan inte inaktivera SUPERADMIN
    if (isAdmin() && targetRole === 'SUPERADMIN') return false;
    
    // SUPERADMIN kan inaktivera alla utom sig själv
    return true;
  };
  
  // Kontrollera om användaren kan skapa användare med angiven roll
  const canCreateWithRole = (role) => {
    // USER kan inte skapa användare
    if (isRegularUser()) return false;
    
    // ADMIN kan inte skapa SUPERADMIN
    if (isAdmin() && role === 'SUPERADMIN') return false;
    
    // SUPERADMIN kan skapa alla typer
    return true;
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
      
      // Hämta alla användare - alla roller ser alla användare
      const data = await userService.getAllUsers();
       // Alla roller ser alla användare - vi filtrerar inte här
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
    
    // Kontrollera behörighet för att redigera användaren
    if (selectedUser && !canEditUser(selectedUser)) {
      setError(t('staff.messages.unauthorized'));
      return;
    }
    
    // Kontrollera behörighet för att skapa användare med angiven roll
    if (!selectedUser && !canCreateWithRole(formData.role)) {
      setError(t('staff.messages.unauthorized'));
      return;
    }
    
    try {
      // Kopiera formulärdata och lägg till ROLE_-prefix för rollen
      const formDataToSubmit = {...formData};
      formDataToSubmit.role = addRolePrefix(formData.role);
      
      // Om vanlig användare redigerar sin profil, behåll befintlig roll
      if (isRegularUser() && selectedUser) {
        formDataToSubmit.role = selectedUser.role;
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
      active: true,
      preferredLanguage: currentLocale || 'sv'
    });
  };

  const handleEdit = (user) => {
    // Kontrollera om användaren får redigera denna profil
    if (!canEditUser(user)) {
      setError(t('staff.messages.unauthorized'));
      return;
    }
    
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      password: '', // Lösenord visas inte vid redigering
      role: stripRolePrefix(user.role) || 'USER',
      active: user.active !== undefined ? user.active : true,
      preferredLanguage: user.preferredLanguage || currentLocale || 'sv'
    });
    setIsModalOpen(true);
  };
  
  const handleAddUser = () => {
    // Kontrollera om användaren får skapa nya användare
    if (isRegularUser()) {
      setError(t('staff.messages.unauthorized'));
      return;
    }
    
    resetForm();
    setSelectedUser(null);
    setIsModalOpen(true);
  };
  
  const handleToggleActive = async (user, newActiveState) => {
    // Kontrollera om användaren får ändra aktiveringsstatus för denna användare
    if (!canToggleActiveState(user)) {
      setError(t('staff.messages.unauthorized'));
      return;
    }
    
    try {
      await userService.updateUser(user.id, { ...user, active: newActiveState });
      await fetchUsers();
    } catch (err) {
      setError(t('staff.messages.saveError'));
      console.error('Error toggling user active state:', err);
    }
  };

  const handleDelete = (user) => {
    // Använd samma behörighetsregler som för redigering
    if (!canEditUser(user)) {
      setError(t('staff.messages.unauthorized'));
      return;
    }
    
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
  
  return (
    <div className="mx-auto p-4 bg-slate-800 min-h-screen">
      <Title level="h1" className="mb-4">
        {isRegularUser() ? t('staff.myProfile') : t('navigation.staff')}
      </Title>
      
      {/* Felmeddelande */}
      {error && (
        <div className="bg-red-600 text-white p-3 mb-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        {/* Visa bara "Lägg till" knappen om användaren inte är en vanlig användare */}
        {!isRegularUser() && (
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
        data={users} // Visa alla användare för alla roller
        isLoading={isLoading}
        onRowClick={(user) => {
          // Bara navigera till redigering om användaren har behörighet
          if (canEditUser(user)) {
            handleEdit(user);
          } else {
            setError(t('staff.messages.unauthorized'));
          }
        }}
        getRowClassName={(user) => {
          // Markera rader som användaren inte kan redigera
          return !canEditUser(user) ? 'opacity-70 cursor-not-allowed' : '';
        }}
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
            label={t('staff.fields.phone')}
            name="phoneNumber"
            type="text"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
          />
          
          {/* Lägg till språkval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('staff.fields.preferredLanguage')}
            </label>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {Object.entries(availableLocales).map(([code, locale]) => (
                <option key={code} value={code}>
                  {locale.name}
                </option>
              ))}
            </select>
          </div>
          
          <FormInput
            label={t('staff.fields.password')}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required={!selectedUser}
            placeholder={selectedUser ? t('staff.fields.leaveBlankToKeep') : ''}
          />
          
          {/* Visa inte rollfältet för vanliga användare */}
          {!isRegularUser() && (
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
          )}
          
          {/* Visa inte aktiv-checkboxen för vanliga användare */}
          {!isRegularUser() && (
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
          )}
          
          {/* Visa aktivera/inaktivera-knappar endast om användaren har behörighet */}
          {selectedUser && canToggleActiveState(selectedUser) && (
            <div className="mt-4 border-t pt-4">
              <div className="flex flex-col space-y-3">
                <h3 className="text-lg font-medium">{t('staff.activeStatus')}</h3>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleActive(selectedUser, true);
                      setFormData(prev => ({ ...prev, active: true }));
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      formData.active 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t('staff.actions.activate')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleActive(selectedUser, false);
                      setFormData(prev => ({ ...prev, active: false }));
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      !formData.active 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t('staff.actions.deactivate')}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.active 
                    ? t('staff.activeStatusDescription') 
                    : t('staff.inactiveStatusDescription')}
                </p>
              </div>
            </div>
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