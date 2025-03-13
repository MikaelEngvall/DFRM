import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { taskService, apartmentService, tenantService, userService, taskMessageService } from '../services';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import AlertModal from '../components/AlertModal';
import TaskMessages from '../components/TaskMessages';

const TaskDetail = () => {
  const { id } = useParams();
  const { t, currentLocale } = useLocale();
  const navigate = useNavigate();
  const { user: currentUser, hasRole } = useAuth();
  
  const [task, setTask] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [taskData, apartmentsData, tenantsData, usersData] = await Promise.all([
        taskService.getTaskById(id),
        apartmentService.getAllApartments(),
        tenantService.getAllTenants(),
        userService.getAllUsers(),
      ]);
      
      setTask(taskData);
      setFormData(taskData);
      setApartments(apartmentsData);
      setTenants(tenantsData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching data:', err);
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Skapa en kopia av formulärdatan
      const taskData = { ...formData };
      
      // Säkerställ att tenantId och apartmentId är strängar, inte objekt
      if (taskData.tenantId && typeof taskData.tenantId === 'object') {
        taskData.tenantId = taskData.tenantId.id;
      }
      
      if (taskData.apartmentId && typeof taskData.apartmentId === 'object') {
        taskData.apartmentId = taskData.apartmentId.id;
      }
      
      // Uppdatera återkommande mönster om det har ändrats
      if (task.isRecurring !== taskData.isRecurring || 
          task.recurringPattern !== taskData.recurringPattern) {
        await taskService.updateRecurringPattern(task.id, taskData.recurringPattern);
      }
      
      await taskService.updateTask(id, taskData);
      await fetchData();
      setIsEditMode(false);
    } catch (err) {
      setError(t('tasks.messages.saveError'));
      console.error('Error updating task:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await taskService.deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      setError(t('tasks.messages.deleteError'));
      console.error('Error deleting task:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await taskService.updateTaskStatus(id, newStatus);
      await fetchData();
    } catch (err) {
      setError(t('tasks.messages.statusUpdateError'));
      console.error('Error updating task status:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'IN_PROGRESS':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'REJECTED':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getApartmentName = (apartmentId) => {
    if (!apartmentId) return '-';
    const apartment = apartments.find(a => a.id === (typeof apartmentId === 'object' ? apartmentId.id : apartmentId));
    return apartment ? `${apartment.street} ${apartment.number}, LGH ${apartment.apartmentNumber}` : '-';
  };

  const getTenantName = (tenantId) => {
    if (!tenantId) return '-';
    const tenant = tenants.find(t => t.id === (typeof tenantId === 'object' ? tenantId.id : tenantId));
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : '-';
  };

  const renderUser = (userId) => {
    if (!userId) return '-';
    const user = users.find(u => u.id === (typeof userId === 'object' ? userId.id : userId));
    return user ? `${user.firstName} ${user.lastName}` : '-';
  };

  // Kontrollera om användaren kan skicka meddelanden
  const canSendMessages = () => {
    // ADMIN och SUPERADMIN kan alltid skicka meddelanden
    if (hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPERADMIN')) {
      return true;
    }
    
    // Användare som har uppgiften tilldelad till sig kan skicka meddelanden
    if (task && task.assignedToUserId === currentUser.id) {
      return true;
    }
    
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
          <p className="text-yellow-600 dark:text-yellow-400">{t('tasks.notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          <span>{t('common.back')}</span>
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {task.title}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditMode(true)}
              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                {t(`tasks.priorities.${task.priority}`)}
              </span>
              <div className="flex items-center">
                {getStatusIcon(task.status)}
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t(`tasks.status.${task.status}`)}
                </span>
              </div>
            </div>
            
            {/* Statusändringsikoner */}
            <div className="flex space-x-2">
              {task.status !== 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                >
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {t('tasks.actions.startWork')}
                </button>
              )}
              
              {task.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleStatusChange('COMPLETED')}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  {t('tasks.actions.markComplete')}
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {t('tasks.fields.details')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('tasks.fields.description')}
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {task.description || '-'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('tasks.fields.comments')}
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {task.comments || '-'}
                  </p>
                </div>
                
                {task.isRecurring && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('tasks.fields.recurringPattern')}
                    </p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {t(`tasks.recurringPatterns.${task.recurringPattern}`)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {t('tasks.fields.assignment')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('tasks.fields.assignedUser')}
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {renderUser(task.assignedUser)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('tasks.fields.apartment')}
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {getApartmentName(task.apartment)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('tasks.fields.tenant')}
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {getTenantName(task.tenant)}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('tasks.fields.dueDate')}
                    </p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('tasks.fields.completedDate')}
                    </p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(task.completedDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lägg till meddelandekomponenten */}
      <div className="mt-6">
        <TaskMessages 
          taskId={id} 
          canSendMessages={canSendMessages()} 
        />
      </div>
      
      {/* Redigeringsmodal */}
      <Modal
        isOpen={isEditMode}
        onClose={() => setIsEditMode(false)}
        title={t('tasks.edit')}
        onSubmit={handleSave}
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
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
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
              {t('tasks.messages.title')}
            </label>
            <div className="relative">
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="4"
                placeholder={t('tasks.messages.inputPlaceholder')}
              />
              <button
                type="button"
                onClick={() => {
                  if (formData.comments.trim()) {
                    taskMessageService.createMessage(id, formData.comments, currentLocale);
                    setFormData({...formData, comments: ''});
                  }
                }}
                disabled={!formData.comments.trim()}
                className="absolute bottom-2 right-2 p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
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
      
      {/* Borttaningsbekräftelse */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('tasks.confirmDelete')}
        message={`${t('tasks.confirmDelete')} "${task.title}"?`}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default TaskDetail; 