import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { PlusIcon } from '@heroicons/react/24/outline';
import { taskService, apartmentService, tenantService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const Tasks = () => {
  const { t } = useLocale();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const queryParams = new URLSearchParams(location.search);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [admins, setAdmins] = useState([]);
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
    assignedUserId: '',
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
      key: 'assignedUser',
      label: t('tasks.fields.assignedUser'),
      render: (assignedUser) => {
        if (!assignedUser) return '-';
        const admin = admins.find(a => a.id === (typeof assignedUser === 'object' ? assignedUser.id : assignedUser));
        return admin ? `${admin.firstName} ${admin.lastName}` : '-';
      }
    },
    {
      key: 'apartment',
      label: t('tasks.fields.apartment'),
      render: (apartment) => {
        if (!apartment) return '-';
        const apt = apartments.find(a => a.id === (typeof apartment === 'object' ? apartment.id : apartment));
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
      const [apartmentsData, tenantsData, adminsData] = await Promise.all([
        apartmentService.getAllApartments(),
        tenantService.getAllTenants(),
        // Här behöver vi hämta admin-data också. Anpassa enligt ditt API
        // adminService.getAllAdmins(),
        Promise.resolve([]), // Tillfällig tom lista för admins
      ]);
      
      setTasks(tasksData);
      setApartments(apartmentsData);
      setTenants(tenantsData);
      setAdmins(adminsData);
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
      if (selectedTask) {
        await taskService.updateTask(selectedTask.id, formData);
      } else {
        await taskService.createTask(formData);
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
      assignedUserId: '',
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
    const assignedUserId = task.assignedUser ? 
      (typeof task.assignedUser === 'object' ? task.assignedUser.id : task.assignedUser) : '';
    
    const apartmentId = task.apartment ? 
      (typeof task.apartment === 'object' ? task.apartment.id : task.apartment) : '';
    
    const tenantId = task.tenant ? 
      (typeof task.tenant === 'object' ? task.tenant.id : task.tenant) : '';
    
    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || '',
      status: task.status || '',
      assignedUserId,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('tasks.title')}</h1>
        <button
          onClick={() => {
            setSelectedTask(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('tasks.addNew')}
        </button>
      </div>

      {/* Filter section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tasks.filters.apartment')}
            </label>
            <select
              name="apartmentId"
              value={filters.apartmentId}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              {t('tasks.fields.status')}
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">{t('common.all')}</option>
              <option value="PENDING">{t('tasks.status.PENDING')}</option>
              <option value="IN_PROGRESS">{t('tasks.status.IN_PROGRESS')}</option>
              <option value="COMPLETED">{t('tasks.status.COMPLETED')}</option>
              <option value="APPROVED">{t('tasks.status.APPROVED')}</option>
              <option value="REJECTED">{t('tasks.status.REJECTED')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tasks.fields.priority')}
            </label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">{t('common.all')}</option>
              <option value="LOW">{t('tasks.priorities.LOW')}</option>
              <option value="MEDIUM">{t('tasks.priorities.MEDIUM')}</option>
              <option value="HIGH">{t('tasks.priorities.HIGH')}</option>
              <option value="URGENT">{t('tasks.priorities.URGENT')}</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            {t('common.clear')}
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {t('common.apply')}
          </button>
        </div>
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
        data={tasks}
        onEdit={handleEdit}
        rowClassName={() => "cursor-pointer"}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTask ? t('tasks.edit') : t('tasks.addNew')}
        onSubmit={handleSubmit}
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
                <option value="APPROVED">{t('tasks.status.APPROVED')}</option>
                <option value="REJECTED">{t('tasks.status.REJECTED')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.fields.assignedUser')}
              </label>
              <select
                name="assignedUserId"
                value={formData.assignedUserId}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.select')}</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.firstName} {admin.lastName}
                  </option>
                ))}
              </select>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.fields.recurringPattern')}
              </label>
              <select
                name="recurringPattern"
                value={formData.recurringPattern}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Välj...</option>
                <option value="DAILY">Dagligen</option>
                <option value="WEEKLY">Veckovis</option>
                <option value="MONTHLY">Månadsvis</option>
                <option value="YEARLY">Årligen</option>
              </select>
            </div>
          )}
        </div>
      </Modal>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={confirmDelete}
        title={t('tasks.confirmDelete')}
        message={taskToDelete ? `${t('tasks.confirmDelete')} "${taskToDelete.title}"?` : ''}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default Tasks; 