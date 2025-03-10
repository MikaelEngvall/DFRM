import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { pendingTaskService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';

const PendingTasks = () => {
  const { t } = useLocale();
  const { currentUser } = useAuth();
  const [pendingTasks, setPendingTasks] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [showApproved, setShowApproved] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewComments, setReviewComments] = useState('');

  const columns = [
    {
      key: 'task',
      label: t('pendingTasks.fields.task'),
      render: (task) => task ? task.title : '-'
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
      key: 'task',
      label: t('tasks.fields.priority'),
      render: (task) => task && task.priority ? t(`tasks.priorities.${task.priority}`) : '-'
    },
    {
      key: 'task',
      label: t('tasks.fields.status'),
      render: (task) => task && task.status ? t(`tasks.status.${task.status}`) : '-'
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
  }, []);

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
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      await pendingTaskService.approvePendingTask(selectedTask.id, currentUser.id, reviewComments);
      await fetchData();
      setIsReviewModalOpen(false);
      setSelectedTask(null);
      setReviewComments('');
    } catch (err) {
      setError(t('pendingTasks.messages.approveError'));
      console.error('Error approving task:', err);
    }
  };

  const handleReject = async () => {
    try {
      await pendingTaskService.rejectPendingTask(selectedTask.id, currentUser.id, reviewComments);
      await fetchData();
      setIsReviewModalOpen(false);
      setSelectedTask(null);
      setReviewComments('');
    } catch (err) {
      setError(t('pendingTasks.messages.rejectError'));
      console.error('Error rejecting task:', err);
    }
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
          onClose={() => setIsReviewModalOpen(false)}
          title={t('pendingTasks.reviewRequest')}
          showFooter={false}
        >
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('tasks.fields.title')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{selectedTask.task?.title}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('tasks.fields.description')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{selectedTask.task?.description || '-'}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('pendingTasks.fields.requestComments')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{selectedTask.requestComments || '-'}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('pendingTasks.fields.reviewComments')}</h3>
            <FormInput
              type="textarea"
              rows={4}
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder={t('pendingTasks.placeholders.reviewComments')}
            />
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