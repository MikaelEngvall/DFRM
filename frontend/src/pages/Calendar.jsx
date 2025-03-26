import React, { useState, useEffect } from 'react';
import { taskService, userService, apartmentService, tenantService, taskMessageService } from '../services';
import showingService from '../services/showingService';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { formatShortDate } from '../utils/formatters';
import Autocomplete from '../components/Autocomplete';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import TaskMessages from '../components/TaskMessages';

const Calendar = () => {
  const { t, currentLocale } = useLocale();
  const { user: currentUser, hasRole } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [showings, setShowings] = useState([]);  // Ny state för visningar
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedShowing, setSelectedShowing] = useState(null);  // Ny state för vald visning
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isShowingModalOpen, setIsShowingModalOpen] = useState(false);  // Ny state för visningsmodalen
  const [isShowingEditModalOpen, setIsShowingEditModalOpen] = useState(false);  // Ny state för redigeringsmodalen
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
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
    descriptionLanguage: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [showingFormData, setShowingFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    status: '',
    assignedToUserId: '',
    apartmentId: '',
    notes: '',
    descriptionLanguage: 'sv' // Standardspråk är svenska
  });

  useEffect(() => {
    fetchCalendarData();
    
    // Lägg till en loggning för att se vilka dagar i månaden som har uppgifter
    const checkTasksDistribution = () => {
      const tasksPerDay = {};
      tasks.forEach(task => {
        if (!task.dueDate) return;
        
        try {
          let taskDate;
          if (typeof task.dueDate === 'string') {
            if (task.dueDate.includes('T')) {
              taskDate = new Date(task.dueDate);
            } else {
              const [y, m, d] = task.dueDate.split('-').map(Number);
              taskDate = new Date(y, m - 1, d);
            }
          } else if (task.dueDate instanceof Date) {
            taskDate = task.dueDate;
          } else {
            return;
          }
          
          const day = taskDate.getDate();
          tasksPerDay[day] = (tasksPerDay[day] || 0) + 1;
        } catch (e) {
          console.error('Fel vid analys av uppgiftsdatum:', e);
        }
      });
      
      console.log('Uppgifter per dag i aktuell månad:', tasksPerDay);
    };
    
    if (tasks.length > 0) {
      checkTasksDistribution();
    }
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Beräkna månadens start- och slutdatum
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      
      // Formatera datum för API-anrop
      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = endOfMonth.toISOString().split('T')[0];
      
      // Logga för felsökning
      console.log(`Hämtar data för period: ${startDateStr} till ${endDateStr}`);
      
      // Hämta både uppgifter och visningar parallellt
      const [tasksData, usersData, apartmentsData, tenantsData, showingsData] = await Promise.all([
        taskService.getTasksByDateRange(startDateStr, endDateStr, true), // Satt till true för att undvika cache-problem
        userService.getAllUsers(),
        apartmentService.getAllApartments(),
        tenantService.getAllTenants(),
        showingService.getForCalendar(startDateStr, endDateStr) // Hämta visningar för kalendern
      ]);
      
      // Logga data för felsökning
      console.log(`Antal hämtade uppgifter: ${tasksData.length}`);
      console.log('Uppgifter:', tasksData);
      
      setTasks(tasksData);
      setUsers(usersData);
      setApartments(apartmentsData);
      setTenants(tenantsData);
      setShowings(showingsData); // Spara visningar i state
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setError(t('common.error'));
      setIsLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
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

  const isDateToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handleTaskClick = async (task) => {
    try {
      // Hämta den fullständiga uppgiften med alla detaljer
      const fullTask = await taskService.getTaskById(task.id);
      
      // Använd översättningen om den finns, annars använd originalbeskrivningen
      const description = fullTask.translations && fullTask.translations[currentLocale] 
        ? fullTask.translations[currentLocale] 
        : fullTask.description;
      
      setSelectedTask(fullTask);
      setFormData({
        ...formData,
        title: fullTask.title || '',
        description: description || '',
        dueDate: fullTask.dueDate ? fullTask.dueDate.split('T')[0] : '',
        priority: fullTask.priority || '',
        status: fullTask.status || '',
        assignedToUserId: fullTask.assignedToUserId || '',
        assignedByUserId: fullTask.assignedByUserId || currentUser.id,
        apartmentId: fullTask.apartmentId || '',
        tenantId: fullTask.tenantId || '',
        comments: fullTask.comments || '',
        isRecurring: fullTask.isRecurring || false,
        recurringPattern: fullTask.recurringPattern || '',
      });
      setIsTaskModalOpen(true);
    } catch (error) {
      console.error('Error fetching task details:', error);
      setError(t('tasks.messages.fetchError'));
    }
  };

  const handleDayClick = (date) => {
    if (!isAdminOrSuperAdmin()) return;
    
    const formattedDate = date.toISOString().split('T')[0];
    
    setSelectedTask(null);
    setFormData({
      title: '',
      description: '',
      dueDate: formattedDate,
      priority: 'MEDIUM',
      status: 'PENDING',
      assignedToUserId: '', 
      assignedByUserId: currentUser?.id || '',
      apartmentId: '',
      tenantId: '',
      comments: '',
      isRecurring: false,
      recurringPattern: '',
    });
    
    setIsTaskModalOpen(true);
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
      descriptionLanguage: '',
    });
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
      const taskData = { ...formData };
      
      if (taskData.tenantId && typeof taskData.tenantId === 'object') {
        taskData.tenantId = taskData.tenantId.id;
      }
      
      if (taskData.apartmentId && typeof taskData.apartmentId === 'object') {
        taskData.apartmentId = taskData.apartmentId.id;
      }
      
      if (selectedTask) {
        if (selectedTask.isRecurring !== taskData.isRecurring || 
            selectedTask.recurringPattern !== taskData.recurringPattern) {
          await taskService.updateRecurringPattern(selectedTask.id, taskData.recurringPattern);
        }
        await taskService.updateTask(selectedTask.id, taskData);
      } else {
        taskData.assignedByUserId = currentUser.id;
        
        if (taskData.isRecurring && taskData.recurringPattern) {
          await taskService.createRecurringTask(taskData);
        } else {
          await taskService.createTask(taskData);
        }
      }
      
      await fetchCalendarData();
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      resetForm();
    } catch (err) {
      setError(t('tasks.messages.saveError'));
      console.error('Error saving task:', err);
    }
  };

  const getPriorityDotColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500 animate-blink border border-red-600 shadow-sm';
      case 'HIGH':
        return 'bg-orange-500 border border-orange-600 shadow-sm';
      case 'MEDIUM':
        return 'bg-yellow-500 border border-yellow-600 shadow-sm';
      case 'LOW':
        return 'bg-green-500 border border-green-600 shadow-sm';
      default:
        return 'bg-gray-400 border border-gray-500 shadow-sm';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const renderTaskItem = (task) => {
    // Förbättrad loggning för felsökning
    console.log('Rendering task:', task);
    console.log('Task ID:', task.id);
    console.log('Task title:', task.title);
    console.log('Task dueDate:', task.dueDate);
    console.log('Task status:', task.status);
    console.log('Task assignedToUserId:', task.assignedToUserId);

    const statusColor = getStatusColor(task.status || 'PENDING');
    const assignedUser = users.find(user => user.id === task.assignedToUserId);

    return (
      <div
        key={task.id}
        onClick={() => handleTaskClick(task)}
        className={`mb-1 p-2 rounded cursor-pointer hover:bg-opacity-80 ${statusColor}`}
      >
        <div className="flex items-center">
          <div className={`w-3 h-3 min-w-[0.75rem] rounded-full mr-2 ${getPriorityDotColor(task.priority || 'MEDIUM')}`} />
          <div className="flex-grow">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {task.title}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {assignedUser ? assignedUser.firstName : t('tasks.unassigned')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleShowingClick = (showing) => {
    setSelectedShowing(showing);
    setIsShowingModalOpen(true);
    // Stäng taskModal om den är öppen
    if (isTaskModalOpen) {
      setIsTaskModalOpen(false);
    }
  };

  const handleEditShowing = (showing) => {
    // Formatera datum för datetime-local input
    let dateTimeValue = '';
    if (showing.dateTime) {
      const date = new Date(showing.dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      dateTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Hämta beskrivning baserat på prefererat språk eller originalspråket
    let description = showing.description || '';
    let descriptionLanguage = showing.descriptionLanguage || 'sv';
    
    // Om översättningar finns och valt språk finns som översättning, använd den
    if (showing.translations && showing.translations[currentLocale]) {
      description = showing.translations[currentLocale];
      descriptionLanguage = currentLocale;
    }

    setShowingFormData({
      title: showing.title || '',
      description: description,
      dateTime: dateTimeValue,
      status: showing.status || '',
      assignedToUserId: showing.assignedToUserId || '',
      apartmentId: showing.apartmentId || '',
      notes: showing.notes || '',
      descriptionLanguage: descriptionLanguage
    });
    setIsShowingEditModalOpen(true);
    setIsShowingModalOpen(false);
  };

  const handleShowingInputChange = (e) => {
    const { name, value } = e.target;
    setShowingFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShowingSubmit = async (e) => {
    e.preventDefault();
    try {
      // Skapa ett Date-objekt och formatera till ISO-sträng med manuell tidszonsoffset
      let dateTimeString = null;
      if (showingFormData.dateTime) {
        const dateObj = new Date(showingFormData.dateTime);

        // Manuellt formatera ISO-strängen och ta hänsyn till tidszonen
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');

        // Skapa ISO-sträng med 'Z' för att indikera UTC
        dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
      }

      // Hantera översättningar
      let translations = selectedShowing.translations || {};
      const descriptionLanguage = showingFormData.descriptionLanguage;
      
      // Uppdatera översättningen för det aktuella språket
      translations = {
        ...translations,
        [descriptionLanguage]: showingFormData.description
      };

      const updatedData = {
        ...showingFormData,
        dateTime: dateTimeString,
        assignedToUserId: showingFormData.assignedToUserId || null,
        apartmentId: showingFormData.apartmentId || null,
        translations: translations,
        descriptionLanguage: descriptionLanguage
      };

      await showingService.update(selectedShowing.id, updatedData);
      await fetchCalendarData();

      setIsShowingEditModalOpen(false);
      setSelectedShowing(null);
      setSuccessMessage(t('showings.messages.updateSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating showing:', err);
      setError(t('showings.messages.updateError'));
    }
  };

  // Lägg till funktion för att rendera visningsobjekt i kalendern
  const renderShowingItem = (showing) => {
    // Funktion för att formatera tid med korrekt tidszon
    const formatTime = (dateString) => {
      if (!dateString) return '';
      
      // Skapa ett nytt Date-objekt från ISO-strängen
      const date = new Date(dateString);
      
      // Korrigera för UTC-tidszonen
      // Vi lägger till 2 timmar (tidszon korrektion för Stockholm från UTC)
      // Detta säkerställer att tiden visas korrekt oavsett tidszon
      const localHours = date.getHours();
      const localMinutes = date.getMinutes();
      
      // Formatera tiden i 24-timmarsformat med ledande nollor
      return `${String(localHours).padStart(2, '0')}:${String(localMinutes).padStart(2, '0')}`;
    };

    // Hitta ansvarig mäklare genom att söka i users-arrayen med ID:t
    const assignedUser = users.find(user => user.id === showing.assignedTo);
    
    return (
      <div 
        key={showing.id}
        onClick={(e) => {
          e.stopPropagation();
          handleShowingClick(showing);
        }}
        className="mb-1 p-2 rounded-md cursor-pointer bg-purple-600 text-white border border-purple-800 shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex flex-col overflow-hidden">
          <div className="font-medium truncate">{showing.title || showing.address}</div>
          <div className="text-xs text-purple-100 truncate">
            {formatTime(showing.dateTime)} - {assignedUser ? assignedUser.firstName : t('showings.unassigned')}
          </div>
        </div>
      </div>
    );
  };

  // Uppdatera renderCalendar-funktionen för att inkludera visningar
  const renderCalendar = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Hämta antal dagar i månaden
    const daysInMonth = getDaysInMonth(year, month);
    
    // Hämta första dagen i månaden (0 = söndag, 1 = måndag, ...)
    let firstDay = getFirstDayOfMonth(year, month);
    
    // Justera så att veckan börjar på måndag (ISO-8601)
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // För att stämma överens med måndag som första dag i veckan
    const weekdays = [1, 2, 3, 4, 5, 6, 0]; // Mån, tis, ons, tors, fre, lör, sön
    
    // Lägg till tomma celler för dagar från föregående månad
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="bg-gray-100 dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700"
        />
      );
    }
    
    // Lägg till celler för alla dagar i månaden
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = isDateToday(date);
      const isAdminOrSuperAdmin = hasRole(['ADMIN', 'SUPERADMIN']);
      const isClickable = isAdminOrSuperAdmin;
      
      // Filtrera uppgifter för denna dag
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        
        // Hantera olika format av dueDate
        let taskDate;
        try {
          // Om det är en ISO-sträng
          if (typeof task.dueDate === 'string') {
            // Stöd för både "YYYY-MM-DD" och fullt ISO-format
            if (task.dueDate.includes('T')) {
              taskDate = new Date(task.dueDate);
            } else {
              // För "YYYY-MM-DD" format
              const [y, m, d] = task.dueDate.split('-').map(Number);
              taskDate = new Date(y, m - 1, d); // Månad är 0-baserad
            }
          } else if (task.dueDate instanceof Date) {
            taskDate = task.dueDate;
          } else {
            console.error('Uppgift har ogiltigt datumformat:', task);
            return false;
          }
          
          // Jämför endast år, månad och dag, ignorera tid
          return taskDate.getDate() === day && 
                 taskDate.getMonth() === month && 
                 taskDate.getFullYear() === year;
        } catch (e) {
          console.error('Fel vid bearbetning av uppgiftsdatum:', e);
          return false;
        }
      });
      
      // Logga för specifik dag (för felsökning)
      const today = new Date();
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        console.log(`Uppgifter för idag (${day}/${month+1}/${year}):`, dayTasks);
        console.log(`Alla uppgifter:`, tasks);
        console.log(`Filtrering för datum: ${day}/${month+1}/${year}`);
      }
      
      // Filtrera visningar för denna dag
      const dayShowings = showings.filter(showing => {
        if (!showing.dateTime) return false;
        const showingDate = new Date(showing.dateTime);
        // Jämför endast år, månad och dag, ignorera tid
        return showingDate.getDate() === day && 
               showingDate.getMonth() === month && 
               showingDate.getFullYear() === year;
      });
      
      days.push(
        <div 
          key={day} 
          className={`bg-white dark:bg-gray-900 border-b border-r border-gray-200 dark:border-gray-700 overflow-y-auto ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          } ${isClickable ? 'cursor-pointer' : ''}`}
          onClick={() => isClickable && handleDayClick(date)}
        >
          <div className="p-2 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <span className={`text-sm font-medium ${
              isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {day}
            </span>
          </div>
          <div className="px-1">
            {/* Visa visningar först */}
            {dayShowings.length > 0 && dayShowings.map(showing => renderShowingItem(showing))}
            
            {/* Sedan visa uppgifter */}
            {dayTasks.length > 0 && dayTasks.map(task => renderTaskItem(task))}
            
            {/* Visa meddelande om inga händelser */}
            {dayTasks.length === 0 && dayShowings.length === 0 && (
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

  // Funktion för att kontrollera om användaren är admin eller superadmin
  const isAdminOrSuperAdmin = () => {
    return hasRole(['ADMIN', 'SUPERADMIN']);
  };

  const handleAssignShowing = async (userId) => {
    try {
      await showingService.assignShowing(selectedShowing.id, userId);
      await fetchCalendarData();
      setSuccessMessage(t('showings.messages.assignSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error assigning showing:', err);
      throw err;
    }
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col lg:ml-60">
      <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            {t(`calendar.months.${currentDate.getMonth()}`)} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('calendar.today')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
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

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
            <div key={day} className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
              {t(`calendar.weekdaysShort.${day}`)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 h-[calc(100vh-8.5rem)]">
          {renderCalendar()}
        </div>
      </div>

      {isTaskModalOpen && (
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
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
                <Autocomplete
                  label={t('tasks.fields.apartment')}
                  name="apartmentId"
                  value={formData.apartmentId}
                  onChange={handleInputChange}
                  onSelect={(apartment) => {
                    const relatedTenants = tenants.filter(tenant => 
                      tenant.apartment && 
                      (tenant.apartment.id === apartment.id || tenant.apartment === apartment.id)
                    );
                    
                    if (relatedTenants.length > 0) {
                      setFormData(prev => ({
                        ...prev,
                        apartmentId: apartment.id,
                        tenantId: relatedTenants[0].id
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        apartmentId: apartment.id
                      }));
                    }
                  }}
                  options={apartments}
                  displayField={(apartment) => `${apartment.street} ${apartment.number}, LGH ${apartment.apartmentNumber}`}
                  placeholder={t('common.search')}
                  className="mb-0"
                />
              </div>
              
              <div>
                <Autocomplete
                  label={t('tasks.fields.tenant')}
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleInputChange}
                  options={tenants}
                  displayField={(tenant) => `${tenant.firstName} ${tenant.lastName}`}
                  placeholder={t('common.search')}
                  className="mb-0"
                />
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
                    if (formData.comments.trim() && selectedTask && selectedTask.id) {
                      taskMessageService.createMessage(selectedTask.id, formData.comments, currentLocale);
                      setFormData({...formData, comments: ''});
                    }
                  }}
                  disabled={!formData.comments.trim() || !selectedTask || !selectedTask.id}
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

          {selectedTask && selectedTask.id && (
            <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
              <TaskMessages 
                taskId={selectedTask.id} 
                canSendMessages={false}
              />
            </div>
          )}
        </Modal>
      )}

      {selectedShowing && (
        <Modal
          isOpen={isShowingModalOpen}
          onClose={() => {
            setIsShowingModalOpen(false);
            setSelectedShowing(null);
          }}
          title={t('showings.details')}
        >
          <div className="p-4 space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-100">
                {selectedShowing.title || t('showings.defaultTitle')}
              </h3>
              <p className="text-purple-700 dark:text-purple-200">
                {selectedShowing.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">{t('showings.dateTime')}</h4>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {(() => {
                    if (!selectedShowing.dateTime) return '';
                    
                    // Skapa ett Date-objekt från ISO-strängen
                    const date = new Date(selectedShowing.dateTime);
                    
                    // Formatera datum och tid manuellt för att undvika tidzonskonvertering
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    
                    // Returnera det formaterade datumet och tiden
                    return `${day}/${month}/${year} ${t('common.at')} ${hours}:${minutes}`;
                  })()}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">{t('showings.status')}</h4>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {t(`showings.statusTypes.${selectedShowing.status}`)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">{t('showings.fields.assignedTo')}</h4>
                <div className="mt-1 text-base font-medium text-gray-900 dark:text-white mb-2">
                  {users.find(u => u.id === selectedShowing.assignedTo)?.firstName || t('showings.unassigned')}
                </div>
                <select
                  value={selectedShowing.assignedTo || ''}
                  onChange={async (e) => {
                    try {
                      await handleAssignShowing(e.target.value);
                      setSelectedShowing({
                        ...selectedShowing,
                        assignedTo: e.target.value
                      });
                    } catch (err) {
                      console.error('Error assigning showing:', err);
                      setError(t('showings.messages.assignError'));
                    }
                  }}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{t('showings.unassigned')}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              {selectedShowing.status !== 'COMPLETED' && selectedShowing.status !== 'CANCELLED' && (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await showingService.update(selectedShowing.id, { ...selectedShowing, status: 'COMPLETED' });
                        await fetchCalendarData();
                        setIsShowingModalOpen(false);
                        setSelectedShowing(null);
                        setSuccessMessage(t('showings.messages.updateSuccess'));
                        setTimeout(() => setSuccessMessage(''), 3000);
                      } catch (err) {
                        console.error('Error completing showing:', err);
                        setError(t('showings.messages.updateError'));
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {t('showings.actions.complete')}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await showingService.update(selectedShowing.id, { ...selectedShowing, status: 'CANCELLED' });
                        await fetchCalendarData();
                        setIsShowingModalOpen(false);
                        setSelectedShowing(null);
                        setSuccessMessage(t('showings.messages.updateSuccess'));
                        setTimeout(() => setSuccessMessage(''), 3000);
                      } catch (err) {
                        console.error('Error cancelling showing:', err);
                        setError(t('showings.messages.updateError'));
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    {t('showings.actions.cancel')}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => handleEditShowing(selectedShowing)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
              >
                {t('showings.actions.edit')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isShowingEditModalOpen && (
        <Modal
          isOpen={isShowingEditModalOpen}
          onClose={() => {
            setIsShowingEditModalOpen(false);
            setSelectedShowing(null);
          }}
          title={t('showings.edit')}
          onSubmit={handleShowingSubmit}
        >
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label={t('showings.fields.title')}
              name="title"
              type="text"
              value={showingFormData.title}
              onChange={handleShowingInputChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                {t('showings.fields.descriptionLanguage')}
              </label>
              <select
                name="descriptionLanguage"
                value={showingFormData.descriptionLanguage}
                onChange={handleShowingInputChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2"
              >
                <option value="sv">{t('languages.swedish')}</option>
                <option value="en">{t('languages.english')}</option>
                <option value="pl">{t('languages.polish')}</option>
                <option value="uk">{t('languages.ukrainian')}</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                {t('showings.fields.description')}
              </label>
              <textarea
                name="description"
                value={showingFormData.description}
                onChange={handleShowingInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="3"
              />
            </div>

            <FormInput
              label={t('showings.fields.dateTime')}
              name="dateTime"
              type="datetime-local"
              value={showingFormData.dateTime}
              onChange={handleShowingInputChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                {t('showings.fields.status')}
              </label>
              <select
                name="status"
                value={showingFormData.status}
                onChange={handleShowingInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">{t('common.select')}</option>
                <option value="PENDING">{t('showings.statusTypes.PENDING')}</option>
                <option value="CONFIRMED">{t('showings.statusTypes.CONFIRMED')}</option>
                <option value="COMPLETED">{t('showings.statusTypes.COMPLETED')}</option>
                <option value="CANCELLED">{t('showings.statusTypes.CANCELLED')}</option>
              </select>
            </div>

            <FormInput
              label={t('showings.fields.assignedToUserId')}
              name="assignedToUserId"
              type="text"
              value={showingFormData.assignedToUserId}
              onChange={handleShowingInputChange}
            />

            <FormInput
              label={t('showings.fields.apartmentId')}
              name="apartmentId"
              type="text"
              value={showingFormData.apartmentId}
              onChange={handleShowingInputChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                {t('showings.fields.notes')}
              </label>
              <textarea
                name="notes"
                value={showingFormData.notes}
                onChange={handleShowingInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="3"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Calendar; 
