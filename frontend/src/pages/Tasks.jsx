import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { taskService, apartmentService, tenantService, userService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const Tasks = () => {
  const { t } = useLocale();
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const queryParams = new URLSearchParams(location.search);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '',
    status: '',
    assignedToUserId: '',
    assignedByUserId: '',
    apartmentId: '',
    tenantId: '',
    comments: '',
    isRecurring: false,
    recurringPattern: '',
  });
  const [filters, setFilters] = useState({
    apartmentId: queryParams.get('apartmentId') || '',
    tenantId: queryParams.get('tenantId') || '',
    status: queryParams.get('status') || '',
    priority: queryParams.get('priority') || '',
  });

  const renderAssignedUser = (assignedUserId) => {
    if (!assignedUserId) return '-';
    const user = users.find(u => u.id === assignedUserId);
    return user ? `${user.firstName} ${user.lastName}` : '-';
  };

  const columns = [
    {
      key: 'title',
      label: t('tasks.fields.title')
    },
    {
      key: 'dueDate',
      label: t('tasks.fields.dueDate'),
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      key: 'priority',
      label: t('tasks.fields.priority'),
      render: (priority) => priority ? t(`tasks.priorities.${priority}`) : '-'
    },
    {
      key: 'status',
      label: t('tasks.fields.status'),
      render: (status) => status ? t(`tasks.status.${status}`) : '-'
    },
    {
      key: 'assignedToUserId',
      label: t('tasks.fields.assignedUser'),
      render: renderAssignedUser
    },
    {
      key: 'apartmentId',
      label: t('tasks.fields.apartment'),
      render: (apartmentId) => {
        if (!apartmentId) return '-';
        const apt = apartments.find(a => a.id === apartmentId);
        return apt ? `${apt.street} ${apt.number}, LGH ${apt.apartmentNumber}` : '-';
      }
    },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Hämta uppgifter med filter
      const tasksData = await taskService.getAllTasks(filters);
      
      // Hämta referensdata för att visa detaljer
      const [apartmentsData, tenantsData, usersData] = await Promise.all([
        apartmentService.getAllApartments(),
        tenantService.getAllTenants(),
        userService.getAllUsers(),
      ]);
      
      setTasks(tasksData);
      setApartments(apartmentsData);
      setTenants(tenantsData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching initial data:', err);
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
      // Skapa en kopia av formData med aktuell användare som assignedBy för nya uppgifter
      const taskData = { ...formData };
      
      // Logga data som skickas till servern för felsökning
      console.log('Skickar uppgiftsdata till servern:', taskData);
      
      if (!selectedTask) {
        // För ny uppgift, sätt automatiskt assignedByUserId till aktuell användare
        taskData.assignedByUserId = currentUser.id;
      }
      
      // Säkerställ att tenantId och apartmentId är strängar, inte objekt
      if (taskData.tenantId && typeof taskData.tenantId === 'object') {
        taskData.tenantId = taskData.tenantId.id;
      }
      
      if (taskData.apartmentId && typeof taskData.apartmentId === 'object') {
        taskData.apartmentId = taskData.apartmentId.id;
      }
      
      if (selectedTask) {
        // För existerande uppgift, uppdatera återkommande mönster om det har ändrats
        if (selectedTask.isRecurring !== taskData.isRecurring || 
            selectedTask.recurringPattern !== taskData.recurringPattern) {
          await taskService.updateRecurringPattern(selectedTask.id, taskData.recurringPattern);
        }
        await taskService.updateTask(selectedTask.id, taskData);
      } else {
        // För ny uppgift, skapa normal eller återkommande beroende på valet
        if (taskData.isRecurring && taskData.recurringPattern) {
          await taskService.createRecurringTask(taskData);
        } else {
          await taskService.createTask(taskData);
        }
      }
      
      await fetchInitialData();
      setIsModalOpen(false);
      setSelectedTask(null);
      resetForm();
    } catch (err) {
      setError(selectedTask ? t('tasks.messages.saveError') : t('tasks.messages.saveError'));
      console.error('Error saving task:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: '',
      status: '',
      assignedToUserId: '',
      assignedByUserId: '',
      apartmentId: '',
      tenantId: '',
      comments: '',
      isRecurring: false,
      recurringPattern: '',
    });
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    
    // Extrahera ID från objekt om det behövs
    const assignedToUserId = task.assignedToUserId || '';
    
    const apartmentId = task.apartmentId ? 
      (typeof task.apartmentId === 'object' ? task.apartmentId.id : task.apartmentId) : '';
    
    const tenantId = task.tenantId ? 
      (typeof task.tenantId === 'object' ? task.tenantId.id : task.tenantId) : '';
    
    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || '',
      status: task.status || '',
      assignedToUserId,
      assignedByUserId: task.assignedByUserId || '',
      apartmentId,
      tenantId,
      comments: task.comments || '',
      isRecurring: task.isRecurring || false,
      recurringPattern: task.recurringPattern || '',
    });
    
    setIsModalOpen(true);
  };

  const handleDelete = (task) => {
    setTaskToDelete(task);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await taskService.deleteTask(taskToDelete.id);
      await fetchInitialData();
      setIsAlertOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      setError(t('tasks.messages.deleteError'));
      console.error('Error deleting task:', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      await fetchInitialData();
    } catch (err) {
      setError(t('tasks.messages.statusUpdateError'));
      console.error('Error updating task status:', err);
    }
  };

  // Hantera filterändringar
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Applicera filter och uppdatera URL
  const applyFilters = () => {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });
    
    navigate(`/tasks?${searchParams.toString()}`);
    fetchInitialData();
  };

  // Rensa filter
  const clearFilters = () => {
    setFilters({
      apartmentId: '',
      tenantId: '',
      status: '',
      priority: '',
    });
    navigate('/tasks');
    fetchInitialData();
  };

  const handleRowClick = (task) => {
    handleEdit(task);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-cinzel dark:text-white">
          {t('tasks.title')}
        </h1>
        <button
          onClick={() => {
            resetForm();
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('tasks.add')}
        </button>
      </div>
      
      {/* Filtersektion */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('common.filters')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tasks.filters.apartment')}
            </label>
            <select
              name="apartmentId"
              value={filters.apartmentId}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">{t('common.all')}</option>
              {apartments.map((apartment) => (
                <option key={apartment.id} value={apartment.id}>
                  {apartment.street} {apartment.number}, LGH {apartment.apartmentNumber}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tasks.filters.tenant')}
            </label>
            <select
              name="tenantId"
              value={filters.tenantId}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">{t('common.all')}</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.firstName} {tenant.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tasks.filters.status')}
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">{t('common.all')}</option>
              <option value="PENDING">{t('tasks.status.PENDING')}</option>
              <option value="IN_PROGRESS">{t('tasks.status.IN_PROGRESS')}</option>
              <option value="COMPLETED">{t('tasks.status.COMPLETED')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tasks.filters.priority')}
            </label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">{t('common.all')}</option>
              <option value="LOW">{t('tasks.priorities.LOW')}</option>
              <option value="MEDIUM">{t('tasks.priorities.MEDIUM')}</option>
              <option value="HIGH">{t('tasks.priorities.HIGH')}</option>
              <option value="URGENT">{t('tasks.priorities.URGENT')}</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setFilters({
                apartmentId: '',
                tenantId: '',
                status: '',
                priority: '',
              });
              clearFilters();
            }}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md"
          >
            {t('common.clear')}
          </button>
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            {t('common.apply')}
          </button>
        </div>
      </div>
      
      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />
      
      {/* Modalform för att lägga till/redigera uppgifter */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
          resetForm();
        }}
        title={selectedTask ? t('tasks.edit') : t('tasks.add')}
        onSubmit={handleSubmit}
        submitButtonText={t('common.save')}
      >
        <div className="grid grid-cols-1 gap-4">
          <FormInput
            label={t('tasks.fields.title')}
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tasks.fields.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('tasks.fields.dueDate')}
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.fields.priority')}
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">{t('common.select')}</option>
                <option value="LOW">{t('tasks.priorities.LOW')}</option>
                <option value="MEDIUM">{t('tasks.priorities.MEDIUM')}</option>
                <option value="HIGH">{t('tasks.priorities.HIGH')}</option>
                <option value="URGENT">{t('tasks.priorities.URGENT')}</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.fields.status')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">{t('common.select')}</option>
                <option value="PENDING">{t('tasks.status.PENDING')}</option>
                <option value="IN_PROGRESS">{t('tasks.status.IN_PROGRESS')}</option>
                <option value="COMPLETED">{t('tasks.status.COMPLETED')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.fields.assignedUser')}
              </label>
              <select
                name="assignedToUserId"
                value={formData.assignedToUserId}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.select')}</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedTask && formData.assignedByUserId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tasks.fields.assignedBy')}
                </label>
                <div className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700">
                  {users.find(user => user.id === formData.assignedByUserId)?.firstName || ''} {users.find(user => user.id === formData.assignedByUserId)?.lastName || ''} 
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.fields.apartment')}
              </label>
              <select
                name="apartmentId"
                value={formData.apartmentId}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.select')}</option>
                {apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.street} {apartment.number}, LGH {apartment.apartmentNumber}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.fields.tenant')}
              </label>
              <select
                name="tenantId"
                value={formData.tenantId}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.select')}</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.firstName} {tenant.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tasks.fields.comments')}
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="2"
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="isRecurring"
              name="isRecurring"
              type="checkbox"
              checked={formData.isRecurring}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              {t('tasks.fields.isRecurring')}
            </label>
          </div>
          
          {formData.isRecurring && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.fields.recurringPattern')}
              </label>
              <select
                name="recurringPattern"
                value={formData.recurringPattern}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required={formData.isRecurring}
              >
                <option value="">{t('common.select')}</option>
                <option value="DAILY">{t('tasks.recurringPatterns.DAILY')}</option>
                <option value="WEEKLY">{t('tasks.recurringPatterns.WEEKLY')}</option>
                <option value="BIWEEKLY">{t('tasks.recurringPatterns.BIWEEKLY')}</option>
                <option value="MONTHLY">{t('tasks.recurringPatterns.MONTHLY')}</option>
                <option value="QUARTERLY">{t('tasks.recurringPatterns.QUARTERLY')}</option>
                <option value="YEARLY">{t('tasks.recurringPatterns.YEARLY')}</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('tasks.recurringPatternHelp')}
              </p>
            </div>
          )}
        </div>
      </Modal>
      
      {/* Bekräftelsemodal för borttagning */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={confirmDelete}
        title={t('tasks.confirmDelete')}
        message={`${t('tasks.confirmDelete')} "${taskToDelete?.title}"?`}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default Tasks; 