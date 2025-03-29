import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService, apartmentService, tenantService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useTaskModal } from '../contexts/TaskModalContext';
import {
  ClockIcon,
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const RelatedTasks = ({ entityType, entityId, limit = 5, showAddButton = true }) => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { openTaskModal } = useTaskModal();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    if (entityId) {
      fetchRelatedTasks();
      
      // Hämta även lägenhet eller hyresgäst-data baserat på typ
      if (entityType === 'apartment') {
        fetchApartment();
      } else if (entityType === 'tenant') {
        fetchTenant();
      }
    }
  }, [entityId, entityType]);
  
  const fetchApartment = async () => {
    try {
      // Hämta specifika lägenheten först
      const apartment = await apartmentService.getApartmentById(entityId);
      if (apartment) {
        setApartments([apartment]);
      } else {
        // Fallback: hämta alla lägenheter om vi inte kan hämta den specifika
        const allApartments = await apartmentService.getAllApartments();
        setApartments(allApartments);
      }
    } catch (err) {
      console.error('Error fetching apartment:', err);
    }
  };
  
  const fetchTenant = async () => {
    try {
      // Hämta specifika hyresgästen först
      const tenant = await tenantService.getTenantById(entityId);
      if (tenant) {
        setTenants([tenant]);
      } else {
        // Fallback: hämta alla hyresgäster om vi inte kan hämta den specifika
        const allTenants = await tenantService.getAllTenants();
        setTenants(allTenants);
      }
    } catch (err) {
      console.error('Error fetching tenant:', err);
    }
  };

  const fetchRelatedTasks = async () => {
    try {
      setIsLoading(true);
      let data;
      
      if (entityType === 'apartment') {
        data = await taskService.getTasksByApartment(entityId);
      } else if (entityType === 'tenant') {
        data = await taskService.getTasksByTenant(entityId);
      } else {
        throw new Error('Ogiltig enhetstyp');
      }
      
      setTasks(data);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError(t('common.accessDenied'));
        console.error(`Åtkomst nekad för ${entityType} tasks:`, err);
      } else {
        setError(t('common.error'));
        console.error(`Error fetching ${entityType} tasks:`, err);
      }
    } finally {
      setIsLoading(false);
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

  const handleAddTask = () => {
    if (entityType === 'apartment') {
      const apartment = apartments.find(a => a.id === entityId);
      if (apartment) {
        openTaskModal({ apartment });
      } else {
        openTaskModal({ apartmentId: entityId });
      }
    } else if (entityType === 'tenant') {
      const tenant = tenants.find(t => t.id === entityId);
      if (tenant) {
        openTaskModal({ tenant });
      } else {
        openTaskModal({ tenantId: entityId });
      }
    }
  };

  const handleViewAll = () => {
    const searchParams = new URLSearchParams();
    
    if (entityType === 'apartment') {
      searchParams.set('apartmentId', entityId);
    } else if (entityType === 'tenant') {
      searchParams.set('tenantId', entityId);
    }
    
    navigate(`/tasks?${searchParams.toString()}`);
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {t('tasks.relatedTasks')}
        </h3>
        <div className="flex space-x-2">
          {showAddButton && (
            <button
              onClick={handleAddTask}
              className="bg-primary text-white px-3 py-1.5 rounded-md hover:bg-secondary transition-colors flex items-center text-xs"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              {t('tasks.addNew')}
            </button>
          )}
          {tasks.length > limit && (
            <button
              onClick={handleViewAll}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {t('common.viewAll')}
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        {tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            {t('tasks.noRelatedTasks')}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.slice(0, limit).map((task) => (
              <li 
                key={task.id} 
                className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                onClick={() => handleTaskClick(task.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(task.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                          {t(`tasks.priorities.${task.priority}`)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {t('tasks.fields.dueDate')}: {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t(`tasks.status.${task.status}`)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RelatedTasks; 