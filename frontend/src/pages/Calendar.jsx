import React, { useState, useEffect } from 'react';
import { taskService, userService, apartmentService, tenantService, taskMessageService } from '../services';
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
  const [view, setView] = useState('month'); // month, week, day
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
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
  });

  // Funktion för att kontrollera om användaren är admin eller superadmin
  const isAdminOrSuperAdmin = () => {
    return hasRole(['ADMIN', 'SUPERADMIN']);
  };

  useEffect(() => {
    fetchTasks();
    fetchReferenceData();
  }, [currentDate]);

  const fetchReferenceData = async () => {
    try {
      // Använd cachad data om den finns tillgänglig, annars hämta från API
      const [usersData, apartmentsData, tenantsData] = await Promise.all([
        userService.getAllUsers(), // Använder cache automatiskt
        apartmentService.getAllApartments(), // Använder cache automatiskt
        tenantService.getAllTenants(), // Använder cache automatiskt
      ]);
      
      setUsers(usersData);
      setApartments(apartmentsData);
      setTenants(tenantsData);
    } catch (err) {
      console.error('Error fetching reference data:', err);
    }
  };
  
  const getAssignedUserName = (userId) => {
    if (!userId) return '-';
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : '-';
  };
  
  const getApartmentInfo = (apartmentId) => {
    if (!apartmentId) return '-';
    const apt = apartments.find(a => a.id === apartmentId);
    return apt ? `${apt.street} ${apt.number}, LGH ${apt.apartmentNumber}` : '-';
  };
  
  const getTenantName = (tenantId) => {
    if (!tenantId) return '-';
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : '-';
  };

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

  // Uppdatera navigeringsfunktioner för att hantera olika vyer
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (view === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (view === 'day') {
        newDate.setDate(newDate.getDate() - 1);
      }
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (view === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else if (view === 'day') {
        newDate.setDate(newDate.getDate() + 1);
      }
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
      // Hämta fullständig uppgiftsinformation från API istället för att använda den begränsade 
      // information som finns i kalenderuppgiften
      const fullTaskData = await taskService.getTaskById(task.id);
      setSelectedTask(fullTaskData);
      
      // Extrahera ID från objekt om det behövs (samma logik som i Tasks.jsx)
      const assignedToUserId = fullTaskData.assignedToUserId || '';
      
      const apartmentId = fullTaskData.apartmentId ? 
        (typeof fullTaskData.apartmentId === 'object' ? fullTaskData.apartmentId.id : fullTaskData.apartmentId) : '';
      
      const tenantId = fullTaskData.tenantId ? 
        (typeof fullTaskData.tenantId === 'object' ? fullTaskData.tenantId.id : fullTaskData.tenantId) : '';
      
      // Hantera datumet korrekt för att undvika tidszonsförskjutning
      let dueDateString = '';
      if (fullTaskData.dueDate) {
        const dueDate = new Date(fullTaskData.dueDate);
        const year = dueDate.getFullYear();
        const month = String(dueDate.getMonth() + 1).padStart(2, '0');
        const day = String(dueDate.getDate()).padStart(2, '0');
        dueDateString = `${year}-${month}-${day}`;
      }
      
      setFormData({
        title: fullTaskData.title || '',
        description: fullTaskData.description || '',
        dueDate: dueDateString,
        priority: fullTaskData.priority || '',
        status: fullTaskData.status || '',
        assignedToUserId: assignedToUserId,
        assignedByUserId: fullTaskData.assignedByUserId || '',
        apartmentId: apartmentId,
        tenantId: tenantId,
        comments: fullTaskData.comments || '',
        isRecurring: fullTaskData.isRecurring || false,
        recurringPattern: fullTaskData.recurringPattern || '',
      });
      
      setIsTaskModalOpen(true);
    } catch (err) {
      console.error('Error fetching full task details:', err);
      // Fallback till den gamla metoden om något går fel
      setSelectedTask(task);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: Array.isArray(task.dueDate) 
          ? `${task.dueDate[0]}-${task.dueDate[1].toString().padStart(2, '0')}-${task.dueDate[2].toString().padStart(2, '0')}` 
          : typeof task.dueDate === 'string' 
            ? task.dueDate.substring(0, 10)
            : '',
        priority: task.priority || '',
        status: task.status || '',
        assignedToUserId: task.assignedToUserId || '',
        assignedByUserId: task.assignedByUserId || '',
        apartmentId: task.apartmentId || '',
        tenantId: task.tenantId || '',
        comments: task.comments || '',
        isRecurring: task.isRecurring || false,
        recurringPattern: task.recurringPattern || '',
      });
      setIsTaskModalOpen(true);
    }
  };

  // Funktion för att hantera klick på en kalenderdag (för admin och superadmin)
  const handleDayClick = (date) => {
    // Endast admin och superadmin kan skapa uppgifter genom att klicka på en dag
    if (!isAdminOrSuperAdmin()) return;
    
    // Formatera datumet för input-fältet (YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0];
    
    // Reset formdata och sätt selectedTask till null för att indikera att det är en ny uppgift
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
        // För ny uppgift, sätt automatiskt assignedByUserId till aktuell användare
        taskData.assignedByUserId = currentUser.id;
        
        // Skapa normal eller återkommande beroende på valet
        if (taskData.isRecurring && taskData.recurringPattern) {
          await taskService.createRecurringTask(taskData);
        } else {
          await taskService.createTask(taskData);
        }
      }
      
      // Uppdatera kalendervyn med nya data
      await fetchTasks();
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      resetForm();
    } catch (err) {
      setError(t('tasks.messages.saveError'));
      console.error('Error saving task:', err);
    }
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderTaskItem = (task) => {
    return (
      <div
        key={task.id}
        className={`px-2 py-1 rounded text-xs mb-1 cursor-pointer ${getPriorityColor(task.priority)}`}
        onClick={(e) => {
          e.stopPropagation();
          handleTaskClick(task);
        }}
      >
        <div className="truncate font-medium">{task.title}</div>
        {task.assignedToUser && (
          <div className="truncate text-xs opacity-80">
            {task.assignedToUser.firstName} {task.assignedToUser.lastName}
          </div>
        )}
      </div>
    );
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
        if (!task.dueDate) return false;
        
        // Skapa datumobjektet och hantera LocalDate från backend korrekt
        let taskYear, taskMonth, taskDay;
        
        if (Array.isArray(task.dueDate) && task.dueDate.length >= 3) {
          // LocalDate kommer från backend som en array [år, månad, dag]
          [taskYear, taskMonth, taskDay] = task.dueDate;
          // Jämför dagens datum mot uppgiftens datum (månad är 1-indexerad i Java)
          return taskDay === day && 
                 taskMonth === month + 1 && 
                 taskYear === year;
        } else if (typeof task.dueDate === 'string') {
          // Om det är en sträng, parsa det
          const date = new Date(task.dueDate);
          if (!isNaN(date.getTime())) {
            return date.getDate() === day && 
                   date.getMonth() === month && 
                   date.getFullYear() === year;
          }
        }
        
        return false;
      });
      
      const isToday = 
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;
      
      // Lägg till cursor-pointer om användaren är admin eller superadmin
      const isClickable = isAdminOrSuperAdmin();
      
      days.push(
        <div 
          key={day} 
          className={`bg-white dark:bg-gray-900 border-b border-r border-gray-200 dark:border-gray-700 h-32 overflow-y-auto ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${isClickable ? 'cursor-pointer' : ''}`}
          onClick={() => isClickable && handleDayClick(new Date(year, month, day))}
        >
          <div className="p-2 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {day}
            </span>
          </div>
          <div className="px-1">
            {dayTasks.length > 0 ? (
              dayTasks.map(task => renderTaskItem(task))
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

  // Lägg till renderWeeklyCalendar-funktion efter renderMonthlyCalendar
  const renderWeeklyCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();
    
    // Hitta första dagen i veckan (måndag)
    const currentDay = new Date(year, month, date);
    const dayOfWeek = currentDay.getDay(); // 0 är söndag, 1 är måndag, etc.
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Konvertera till vecka som börjar på måndag
    
    const weekStart = new Date(year, month, date - diff);
    const days = [];
    
    // Skapa 7 dagar från veckans början
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      
      const dayYear = day.getFullYear();
      const dayMonth = day.getMonth();
      const dayDate = day.getDate();
      const dateString = day.toISOString().split('T')[0];
      
      // Filtrera uppgifter för denna dag
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getFullYear() === dayYear && 
              taskDate.getMonth() === dayMonth && 
              taskDate.getDate() === dayDate;
      });
      
      const isToday = isDateToday(day);
      
      days.push(
        <div 
          key={`day-${i}`} 
          className={`border-b border-r border-gray-200 dark:border-gray-700 p-2 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          } min-h-[200px]`}
          onClick={() => isAdminOrSuperAdmin() && handleDayClick(dateString)}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${
              isToday ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {dayDate} {t(`calendar.monthsShort.${dayMonth}`)}
            </span>
          </div>
          
          <div className="space-y-1">
            {dayTasks.map(task => renderTaskItem(task))}
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  // Lägg till renderDailyCalendar-funktion
  const renderDailyCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();
    const selectedDate = new Date(year, month, date);
    const dateString = selectedDate.toISOString().split('T')[0];
    
    // Filtrera uppgifter för vald dag
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.getFullYear() === year && 
            taskDate.getMonth() === month && 
            taskDate.getDate() === date;
    });
    
    // Sortera uppgifter efter prioritet
    const sortedTasks = [...dayTasks].sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    return (
      <div 
        className="border border-gray-200 dark:border-gray-700 rounded-md p-4 min-h-[600px]"
        onClick={() => isAdminOrSuperAdmin() && handleDayClick(dateString)}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-800 dark:text-white">
            {date} {t(`calendar.months.${month}`)} {year}
          </h2>
        </div>
        
        {sortedTasks.length > 0 ? (
          <div className="space-y-3">
            {sortedTasks.map(task => (
              <div 
                key={task.id} 
                className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskClick(task);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {t(`tasks.priorities.${task.priority.toLowerCase()}`)}
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{task.assignedToUser ? task.assignedToUser.firstName + ' ' + task.assignedToUser.lastName : '-'}</span>
                  <span>{formatShortDate(task.dueDate, currentLocale)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
            {t('calendar.noTasks')}
          </div>
        )}
      </div>
    );
  };

  // Använd översättningar för månaderna istället för Intl.DateTimeFormat
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const monthName = t(`calendar.months.${monthNames[currentDate.getMonth()]}`);
  const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Formaterar rubriker för olika kalendervyer
  const getCalendarTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();
    
    if (view === 'month') {
      return `${t(`calendar.months.${month}`)} ${year}`;
    } else if (view === 'week') {
      // Hitta första dagen i veckan (måndag)
      const currentDay = new Date(year, month, date);
      const dayOfWeek = currentDay.getDay(); // 0 är söndag, 1 är måndag, etc.
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Konvertera till vecka som börjar på måndag
      
      const weekStart = new Date(year, month, date - diff);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Om veckan sträcker sig över två månader
      if (weekStart.getMonth() !== weekEnd.getMonth()) {
        return `${weekStart.getDate()} ${t(`calendar.monthsShort.${weekStart.getMonth()}`)} - ${weekEnd.getDate()} ${t(`calendar.monthsShort.${weekEnd.getMonth()}`)} ${year}`;
      }
      
      return `${weekStart.getDate()} - ${weekEnd.getDate()} ${t(`calendar.months.${month}`)} ${year}`;
    } else if (view === 'day') {
      return `${date} ${t(`calendar.months.${month}`)} ${year}`;
    }
    
    return '';
  };

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
        <h1 className="text-3xl font-cinzel dark:text-white">{t('calendar.title')}</h1>
        
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
      
      {/* Info för admin och superadmin */}
      {isAdminOrSuperAdmin() && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">{t('calendar.clickToAddTask')}</p>
        </div>
      )}
      
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
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            {getCalendarTitle()}
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
        {view === 'month' && (
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800">
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.mon')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.tue')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.wed')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.thu')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.fri')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.sat')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdaysShort.sun')}</div>
          </div>
        )}
        
        {view === 'week' && (
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800">
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdays.mon')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdays.tue')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdays.wed')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdays.thu')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdays.fri')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdays.sat')}</div>
            <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">{t('calendar.weekdays.sun')}</div>
          </div>
        )}
        
        {/* Kalender */}
        {view === 'month' && (
          <div className="grid grid-cols-7">
            {renderMonthlyCalendar()}
          </div>
        )}
        {view === 'week' && (
          <div className="grid grid-cols-7">
            {renderWeeklyCalendar()}
          </div>
        )}
        {view === 'day' && (
          renderDailyCalendar()
        )}
      </div>

      {/* Task Modal */}
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
                    // Hitta relaterade hyresgäster för denna lägenhet
                    const relatedTenants = tenants.filter(tenant => 
                      tenant.apartment && 
                      (tenant.apartment.id === apartment.id || tenant.apartment === apartment.id)
                    );
                    
                    // Om det finns hyresgäster kopplade till lägenheten, välj den första automatiskt
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

          {/* Visa befintliga meddelanden om en uppgift är vald */}
          {selectedTask && selectedTask.id && (
            <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
              <TaskMessages 
                taskId={selectedTask.id} 
                canSendMessages={false} // Använd textfältet ovan istället för det inbyggda
              />
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Calendar; 