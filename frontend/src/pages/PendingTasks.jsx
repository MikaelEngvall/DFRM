import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import { pendingTaskService, pendingEmailReportService, taskService, apartmentService, tenantService, userService, taskMessageService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import TaskMessages from '../components/TaskMessages';

const PendingTasks = () => {
  const { t, currentLocale } = useLocale();
  const { user: currentUser } = useAuth();
  const [pendingTasks, setPendingTasks] = useState([]);
  const [emailReports, setEmailReports] = useState([]);
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

  // Kolumner för väntande uppgifter från email-rapporter
  const emailReportColumns = [
    {
      key: 'name',
      label: 'Från',
      render: (name) => name || 'Okänd'
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (phone) => phone || '-'
    },
    {
      key: 'address',
      label: 'Var',
      render: (_, report) => {
        if (report.address && report.apartment) {
          return `${report.address}, lgh ${report.apartment}`;
        } else if (report.address) {
          return report.address;
        } else {
          return 'Ej angiven';
        }
      }
    },
    {
      key: 'description',
      label: 'Vad',
      render: (description) => {
        // Trimma beskrivningen till max 80 tecken för bättre visning i tabellen
        if (description && description.length > 80) {
          return `${description.substring(0, 80)}...`;
        }
        return description || 'Ingen beskrivning';
      }
    },
    {
      key: 'received',
      label: 'När',
      render: (date) => date ? formatMonthDay(date) : '-'
    }
  ];

  // Formatera datum som "månad dag" (t.ex. "mars 15")
  const formatMonthDay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = date.toLocaleString('sv-SE', { month: 'long' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Originalkolumner för vanliga väntande uppgifter
  const pendingTaskColumns = [
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
      // Hämta både vanliga väntande uppgifter och e-postrapporter
      const [pendingData, emailReportsData] = await Promise.all([
        pendingTaskService.getPendingTasksForReview(),
        pendingTaskService.getEmailReports()
      ]);
      
      setPendingTasks(pendingData);
      setEmailReports(emailReportsData);
      
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

  const handleRowClick = (item) => {
    setSelectedTask(item);
    
    // Kontrollera om det är en e-postrapport (om det har name, email, etc. men ingen task)
    const isEmailReport = !item.task && item.name;
    
    if (isEmailReport) {      
      // Hitta lägenhetsobjekt baserat på apartmentId om det finns
      let apartmentObj = '';
      if (item.apartmentId) {
        const foundApartment = apartments.find(apt => apt.id === item.apartmentId);
        if (foundApartment) {
          apartmentObj = foundApartment.id;
        }
      }
      
      // Hitta hyresgästobjekt baserat på tenantId om det finns
      let tenantObj = '';
      if (item.tenantId) {
        const foundTenant = tenants.find(t => t.id === item.tenantId);
        if (foundTenant) {
          tenantObj = foundTenant.id;
        }
      }
      
      // Förifyll formulär med data från e-postrapporten
      setFormData({
        title: `${item.address || ''} ${item.apartment || ''}`.trim(),
        description: item.description || '',
        dueDate: '',
        priority: 'MEDIUM',
        status: 'NEW',
        assignedToUserId: '',
        assignedByUserId: currentUser.id,
        // Använd apartmentId om det finns, annars försök hitta lägenheten baserat på adress och apartment
        apartmentId: apartmentObj,
        // Använd tenantId om det finns
        tenantId: tenantObj,
        comments: '',
        isRecurring: false,
        recurringPattern: '',
      });
    } else if (item.task) {
      // Fixa tidszonsproblemet för befintliga uppgifter
      let dueDateString = '';
      
      if (item.task.dueDate) {
        // Konvertera ISO-datumsträngen till ett lokalt datum
        // Vi behöver skapa ett datum utan tidskomponent i lokal tidszon
        const dueDate = new Date(item.task.dueDate);
        
        // Använd lokal tidszon för att säkerställa att datumet visas korrekt
        const year = dueDate.getFullYear();
        const month = String(dueDate.getMonth() + 1).padStart(2, '0'); // +1 eftersom JS-månader är 0-indexerade
        const day = String(dueDate.getDate()).padStart(2, '0');
        
        dueDateString = `${year}-${month}-${day}`;
      }
      
      // Förifyll formulär med task-information för vanliga väntande uppgifter
      setFormData({
        title: item.task.title || '',
        description: item.task.description || '',
        dueDate: dueDateString,
        priority: item.task.priority || '',
        status: item.task.status || '',
        assignedToUserId: item.task.assignedToUserId || '',
        assignedByUserId: item.task.assignedByUserId || '',
        apartmentId: item.task.apartmentId || '',
        tenantId: item.task.tenantId || '',
        comments: item.task.comments || '',
        isRecurring: item.task.isRecurring || false,
        recurringPattern: item.task.recurringPattern || '',
      });
    }
    
    setReviewComments('');
    setIsReviewModalOpen(true);
  };

  const handleReviewClick = (pendingTask) => {
    handleRowClick(pendingTask);
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
      const isEmailReport = !selectedTask.task && selectedTask.name;
      
      // Skapa en kopia av formulärdatan och logga för felsökning
      let taskData = { ...formData };
      
      // Säkerställ att tenantId och apartmentId är strängar, inte objekt
      if (taskData.tenantId && typeof taskData.tenantId === 'object') {
        taskData.tenantId = taskData.tenantId.id;
      }
      
      if (taskData.apartmentId && typeof taskData.apartmentId === 'object') {
        taskData.apartmentId = taskData.apartmentId.id;
      }
      
      if (isEmailReport) {
        // Fixa tidszonsproblemet för dueDate
        
        if (taskData.dueDate) {
          // Konvertera datumet till en "tidlös" ISO-sträng för att undvika tidszonsförskjutningar
          // Datumet sparas som "YYYY-MM-DDT12:00:00Z" för att säkerställa att det inte ändras
          const dueDateParts = taskData.dueDate.split('-');
          if (dueDateParts.length === 3) {
            const year = parseInt(dueDateParts[0]);
            const month = parseInt(dueDateParts[1]) - 1; // JS månad är 0-baserad
            const day = parseInt(dueDateParts[2]);
            
            // Skapa ett nytt datum med klockan satt till 12:00 för att undvika tidszonsövergångar
            const fixedDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
            taskData.dueDate = fixedDate.toISOString();
          }
        }
        
        console.log('Skickar e-postrapportdata till servern:', taskData);
        
        // Konvertera e-postrapporten till en uppgift med korrigerat datum
        await pendingEmailReportService.convertToTask(selectedTask.id, {
          ...taskData,
          assignedByUserId: currentUser.id
        });
      } else {
        // Uppdatera uppgiften före godkännande för vanliga väntande uppgifter
        // Fixa tidszonsproblemet även här för konsekvens
        
        if (taskData.dueDate) {
          const dueDateParts = taskData.dueDate.split('-');
          if (dueDateParts.length === 3) {
            const year = parseInt(dueDateParts[0]);
            const month = parseInt(dueDateParts[1]) - 1; // JS månad är 0-baserad
            const day = parseInt(dueDateParts[2]);
            
            const fixedDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
            taskData.dueDate = fixedDate.toISOString();
          }
        }
        
        console.log('Skickar uppgiftsdata till servern:', taskData);
        
        await taskService.updateTask(selectedTask.task.id, taskData);
        
        // Godkänn uppgiften
        const reviewData = {
          reviewedById: currentUser.id,
          comment: reviewComments
        };
        await pendingTaskService.approvePendingTask(selectedTask.id, reviewData);
      }
      
      // Uppdatera antalet olästa uppgifter genom att hämta det direkt från API:et
      // Detta säkerställer att Dashboard-sidan visar rätt antal
      await pendingTaskService.getUnreviewedCount(true);
      
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
      const isEmailReport = !selectedTask.task && selectedTask.name;
      
      // Skapa en kopia av formulärdatan och logga för felsökning
      let taskData = { ...formData };
      console.log('Formulärdata före avvisning:', taskData);
      
      // Säkerställ att tenantId och apartmentId är strängar, inte objekt
      if (taskData.tenantId && typeof taskData.tenantId === 'object') {
        taskData.tenantId = taskData.tenantId.id;
      }
      
      if (taskData.apartmentId && typeof taskData.apartmentId === 'object') {
        taskData.apartmentId = taskData.apartmentId.id;
      }
      
      if (isEmailReport) {
        // Avvisa e-postrapporten
        await pendingEmailReportService.rejectEmailReport(
          selectedTask.id,
          currentUser.id,
          reviewComments
        );
      } else {
        // Uppdatera uppgiften före avvisning för vanliga väntande uppgifter
        // Fixa tidszonsproblemet även här för avvisade uppgifter
        
        if (taskData.dueDate) {
          const dueDateParts = taskData.dueDate.split('-');
          if (dueDateParts.length === 3) {
            const year = parseInt(dueDateParts[0]);
            const month = parseInt(dueDateParts[1]) - 1; // JS månad är 0-baserad
            const day = parseInt(dueDateParts[2]);
            
            const fixedDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
            taskData.dueDate = fixedDate.toISOString();
          }
        }
        
        console.log('Skickar avvisad uppgiftsdata till servern:', taskData);
        
        await taskService.updateTask(selectedTask.task.id, taskData);
        
        // Avvisa uppgiften
        const reviewData = {
          reviewedById: currentUser.id,
          comment: reviewComments
        };
        await pendingTaskService.rejectPendingTask(selectedTask.id, reviewData);
      }
      
      // Uppdatera antalet olästa uppgifter genom att hämta det direkt från API:et
      // Detta säkerställer att Dashboard-sidan visar rätt antal
      await pendingTaskService.getUnreviewedCount(true);
      
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
    // Visa endast e-postrapporter om vi är på fliken "Väntande uppgifter"
    if (!showApproved) {
      return emailReports;
    }
    
    // Lägg till approved-flaggan för styling
    // Alla uppgifter som har task.status === "APPROVED" är godkända och ska visas
    const approved = approvedTasks.map(task => ({
      ...task,
      approved: true
    }));
    
    return [...pendingTasks, ...approved];
  };

  const getColumns = () => {
    // Använd e-postrapportkolumner om vi är på fliken "Väntande uppgifter"
    if (!showApproved) {
      return emailReportColumns;
    }
    
    // Annars använd vanliga väntande uppgiftskolumner
    return pendingTaskColumns;
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

  // Avgör om den valda uppgiften är en e-postrapport
  const isEmailReport = selectedTask && !selectedTask.task && selectedTask.name;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-cinzel dark:text-white">
          {!showApproved ? t('pendingTasks.title') : t('pendingTasks.title')}
        </h1>
        <div className="flex space-x-2 items-center">
          <label className="inline-flex items-center text-sm">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600"
              checked={showApproved}
              onChange={handleShowApprovedChange}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">{t('pendingTasks.showApproved')}</span>
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
          <p className="text-gray-500 dark:text-gray-400">
            {!showApproved ? t('pendingTasks.noTasks') : t('pendingTasks.noTasks')}
          </p>
        </div>
      ) : (
        <DataTable
          columns={getColumns()}
          data={getDisplayData()}
          onRowClick={handleRowClick}
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
          title={isEmailReport ? t('pendingTasks.emailReport') : t('pendingTasks.reviewRequest')}
          showFooter={false}
        >
          <div className="grid grid-cols-1 gap-4">
            {/* Visa kontaktinformation endast för e-postrapporter */}
            {isEmailReport && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('pendingTasks.fields.sender')}</h3>
                  <p className="mt-1">{selectedTask.name || t('common.notSpecified')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('pendingTasks.fields.contactInfo')}</h3>
                  <p className="mt-1">{t('pendingTasks.fields.email')}: {selectedTask.email || t('common.notSpecified')}</p>
                  <p className="mt-1">{t('pendingTasks.fields.phone')}: {selectedTask.phone || t('common.notSpecified')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('pendingTasks.fields.address')}</h3>
                  <p className="mt-1">
                    {selectedTask.address || t('common.notSpecified')}
                    {selectedTask.apartment ? `, ${t('pendingTasks.fields.apt')} ${selectedTask.apartment}` : ''}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('pendingTasks.fields.description')}</h3>
                  <div className="mt-1 border rounded p-3 bg-gray-50 dark:bg-gray-700 whitespace-pre-wrap">
                    {selectedTask.description || t('pendingTasks.noDescription')}
                  </div>
                </div>
              </>
            )}
            
            <FormInput
              label={t('tasks.fields.title')}
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              required
              error={formData.title.trim() === '' && 'Titel är obligatorisk'}
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
                  <option value="NEW">{t('tasks.status.NEW')}</option>
                  <option value="IN_PROGRESS">{t('tasks.status.IN_PROGRESS')}</option>
                  <option value="NOT_FEASIBLE">{t('tasks.status.NOT_FEASIBLE')}</option>
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
          {!isEmailReport && (
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
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tasks.messages.title')}
              </label>
              <div className="relative">
                <textarea
                  value={reviewComments}
                  onChange={handleReviewCommentsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="4"
                  placeholder={t('tasks.messages.inputPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (reviewComments.trim() && selectedTask && selectedTask.id) {
                      taskMessageService.createMessage(selectedTask.id, reviewComments, currentLocale);
                      setReviewComments('');
                    }
                  }}
                  disabled={!reviewComments.trim() || !selectedTask || !selectedTask.id}
                  className="absolute bottom-2 right-2 p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Visa befintliga meddelanden om en uppgift är vald */}
          {selectedTask && selectedTask.id && (
            <div className="mt-4">
              <TaskMessages 
                taskId={selectedTask.id} 
                canSendMessages={false} // Använd textfältet ovan istället för det inbyggda
              />
            </div>
          )}

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReject}
              className="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {isEmailReport ? 'Avvisa' : t('pendingTasks.actions.reject')}
            </button>
            <button
              onClick={handleApprove}
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {isEmailReport ? 'Godkänn' : t('pendingTasks.actions.approve')}
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