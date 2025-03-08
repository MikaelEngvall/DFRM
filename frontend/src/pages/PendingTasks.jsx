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
      key: 'actions',
      label: t('common.actions'),
      render: (_, pendingTask) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReviewClick(pendingTask);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs"
          >
            {t('pendingTasks.actions.review')}
          </button>
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchPendingTasks();
  }, []);

  const fetchPendingTasks = async () => {
    try {
      setIsLoading(true);
      const data = await pendingTaskService.getPendingTasksForReview();
      setPendingTasks(data);
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching pending tasks:', err);
    } finally {
      setIsLoading(false);
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
      await fetchPendingTasks();
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
      await fetchPendingTasks();
      setIsReviewModalOpen(false);
      setSelectedTask(null);
      setReviewComments('');
    } catch (err) {
      setError(t('pendingTasks.messages.rejectError'));
      console.error('Error rejecting task:', err);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('pendingTasks.title')}</h1>
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

      {pendingTasks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">{t('pendingTasks.noTasks')}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={pendingTasks}
          onEdit={handleReviewClick}
          rowClassName={() => "cursor-pointer"}
        />
      )}

      {selectedTask && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={t('pendingTasks.reviewRequest')}
        >
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('tasks.fields.title')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{selectedTask.task?.title}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('tasks.fields.description')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{selectedTask.task?.description || '-'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-md font-medium mb-1">{t('tasks.fields.priority')}</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedTask.task?.priority ? t(`tasks.priorities.${selectedTask.task.priority}`) : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-md font-medium mb-1">{t('tasks.fields.dueDate')}</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedTask.task?.dueDate ? new Date(selectedTask.task.dueDate).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('pendingTasks.fields.requestComments')}</h3>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded">
              {selectedTask.requestComments || '-'}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('pendingTasks.addComments')}
            </label>
            <textarea
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleReject}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {t('pendingTasks.actions.reject')}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {t('pendingTasks.actions.approve')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PendingTasks; 