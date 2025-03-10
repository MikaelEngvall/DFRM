import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { pendingTaskService, taskService, apartmentService, tenantService, userService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';

const PendingTasks = () => {
  const { t } = useLocale();
  const { user: currentUser } = useAuth();
  const [pendingTasks, setPendingTasks] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [showApproved, setShowApproved] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewComments, setReviewComments] = useState('');
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
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

  const columns = [
    {
      key: 'taskTitle',
      label: t('pendingTasks.fields.task'),
      render: (_, pendingTask) => pendingTask.task ? pendingTask.task.title : '-'
    },
    {
      key: 'requestedBy',
      label: t('pendingTasks.fields.requestedBy'),
      render: (admin) => admin ? `${admin.firstName} ${admin.lastName}` : '-'
    },
    {
      key: 'requestedAt',
      label: t('pendingTasks.fields.requestedAt'),
      render: (date) => date ? new Date(date).toLocaleString() : '-'
    },
    {
      key: 'taskPriority',
      label: t('tasks.fields.priority'),
      render: (_, pendingTask) => pendingTask.task && pendingTask.task.priority ? 
        t(`tasks.priorities.${pendingTask.task.priority}`) : '-'
    },
    {
      key: 'taskStatus',
      label: t('tasks.fields.status'),
      render: (_, pendingTask) => pendingTask.task && pendingTask.task.status ? 
        t(`tasks.status.${pendingTask.task.status}`) : '-'
    },
    {
      key: 'reviewedBy',
      label: t('pendingTasks.fields.reviewedBy'),
      render: (user) => user ? `${user.firstName} ${user.lastName}` : '-'
    },
    {
      key: 'reviewedAt',
      label: t('pendingTasks.fields.reviewedAt'),
      render: (date) => date ? new Date(date).toLocaleString() : '-'
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_, pendingTask) => (
        <div className="flex space-x-2">
          {!pendingTask.reviewedBy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReviewClick(pendingTask);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs"
            >
              {t('pendingTasks.actions.review')}
            </button>
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchData();
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      const [usersData, apartmentsData, tenantsData] = await Promise.all([
        userService.getAllUsers(),
        apartmentService.getAllApartments(),
        tenantService.getAllTenants(),
      ]);
      
      setUsers(usersData);
      setApartments(apartmentsData);
      setTenants(tenantsData);
    } catch (err) {
      console.error('Error fetching reference data:', err);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const pendingData = await pendingTaskService.getPendingTasksForReview();
      setPendingTasks(pendingData);
      
      if (showApproved) {
        await fetchApprovedTasks();
      }
      
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching pending tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApprovedTasks = async () => {
    try {
      const approvedData = await pendingTaskService.getApprovedTasks();
      setApprovedTasks(approvedData);
      return true;
    } catch (err) {
      console.error('Error fetching approved tasks:', err);
      // FALLBACK: Om vi får 403 Forbidden, simulera tomma godkända uppgifter
      // Detta låter UI fungera även om backend inte är konfigurerad
      setApprovedTasks([]);
      // Felmeddelande visas bara tillfälligt
      setError(t('pendingTasks.messages.approvedTasksError'));
      setTimeout(() => {
        setError(null);
      }, 5000);
      return true; // Returnera true för att låta UI visa tomma godkända uppgifter
    }
  };

  const handleShowApprovedChange = async (e) => {
    const checked = e.target.checked;
    setShowApproved(checked);
    
    if (checked) {
      await fetchApprovedTasks();
    }
  };

  const handleReviewClick = (pendingTask) => {
    setSelectedTask(pendingTask);
    setReviewComments('');
    
    // Populera formData med task-information
    if (pendingTask.task) {
      setFormData({
        title: pendingTask.task.title || '',
        description: pendingTask.task.description || '',
        dueDate: pendingTask.task.dueDate ? new Date(pendingTask.task.dueDate).toISOString().split('T')[0] : '',
        priority: pendingTask.task.priority || '',
        status: pendingTask.task.status || '',
        assignedToUserId: pendingTask.task.assignedToUserId || '',
        assignedByUserId: pendingTask.task.assignedByUserId || '',
        apartmentId: pendingTask.task.apartmentId || '',
        tenantId: pendingTask.task.tenantId || '',
        comments: pendingTask.task.comments || '',
        isRecurring: pendingTask.task.isRecurring || false,
        recurringPattern: pendingTask.task.recurringPattern || '',
      });
    }
    
    setIsReviewModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleReviewCommentsChange = (e) => {
    setReviewComments(e.target.value);
  };

  const handleApprove = async () => {
    try {
      // Uppdatera uppgiften före godkännande
      await taskService.updateTask(selectedTask.task.id, formData);
      
      // Godkänn uppgiften
      await pendingTaskService.approvePendingTask(selectedTask.id, currentUser.id, reviewComments);
      await fetchData();
      setIsReviewModalOpen(false);
      setSelectedTask(null);
      setReviewComments('');
      resetForm();
    } catch (err) {
      setError(t('pendingTasks.messages.approveError'));
      console.error('Error approving task:', err);
    }
  };

  const handleReject = async () => {
    try {
      // Uppdatera uppgiften före avvisning
      await taskService.updateTask(selectedTask.task.id, formData);
      
      // Avvisa uppgiften
      await pendingTaskService.rejectPendingTask(selectedTask.id, currentUser.id, reviewComments);
      await fetchData();
      setIsReviewModalOpen(false);
      setSelectedTask(null);
      setReviewComments('');
      resetForm();
    } catch (err) {
      setError(t('pendingTasks.messages.rejectError'));
      console.error('Error rejecting task:', err);
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

  const getDisplayData = () => {
    if (!showApproved) {
      return pendingTasks;
    }
    
    // Lägg till approved-flaggan för styling
    // Alla uppgifter som har task.status === "APPROVED" är godkända och ska visas
    const approved = approvedTasks.map(task => ({
      ...task,
      approved: true
    }));
    
    console.log("Pending tasks:", pendingTasks);
    console.log("Approved tasks:", approved);
    
    return [...pendingTasks, ...approved];
  };

  const getRowClassName = (row) => {
    const classes = ["cursor-pointer"];
    if (row.approved) {
      classes.push("opacity-50");
    }
    return classes.join(" ");
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('pendingTasks.title')}</h1>
        <div className="flex items-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
              checked={showApproved}
              onChange={handleShowApprovedChange}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-200">{t('pendingTasks.showApproved')}</span>
          </label>
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

      {getDisplayData().length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">{t('pendingTasks.noTasks')}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={getDisplayData()}
          onEdit={handleReviewClick}
          rowClassName={getRowClassName}
        />
      )}

      {selectedTask && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedTask(null);
            resetForm();
          }}
          title={t('pendingTasks.reviewRequest')}
          showFooter={false}
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
            
          {/* Granskningssektion */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('pendingTasks.reviewRequest')}
            </h3>
            
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">{t('pendingTasks.fields.requestedBy')}</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedTask.requestedBy ? `${selectedTask.requestedBy.firstName} ${selectedTask.requestedBy.lastName}` : '-'}
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">{t('pendingTasks.fields.requestedAt')}</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedTask.requestedAt ? new Date(selectedTask.requestedAt).toLocaleString() : '-'}
              </p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">{t('pendingTasks.fields.requestComments')}</h4>
              <p className="text-gray-700 dark:text-gray-300">{selectedTask.requestComments || '-'}</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('pendingTasks.fields.reviewComments')}
              </label>
              <textarea
                value={reviewComments}
                onChange={handleReviewCommentsChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="4"
                placeholder={t('pendingTasks.placeholders.reviewComments')}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReject}
              className="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {t('pendingTasks.actions.reject')}
            </button>
            <button
              onClick={handleApprove}
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {t('pendingTasks.actions.approve')}
            </button>
            <div className="flex-grow"></div>
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {t('common.cancel')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PendingTasks; 