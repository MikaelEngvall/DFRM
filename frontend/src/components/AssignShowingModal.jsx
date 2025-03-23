import React, { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import Autocomplete from './Autocomplete';

const AssignShowingModal = ({ isOpen, onClose, onAssign, showing }) => {
  const { t } = useLocale();
  const { users } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId('');
      setError(null);
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedUserId) {
      setError(t('showings.errors.userRequired'));
      return;
    }

    try {
      await onAssign(selectedUserId);
      onClose();
    } catch (err) {
      setError(t('showings.errors.assignError'));
    }
  };

  const displayUserName = (user) => {
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('showings.assign')}
      size="small"
    >
      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-100">
            {showing?.title || t('showings.defaultTitle')}
          </h3>
          <p className="text-purple-700 dark:text-purple-200 mt-2">
            {showing?.description}
          </p>
        </div>

        <div className="space-y-4">
          <Autocomplete
            label={t('showings.fields.assignedTo')}
            options={users}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            displayField={displayUserName}
            placeholder={t('showings.selectUser')}
            required
          />

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleAssign}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
            >
              {t('showings.actions.assign')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AssignShowingModal; 