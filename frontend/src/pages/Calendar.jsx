import React, { useState, useEffect } from 'react';
import { taskService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import Modal from '../components/Modal';

const Calendar = () => {
  const { t } = useLocale();
  const [view, setView] = useState('month'); // month, week, day
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      
      // Beräkna första och sista dag i månaden
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const data = await taskService.getTasksByDateRange(
        startDate.toISOString().split('T')[0], 
        endDate.toISOString().split('T')[0]
      );
      
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'APPROVED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderMonthlyCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Justera för veckan som börjar på måndag (0=måndag istället för söndag i Sverige)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = [];
    
    // Lägg till tomma dagar för början av månaden
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 h-32"></div>);
    }
    
    // Lägg till alla dagar i månaden
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Filtrera uppgifter för denna dag
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getDate() === day && 
               taskDate.getMonth() === month && 
               taskDate.getFullYear() === year;
      });
      
      const isToday = 
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;
      
      days.push(
        <div 
          key={day} 
          className={`bg-white dark:bg-gray-900 border-b border-r border-gray-200 dark:border-gray-700 h-32 overflow-y-auto ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
        >
          <div className="p-2 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {day}
            </span>
          </div>
          <div className="px-1">
            {dayTasks.length > 0 ? (
              dayTasks.map(task => (
                <div 
                  key={task.id}
                  className={`mb-1 p-1 text-xs rounded border ${getPriorityColor(task.priority)} cursor-pointer hover:opacity-80`}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="font-semibold truncate">{task.title}</div>
                  <div className="flex justify-between mt-1">
                    <span className={`px-1 rounded-sm text-xxs ${getStatusColor(task.status)}`}>
                      {t(`tasks.status.${task.status}`)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 dark:text-gray-600 p-1">
                {t('calendar.noEvents')}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const monthName = new Intl.DateTimeFormat('sv-SE', { month: 'long' }).format(currentDate);
  const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('calendar.title')}</h1>
        
        <div className="flex space-x-3">
          <div className="flex rounded-md overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 text-sm ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              {t('calendar.month')}
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 text-sm ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              {t('calendar.week')}
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 text-sm ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              {t('calendar.day')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-medium">
            {capitalizedMonthName} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={goToToday}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {t('calendar.today')}
        </button>
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

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {/* Veckodagar */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800">
          <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.mon')}</div>
          <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.tue')}</div>
          <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.wed')}</div>
          <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.thu')}</div>
          <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.fri')}</div>
          <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.sat')}</div>
          <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.sun')}</div>
        </div>
        
        {/* Kalender */}
        <div className="grid grid-cols-7">
          {renderMonthlyCalendar()}
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title={selectedTask.title}
        >
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('tasks.fields.description')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{selectedTask.description || '-'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-md font-medium mb-1">{t('tasks.fields.priority')}</h3>
              <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(selectedTask.priority)}`}>
                {t(`tasks.priorities.${selectedTask.priority}`)}
              </span>
            </div>
            <div>
              <h3 className="text-md font-medium mb-1">{t('tasks.fields.status')}</h3>
              <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedTask.status)}`}>
                {t(`tasks.status.${selectedTask.status}`)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-md font-medium mb-1">{t('tasks.fields.dueDate')}</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <h3 className="text-md font-medium mb-1">{t('tasks.fields.assignedUser')}</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedTask.assignedUser ? (
                  typeof selectedTask.assignedUser === 'object' 
                    ? `${selectedTask.assignedUser.firstName} ${selectedTask.assignedUser.lastName}`
                    : selectedTask.assignedUser
                ) : '-'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-md font-medium mb-1">{t('tasks.fields.comments')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{selectedTask.comments || '-'}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Calendar; 