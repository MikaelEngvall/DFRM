import React, { useState, useEffect } from 'react';
import { taskService, userService, apartmentService, tenantService, taskMessageService } from '../services';
import showingService from '../services/showingService';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { formatShortDate, formatDateForInput } from '../utils/formatters';
import Autocomplete from '../components/Autocomplete';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import TaskMessages from '../components/TaskMessages';
import { ChevronLeftIcon, ChevronRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Calendar = () => {
  const { t, currentLocale } = useLocale();
  const { user: currentUser, hasRole } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('month');
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
    phoneNumber: '',
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
    descriptionLanguage: 'sv',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
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
              // Justera för tidszon
              const offset = taskDate.getTimezoneOffset() * 60000;
              taskDate = new Date(taskDate.getTime() + offset);
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
      console.log('Totalt antal uppgifter:', tasks.length);
      console.log('Exempel på uppgifter:', tasks.slice(0, 3));
    };
    
    if (tasks.length > 0) {
      checkTasksDistribution();
    }
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Beräkna start- och slutdatum baserat på aktuell månad
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Formatera datumen till "YYYY-MM-DD", och se till att INTE använda toISOString()
      // eftersom det orsakar problem med tidzoner
      const formatDateToLocalString = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const startDate = formatDateToLocalString(firstDay);
      const endDate = formatDateToLocalString(lastDay);
      
      console.log(`Kalender: Hämtar uppgifter för perioden: ${startDate} till ${endDate}`);
      
      // Hämta alla uppgifter för månaden, tvinga hämtning från API genom att sätta bypassCache till true
      console.log('Kalender: Anropar taskService.getTasksByDateRange...');
      
      // Försök flera gånger om det behövs, med escalation till mer direkta metoder
      let fetchedTasks = [];
      try {
        // Först försöker vi med vanligt API-anrop
        fetchedTasks = await taskService.getTasksByDateRange(startDate, endDate, true);
        console.log(`Kalender: Mottog ${fetchedTasks.length} uppgifter för perioden via API`);
      } catch (error) {
        console.error('Kalender: Kunde inte hämta uppgifter via API:', error);
        
        // Om API misslyckas, försök hämta alla uppgifter och filtrera manuellt
        console.log('Kalender: Försöker med direkt hämtning av alla uppgifter...');
        const allTasks = await taskService.getAllTasks(true);
        
        // Filtrera manuellt baserat på datum
        fetchedTasks = allTasks.filter(task => {
          if (!task.dueDate) return false;
          
          try {
            const taskDate = typeof task.dueDate === 'string' 
              ? new Date(task.dueDate.includes('T') ? task.dueDate : `${task.dueDate}T00:00:00`)
              : task.dueDate;
            
            // Konvertera till lokala datum objekt
            const taskLocalDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
            const startLocalDate = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate());
            const endLocalDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate());
            
            return taskLocalDate >= startLocalDate && taskLocalDate <= endLocalDate;
          } catch (e) {
            console.error('Fel vid filtrering av uppgiftsdatum:', e);
            return false;
          }
        });
        
        console.log(`Kalender: Filtrerade fram ${fetchedTasks.length} uppgifter manuellt`);
      }
      
      // Om användaren har rollen USER, filtrera uppgifter till endast användarens egna
      if (currentUser && !hasRole(['ADMIN', 'SUPERADMIN'])) {
        console.log(`Kalender: USER kan se alla uppgifter men bara redigera egna`);
      }
      
      // Verifiera att vi faktiskt får data
      console.log(`Kalender: Mottog ${fetchedTasks.length} uppgifter för perioden`);
      console.log('Kalender: Dagar i aktuell månad:', getDaysInMonth(year, month));
      
      if (fetchedTasks.length === 0) {
        console.warn('Kalender: Varning - Inga uppgifter hämtades för den aktuella perioden');
        console.warn('Kalender: Kontrollerar direkt i databasen/API om det verkligen finns uppgifter...');
      } else {
        console.log('Kalender: Exempel på hämtade uppgifter:', 
          fetchedTasks.slice(0, 3).map(task => ({
            id: task.id,
            title: task.title,
            dueDate: task.dueDate
          }))
        );
      }
      
      // Normalisera datumsformatet för alla uppgifter
      console.log('Kalender: Normaliserar datumformat för uppgifter...');
      const normalizedTasks = fetchedTasks.map(task => {
        if (!task.dueDate) {
          console.log(`Kalender: Uppgift saknar förfallodatum:`, {id: task.id, title: task.title});
          return task;
        }
        
        // Normalisera datum för att säkerställa korrekt representation
        let normalizedDate;
        try {
          if (typeof task.dueDate === 'string') {
            if (task.dueDate.includes('T')) {
              // ISO-format med tid
              const date = new Date(task.dueDate);
              normalizedDate = formatDateToLocalString(date);
              console.log(`Kalender: Normaliserat ISO-datumformat för uppgift ${task.id}: ${task.dueDate} -> ${normalizedDate}`);
            } else {
              // Redan i rätt format
              normalizedDate = task.dueDate;
              console.log(`Kalender: Uppgift ${task.id} har redan korrekt datumformat: ${normalizedDate}`);
            }
          } else if (task.dueDate instanceof Date) {
            normalizedDate = formatDateToLocalString(task.dueDate);
            console.log(`Kalender: Normaliserat Date-objekt för uppgift ${task.id}: ${task.dueDate} -> ${normalizedDate}`);
          }
          
          // Skapa ett Date-objekt för _dueDateObj för att underlätta filtrering
          const dueDateParts = normalizedDate.split('-').map(Number);
          const dueDateObj = new Date(dueDateParts[0], dueDateParts[1] - 1, dueDateParts[2]);
          
          return {
            ...task,
            dueDate: normalizedDate,
            // Lägg till ett extra fält för att underlätta filtrering i kalendervyn
            _dueDateObj: dueDateObj
          };
        } catch (e) {
          console.error(`Kalender: Fel vid normalisering av datum för uppgift ${task.id}:`, e, task);
          return task;
        }
      });
      
      console.log(`Kalender: Uppgifter efter normalisering: ${normalizedTasks.length}`);
      
      // Gruppera uppgifter per dag för loggning
      const tasksByDay = {};
      normalizedTasks.forEach(task => {
        if (task.dueDate) {
          const day = task.dueDate.split('-')[2]; // Extrahera dagen från YYYY-MM-DD
          if (!tasksByDay[day]) tasksByDay[day] = [];
          tasksByDay[day].push(task);
        }
      });
      
      console.log('Kalender: Uppgifter per dag:', Object.keys(tasksByDay).map(day => `${day}: ${tasksByDay[day].length} uppgifter`));
      
      // Normalisera showings och filtrera dem baserat på användarens roll
      let normalizedShowings = [];
      
      // Endast ADMIN och SUPERADMIN kan se visningar
      if (hasRole(['ADMIN', 'SUPERADMIN'])) {
        try {
          // Hämta visningar för kalendern endast för admin-roller
          const showingsData = await showingService.getShowingsByDateRange(startDate, endDate);
          
          // Normalisera visningarna
          normalizedShowings = showingsData.map(showing => {
            let dateTime;
            try {
              // Parse the DateTime string
              dateTime = showing.dateTime ? new Date(showing.dateTime) : null;
            } catch (e) {
              console.error(`Fel vid konvertering av visningstid för visning ${showing.id}:`, e);
              dateTime = null;
            }
            
            return {
              ...showing,
              _dateTimeObj: dateTime
            };
          });
          
          console.log(`Kalender: Hämtade ${normalizedShowings.length} visningar för ADMIN/SUPERADMIN-användare`);
        } catch (err) {
          console.error('Error fetching showings:', err);
          // Fortsätt trots fel med visningar - det är inte kritiskt
        }
      } else {
        console.log('Kalender: Användaren har USER-roll, visar inga visningar');
      }
      
      // Sätt state baserat på normaliserad data
      setTasks(normalizedTasks);
      setShowings(normalizedShowings);
      setIsLoading(false);
      
      // Hämta användare för att fylla i dropdowns
      if (users.length === 0) {
        try {
          const usersData = await userService.getAllUsers();
          setUsers(usersData);
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      }
      
      // Hämta lägenheter för att fylla i dropdowns
      if (apartments.length === 0) {
        try {
          const apartmentsData = await apartmentService.getAllApartments();
          setApartments(apartmentsData);
        } catch (err) {
          console.error('Error fetching apartments:', err);
        }
      }
      
      // Hämta hyresgäster för att fylla i dropdowns
      if (tenants.length === 0) {
        try {
          const tenantsData = await tenantService.getAllTenants();
          setTenants(tenantsData);
        } catch (err) {
          console.error('Error fetching tenants:', err);
        }
      }
    } catch (error) {
      console.error('Fel vid hämtning av kalenderdata:', error);
      setError(t('calendar.errors.fetchFailed'));
      setIsLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const goToPreviousDay = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-800 border-green-200 dark:border-green-700 dark:text-white';
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-800 border-blue-200 dark:border-blue-700 dark:text-white';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-800 border-yellow-200 dark:border-yellow-700 dark:text-white';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-white';
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

  const renderTaskItem = (task) => {
    return (
      <div 
        key={task.id} 
        className={`rounded-md px-2 py-1 mb-1 cursor-pointer w-full border ${getStatusColor(task.status)}`}
        onClick={() => handleTaskClick(task)}
      >
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full flex-shrink-0 ${getPriorityDotColor(task.priority)}`}></div>
          <span className="text-xs font-medium truncate dark:text-white">{task.title}</span>
        </div>
      </div>
    );
  };

  const renderShowingItem = (showing) => {
    const formatTime = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const localHours = date.getHours();
      const localMinutes = date.getMinutes();
      return `${String(localHours).padStart(2, '0')}:${String(localMinutes).padStart(2, '0')}`;
    };

    const getBgColorClass = (assignedToUserId) => {
      if (assignedToUserId === 'karn') {
        return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700';
      }
      return 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700';
    };

    const getStatusDotColor = (status) => {
      switch (status) {
        case 'CONFIRMED':
          return 'bg-green-600 border-green-700';
        case 'CANCELLED':
          return 'bg-red-600 border-red-700';
        case 'COMPLETED':
          return 'bg-yellow-600 border-yellow-700';
        default:
          return 'bg-gray-600 border-gray-700';
      }
    };
    
    return (
      <div 
        key={showing.id}
        onClick={(e) => {
          e.stopPropagation();
          handleShowingClick(showing);
        }}
        className={`mb-1 px-2 py-1 rounded-md cursor-pointer border shadow-sm hover:shadow-md transition-shadow duration-200 w-full ${getBgColorClass(showing.assignedToUserId)}`}
      >
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full flex-shrink-0 border shadow-sm ${getStatusDotColor(showing.status)}`}></div>
          <div className="truncate">
            <div className="font-medium text-xs truncate text-purple-900 dark:text-purple-100">{showing.title || showing.address}</div>
            <div className="text-xs text-purple-700 dark:text-purple-300 truncate">
              {formatTime(showing.dateTime)} - {showing.contactName || t('showings.unassigned')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filterTasksByDate = (tasks, year, month, day) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate.getFullYear() === year &&
             dueDate.getMonth() === month &&
             dueDate.getDate() === day;
    });
  };

  const handleNavigationClick = (direction) => {
    switch (viewType) {
      case 'month':
        direction === 'previous' ? goToPreviousMonth() : goToNextMonth();
        break;
      case 'week':
        direction === 'previous' ? goToPreviousWeek() : goToNextWeek();
        break;
      case 'day':
        direction === 'previous' ? goToPreviousDay() : goToNextDay();
        break;
    }
  };

  // Funktion för att formatera tidsintervall
  const formatTimeRange = (date, hour) => {
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0);
    
    return `${String(startTime.getHours()).padStart(2, '0')}:00 - ${String(endTime.getHours()).padStart(2, '0')}:00`;
  };

  // Funktion för att rendera dagsvyn
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const currentDateEvents = [...tasks, ...showings].filter(event => {
      const eventDate = new Date(event.dueDate || event.dateTime);
      return eventDate.getDate() === currentDate.getDate() &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });

    return (
      <div className="grid grid-cols-1 h-[calc(100vh-8.5rem)] overflow-y-auto">
        {hours.map(hour => {
          const hourEvents = currentDateEvents.filter(event => {
            const eventDate = new Date(event.dueDate || event.dateTime);
            return eventDate.getHours() === hour;
          });

          return (
            <div key={hour} className="border-b border-gray-200 dark:border-gray-700 min-h-[60px]">
              <div className="flex">
                <div className="w-20 py-2 px-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatTimeRange(currentDate, hour)}
                </div>
                <div className="flex-1 p-2">
                  {hourEvents.map(event => 
                    'dueDate' in event ? renderTaskItem(event) : renderShowingItem(event)
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Funktion för att rendera veckovyn
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="grid grid-cols-7 h-[calc(100vh-8.5rem)]">
        {weekDays.map((day, index) => {
          const dayEvents = [...tasks, ...showings].filter(event => {
            const eventDate = new Date(event.dueDate || event.dateTime);
            return eventDate.getDate() === day.getDate() &&
                   eventDate.getMonth() === day.getMonth() &&
                   eventDate.getFullYear() === day.getFullYear();
          });

          const isToday = isDateToday(day);

          return (
            <div 
              key={index}
              className={`border-r border-gray-200 dark:border-gray-700 overflow-y-auto ${
                isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'
              }`}
            >
              <div className="p-2 sticky top-0 bg-inherit border-b border-gray-200 dark:border-gray-700">
                <div className={`text-sm font-medium ${
                  isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {t(`calendar.weekdaysShort.${['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][index]}`)}
                </div>
                <div className={`text-lg font-semibold ${
                  isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="p-2">
                {dayEvents.map(event => 
                  'dueDate' in event ? renderTaskItem(event) : renderShowingItem(event)
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Uppdatera renderCalendar-funktionen för att använda den nya filteringsfunktionen
  const renderCalendar = () => {
    if (viewType === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDayOfMonth = getFirstDayOfMonth(year, month);
      const days = [];
      
      // Lägg till dagar från föregående månad för att fylla första veckan
      const prevMonthDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
      
      for (let i = 0; i < prevMonthDays; i++) {
        const day = daysInPrevMonth - prevMonthDays + i + 1;
        const date = new Date(prevMonthYear, prevMonth, day);
        const isToday = isDateToday(date);
        
        // Filtrera uppgifter för denna dag
        const dayTasks = filterTasksByDate(tasks, prevMonthYear, prevMonth, day);
        
        // Filtrera visningar för denna dag om användaren har behörighet att se dem
        let dayShowings = [];
        if (hasRole(['ADMIN', 'SUPERADMIN'])) {
          dayShowings = showings.filter(showing => {
            if (!showing._dateTimeObj) return false;
            const showingDate = showing._dateTimeObj;
            return showingDate.getDate() === day && 
                  showingDate.getMonth() === prevMonth && 
                  showingDate.getFullYear() === prevMonthYear;
          });
        }
        
        days.push(
          <div 
            key={`prev-${day}`} 
            className="bg-gray-50 dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600"
          >
            <div className="p-2 sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
              <span className="text-sm font-medium">{day}</span>
            </div>
            <div className="px-2 pb-1">
              {/* Visa visningar först om användaren har behörighet */}
              {hasRole(['ADMIN', 'SUPERADMIN']) && dayShowings.length > 0 && 
               dayShowings.map(showing => renderShowingItem(showing))}
              
              {/* Sedan visa uppgifter */}
              {dayTasks.length > 0 && dayTasks.map(task => renderTaskItem(task))}
            </div>
          </div>
        );
      }
      
      // Lägg till celler för alla dagar i månaden
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = isDateToday(date);
        const isAdminOrSuperAdmin = hasRole(['ADMIN', 'SUPERADMIN']);
        const isClickable = isAdminOrSuperAdmin;
        
        // Använd vår nya robusta filtreringsfunktion
        const dayTasks = filterTasksByDate(tasks, year, month, day);
        
        // Logga för specifik dag (för felsökning)
        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
          console.log(`Uppgifter för idag (${day}/${month+1}/${year}):`, dayTasks);
          console.log(`Antal uppgifter för idag: ${dayTasks.length}`);
        }
        
        // Filtrera visningar för denna dag (behåll befintlig filtreringslogik för visningar)
        const dayShowings = showings.filter(showing => {
          if (!showing.dateTime) return false;
          
          try {
            // Använd _dateTimeObj om det finns tillgängligt
            if (showing._dateTimeObj instanceof Date) {
              const matches = showing._dateTimeObj.getDate() === day && 
                             showing._dateTimeObj.getMonth() === month && 
                             showing._dateTimeObj.getFullYear() === year;
              return matches;
            }
            
            // Fallback till manuell konvertering
            const showingDate = new Date(showing.dateTime);
            // Jämför endast år, månad och dag, ignorera tid
            return showingDate.getDate() === day && 
                   showingDate.getMonth() === month && 
                   showingDate.getFullYear() === year;
          } catch (e) {
            console.error('Fel vid filtrering av visning:', e);
            return false;
          }
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
            <div className="px-2 pb-1">
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
    }
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

  const handleTaskClick = async (task) => {
    try {
      const updatedTask = await taskService.getTaskById(task.id);
      // Hämta meddelanden tillhörande uppgiften
      const taskMessages = await taskMessageService.getMessagesByTaskId(task.id);
      
      setFormData({
        id: updatedTask.id,
        title: updatedTask.title || '',
        description: updatedTask.description || '',
        dueDate: formatDateForInput(new Date(updatedTask.dueDate)) || '',
        status: updatedTask.status || '',
        priority: updatedTask.priority || '',
        assignedToUserId: updatedTask.assignedToUserId || '',
        apartmentId: updatedTask.apartmentId || '',
        tenantId: updatedTask.tenantId || '',
        comments: updatedTask.comments || '',
        isRecurring: updatedTask.isRecurring || false,
        recurringPattern: updatedTask.recurringPattern || '',
        descriptionLanguage: updatedTask.descriptionLanguage || 'sv',
        phoneNumber: updatedTask.phoneNumber || '',
      });
      
      // Kontrollera om användaren kan redigera uppgiften eller bara visa den
      // USER kan endast redigera uppgifter som är tilldelade dem själva
      const canEdit = hasRole(['ADMIN', 'SUPERADMIN']) || 
                      updatedTask.assignedToUserId === currentUser.id;
      
      setSelectedTask({
        ...updatedTask,
        messages: taskMessages || [],
        canEdit: canEdit
      });
      
      setIsTaskModalOpen(true);
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError(t('tasks.errors.fetchFailed'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      phoneNumber: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTask) {
        // Kontrollera om användaren kan redigera uppgiften
        if (!selectedTask.canEdit) {
          setError(t('calendar.errors.permissionDenied'));
          return;
        }
        
        // För USER-rollen, begränsa vilka fält som kan uppdateras
        if (!hasRole(['ADMIN', 'SUPERADMIN'])) {
          // USER kan bara ändra status, kommentarer och datum på sina egna uppgifter
          // Behåll alla viktiga fält från den ursprungliga uppgiften
          const allowedUpdates = {
            ...selectedTask, // Bevara alla ursprungliga värden
            id: selectedTask.id,
            status: formData.status,
            comments: formData.comments,
            dueDate: formData.dueDate,
            assignedToUserId: selectedTask.assignedToUserId // Behåll den ursprungliga tilldelningen
          };
          
          await taskService.updateTask(selectedTask.id, allowedUpdates);
        } else {
          // ADMIN och SUPERADMIN kan uppdatera alla fält
          // Säkerställ att all ursprunglig information bevaras om den inte uttryckligen ändrats
          const updatedTask = {
            ...selectedTask, // Bevara ursprungliga värden
            ...formData,     // Lägg till/ersätt med nya värden
            id: selectedTask.id
          };
          
          // Kontrollera att viktiga fält inte går förlorade
          if (!updatedTask.assignedToUserId && selectedTask.assignedToUserId) {
            updatedTask.assignedToUserId = selectedTask.assignedToUserId;
          }
          
          await taskService.updateTask(selectedTask.id, updatedTask);
        }
      } else {
        // Endast ADMIN och SUPERADMIN kan skapa nya uppgifter
        if (hasRole(['ADMIN', 'SUPERADMIN'])) {
          await taskService.createTask(formData);
        } else {
          setError(t('calendar.errors.permissionDenied'));
          return;
        }
      }
      
      await fetchCalendarData();
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      resetForm();
      setSuccessMessage(t(selectedTask ? 'tasks.messages.statusUpdateSuccess' : 'tasks.messages.saveSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error submitting task:', err);
      setError(t('tasks.messages.error'));
    }
  };

  const handleShowingClick = (showing) => {
    setSelectedShowing(showing);
    setIsShowingModalOpen(true);
  };

  const handleDayClick = (date) => {
    // Endast ADMIN och SUPERADMIN kan lägga till nya uppgifter
    if (!hasRole(['ADMIN', 'SUPERADMIN'])) return;
    
    setCurrentDate(date);
    setFormData({
      ...formData,
      dueDate: formatDateForInput(date)
    });
    setIsTaskModalOpen(true);
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
      if (selectedShowing) {
        await showingService.update(selectedShowing.id, showingFormData);
      } else {
        await showingService.create(showingFormData);
      }
      await fetchCalendarData();
      setIsShowingEditModalOpen(false);
      setSelectedShowing(null);
      setShowingFormData({
        title: '',
        description: '',
        dateTime: '',
        status: '',
        assignedToUserId: '',
        apartmentId: '',
        notes: '',
        descriptionLanguage: 'sv',
        contactName: '',
        contactPhone: '',
        contactEmail: ''
      });
      setSuccessMessage(t(selectedShowing ? 'showings.messages.updateSuccess' : 'showings.messages.createSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error submitting showing:', err);
      setError(t('showings.messages.error'));
    }
  };

  const handleEditShowing = (showing) => {
    setShowingFormData({
      ...showing,
      dateTime: showing.dateTime ? showing.dateTime.split('.')[0] : '',
    });
    setIsShowingEditModalOpen(true);
    setIsShowingModalOpen(false);
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
      <div className="p-4">
        <div className="flex flex-col xl:flex-row justify-between mb-4 items-start xl:items-center">
          <h1 className="text-2xl font-bold mb-2 xl:mb-0">{t('calendar.title')}</h1>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex space-x-1">
              <button
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={goToPreviousMonth}
                aria-label={t('calendar.previousMonth')}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={goToToday}
              >
                {t('calendar.today')}
              </button>
              <button
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={goToNextMonth}
                aria-label={t('calendar.nextMonth')}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex space-x-1">
              <button
                className={`px-3 py-1 border ${viewType === 'month' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : 'border-gray-300 dark:border-gray-600'} rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                onClick={() => setViewType('month')}
              >
                {t('calendar.month')}
              </button>
              <button
                className={`px-3 py-1 border ${viewType === 'week' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : 'border-gray-300 dark:border-gray-600'} rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                onClick={() => setViewType('week')}
              >
                {t('calendar.week')}
              </button>
              <button
                className={`px-3 py-1 border ${viewType === 'day' ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600'} rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                onClick={() => setViewType('day')}
              >
                {t('calendar.day')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Information för USER-rollen */}
        {!hasRole(['ADMIN', 'SUPERADMIN']) && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 mt-0.5" />
              <div>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {t('calendar.viewOnly')}
                </p>
                <p className="text-blue-800 dark:text-blue-200 text-sm mt-1">
                  {t('calendar.permissions.editOwn')}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Felmeddelanden */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        
        {/* Framgångsmeddelanden */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {viewType === 'month' && (
          <>
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
          </>
        )}
        {viewType === 'week' && renderWeekView()}
        {viewType === 'day' && renderDayView()}
      </div>

      {isTaskModalOpen && (
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          title={selectedTask ? t('tasks.fields.details') : t('tasks.add')}
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.fields.title')}
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                readOnly={selectedTask && !selectedTask.canEdit}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.fields.description')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="4"
                readOnly={selectedTask && !selectedTask.canEdit}
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tasks.fields.dueDate')}
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  readOnly={selectedTask && !selectedTask.canEdit && !hasRole(['USER'])}
                />
              </div>
              
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
                  disabled={selectedTask && !selectedTask.canEdit}
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
                  disabled={selectedTask && !selectedTask.canEdit}
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
                  disabled={selectedTask && !selectedTask.canEdit}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                {t('showings.fields.assignedToUserId')}
              </label>
              <div className="mt-1 bg-gray-50 dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-2 p-4 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="text-gray-700 dark:text-gray-200">
                    <span className="font-semibold">Kontaktperson: </span>
                    <span>{showingFormData.contactName}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200">
                    <span className="font-semibold">Telefon: </span>
                    <span>{showingFormData.contactPhone}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200">
                    <span className="font-semibold">E-post: </span>
                    <span>{showingFormData.contactEmail}</span>
                  </div>
                </div>
              </div>
            </div>

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
