import React, { useState, useEffect, useRef } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import Autocomplete from '../components/Autocomplete';
import Title from '../components/Title';
import { PlusIcon, PaperAirplaneIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { taskService, apartmentService, tenantService, userService, taskMessageService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { useTaskModal } from '../contexts/TaskModalContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TaskMessages from '../components/TaskMessages';

const Tasks = () => {
  const { t, currentLocale } = useLocale();
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const queryParams = new URLSearchParams(location.search);
  const { isTaskModalOpen, initialTaskData, openTaskModal, closeTaskModal } = useTaskModal();
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
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
  const [filters, setFilters] = useState({
    apartmentId: queryParams.get('apartmentId') || '',
    tenantId: queryParams.get('tenantId') || '',
    status: queryParams.get('status') || '',
    priority: queryParams.get('priority') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const initialDataProcessedRef = useRef(false);
  const initialLoadRef = useRef(false);

  const renderAssignedUser = (assignedUserId) => {
    if (!assignedUserId) return '-';
    const user = users.find(u => u.id === assignedUserId);
    return user ? `${user.firstName} ${user.lastName}` : '-';
  };

  const columns = [
    {
      key: 'title',
      label: t('tasks.fields.title')
    },
    {
      key: 'dueDate',
      label: t('tasks.fields.dueDate'),
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      key: 'priority',
      label: t('tasks.fields.priority'),
      render: (priority) => priority ? t(`tasks.priorities.${priority}`) : '-'
    },
    {
      key: 'status',
      label: t('tasks.fields.status'),
      render: (status) => status ? t(`tasks.status.${status}`) : '-'
    },
    {
      key: 'assignedToUserId',
      label: t('tasks.fields.assignedUser'),
      render: renderAssignedUser
    },
    {
      key: 'apartmentId',
      label: t('tasks.fields.apartment'),
      render: (apartmentId) => {
        if (!apartmentId) return '-';
        const apt = apartments.find(a => a.id === apartmentId);
        return apt ? `${apt.street} ${apt.number}, LGH ${apt.apartmentNumber}` : '-';
      }
    },
  ];

  useEffect(() => {
    fetchInitialData();
    
    // Hantera URL-parametrar - men endast en gång vid första renderingen
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      
      if (queryParams.get('tenantId')) {
        openTaskModal({
          tenantId: queryParams.get('tenantId')
        });
        return; // Avsluta early för att undvika att processa initialData i samma rendering
      } else if (queryParams.get('apartmentId')) {
        openTaskModal({
          apartmentId: queryParams.get('apartmentId')
        });
        return; // Avsluta early för att undvika att processa initialData i samma rendering
      }
    }
    
    // Om vi har initialTaskData och vi inte redan har bearbetat det
    if (initialTaskData && 
        Object.keys(initialTaskData).length > 0 && 
        !initialDataProcessedRef.current && 
        apartments.length > 0 && 
        tenants.length > 0) {
      
      initialDataProcessedRef.current = true;
      
      // Uppdatera formuläret med initialTaskData
      setFormData(prev => ({
        ...prev,
        ...initialTaskData
      }));
      
      // Om vi har tenant-objektet, använd det för att fylla i tenantId och eventuell lägenhet
      if (initialTaskData.tenant) {
        const tenant = initialTaskData.tenant;
        
        // Uppdatera formData med hyresgäst och eventuell lägenhet
        setFormData(prev => ({
          ...prev,
          tenantId: tenant.id,
          // Om hyresgästen har en lägenhet kopplad, fyll i den också
          apartmentId: tenant.apartmentId || 
                      (tenant.apartment && typeof tenant.apartment === 'object' ? tenant.apartment.id : tenant.apartment)
        }));
        
        // Nu när vi har ställt in initial data, återställ context för att förhindra ytterligare loopar
        setTimeout(() => initialDataProcessedRef.current = false, 500);
      } 
      // Om vi bara har tenantId, använd det
      else if (initialTaskData.tenantId) {
        setFormData(prev => ({
          ...prev,
          tenantId: initialTaskData.tenantId
        }));
        
        // Leta efter hyresgästen för att se om den har en lägenhet kopplad
        const tenant = tenants.find(t => t.id === initialTaskData.tenantId);
        if (tenant) {
          handleTenantSelect(tenant);
        }
        
        // Nu när vi har ställt in initial data, återställ context för att förhindra ytterligare loopar
        setTimeout(() => initialDataProcessedRef.current = false, 500);
      }
      
      // Om vi har apartment-objektet, använd det
      if (initialTaskData.apartment) {
        const apartment = initialTaskData.apartment;
        
        // Uppdatera formData med lägenhet
        setFormData(prev => ({
          ...prev,
          apartmentId: apartment.id
        }));
        
        // Om det finns hyresgäster kopplade till lägenheten, fyll i första hyresgästen
        if (apartment.tenants && apartment.tenants.length > 0) {
          handleApartmentSelect(apartment);
        }
      } 
      // Om vi bara har apartmentId, använd det
      else if (initialTaskData.apartmentId) {
        setFormData(prev => ({
          ...prev,
          apartmentId: initialTaskData.apartmentId
        }));
        
        // Leta efter lägenheten för att se om den har hyresgäster
        const apartment = apartments.find(a => a.id === initialTaskData.apartmentId);
        if (apartment) {
          handleApartmentSelect(apartment);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTaskData, apartments.length, tenants.length, openTaskModal]);
  
  // När modalen stängs, återställ initialDataProcessedRef
  useEffect(() => {
    if (!isTaskModalOpen) {
      initialDataProcessedRef.current = false;
    }
  }, [isTaskModalOpen]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Hämta uppgifter med filter
      const tasksData = await taskService.getAllTasks(filters);
      
      // Hämta referensdata för att visa detaljer (använder cache automatiskt)
      const [apartmentsData, tenantsData, usersData] = await Promise.all([
        apartmentService.getAllApartmentsWithTenants(), // Använder cache automatiskt
        tenantService.getAllTenants(), // Använder cache automatiskt
        userService.getAllUsers(), // Använder cache automatiskt
      ]);
      
      setTasks(tasksData);
      setApartments(apartmentsData);
      setTenants(tenantsData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // När en hyresgäst väljs, uppdatera lägenhetsfältet om hyresgästen har en kopplad lägenhet
  const handleTenantSelect = (tenant) => {
    // Uppdatera alltid formData med vald hyresgäst
    setFormData(prev => ({
      ...prev,
      tenantId: tenant.id
    }));
    
    // Kolla om hyresgästen har en lägenhet
    if (tenant) {
      // Olika API-implementationer kan returnera olika strukturer
      // Variant 1: tenant.apartment är ett ID
      if (tenant.apartmentId) {
        setFormData(prev => ({
          ...prev,
          apartmentId: tenant.apartmentId
        }));
        console.log(`Hittade lägenhet direkt via tenant.apartmentId: ${tenant.apartmentId}`);
      } 
      // Variant 2: tenant.apartment är ett objekt
      else if (tenant.apartment && typeof tenant.apartment === 'object' && tenant.apartment.id) {
        setFormData(prev => ({
          ...prev,
          apartmentId: tenant.apartment.id
        }));
        console.log(`Hittade lägenhet direkt via tenant.apartment.id: ${tenant.apartment.id}`);
      }
      // Variant 3: tenant.apartment är ett ID som sträng
      else if (tenant.apartment && typeof tenant.apartment === 'string') {
        setFormData(prev => ({
          ...prev,
          apartmentId: tenant.apartment
        }));
        console.log(`Hittade lägenhet direkt via tenant.apartment: ${tenant.apartment}`);
      }
      // Om ingen av ovanstående, leta efter lägenheten i listan
      else {
        // Sök i apartments efter en lägenhet som har denna hyresgäst kopplad
        const relatedApartment = apartments.find(apt => 
          apt.tenants && apt.tenants.some(t => 
            (typeof t === 'string' && t === tenant.id) || 
            (typeof t === 'object' && t.id === tenant.id)
          )
        );
        
        if (relatedApartment) {
          setFormData(prev => ({
            ...prev,
            apartmentId: relatedApartment.id
          }));
          console.log(`Hittade lägenhet via sökning: ${relatedApartment.street} ${relatedApartment.number}, LGH ${relatedApartment.apartmentNumber}`);
        } else {
          console.log('Hittade ingen lägenhet kopplad till denna hyresgäst');
        }
      }
    }
  };

  // Förbättrad funktion för att hantera val av lägenhet
  const handleApartmentSelect = (apartment) => {
    // Uppdatera alltid formData med vald lägenhet
    setFormData(prev => ({
      ...prev,
      apartmentId: apartment.id
    }));
    
    // Om lägenheten har kopplade hyresgäster
    if (apartment && apartment.tenants && apartment.tenants.length > 0) {
      // I vissa API-implementationer kan tenants vara en array av ID:n
      if (typeof apartment.tenants[0] === 'string') {
        const tenantId = apartment.tenants[0];
        const relatedTenant = tenants.find(t => t.id === tenantId);
        
        if (relatedTenant) {
          setFormData(prev => ({
            ...prev,
            tenantId: relatedTenant.id
          }));
          console.log(`Hittade hyresgäst direkt via apartment.tenants: ${relatedTenant.firstName} ${relatedTenant.lastName}`);
        }
      } 
      // I andra API-implementationer kan det vara en array av objekt
      else if (typeof apartment.tenants[0] === 'object' && apartment.tenants[0].id) {
        const tenantId = apartment.tenants[0].id;
        setFormData(prev => ({
          ...prev,
          tenantId: tenantId
        }));
        console.log(`Hittade hyresgäst direkt via apartment.tenants[0].id: ${tenantId}`);
      }
    } else {
      console.log('Lägenheten har inga kopplade hyresgäster, söker efter relaterade hyresgäster...');
      
      // Alternativ metod: Sök efter alla hyresgäster som har denna lägenhet kopplad till sig
      const relatedTenants = tenants.filter(tenant => 
        tenant.apartment && (
          tenant.apartment === apartment.id || 
          (typeof tenant.apartment === 'object' && tenant.apartment.id === apartment.id) || 
          tenant.apartmentId === apartment.id
        )
      );
      
      if (relatedTenants.length > 0) {
        console.log(`Hittade relaterad hyresgäst genom sökning: ${relatedTenants[0].firstName} ${relatedTenants[0].lastName}`);
        setFormData(prev => ({
          ...prev,
          tenantId: relatedTenants[0].id
        }));
      } else {
        console.log('Hittade inga relaterade hyresgäster för denna lägenhet');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      console.log('handleSubmit - formData:', formData);
      console.log('handleSubmit - selectedTask:', selectedTask);
      
      // Om vi redigerar en befintlig uppgift
      if (selectedTask) {
        console.log('Redigerar befintlig uppgift med ID:', selectedTask.id);
        
        // Se till att alla fält från ursprungliga uppgiften bevaras om de inte explicit ändrats
        const taskData = {
          ...selectedTask, // Behåll alla originalfält från selectedTask
          ...formData,     // Lägg till/uppdatera med ändringar från formuläret
          id: selectedTask.id  // Säkerställ att ID:t inkluderas
        };
        
        // Säkerställ att assignedToUserId inte går förlorad
        if (!taskData.assignedToUserId && selectedTask.assignedToUserId) {
          taskData.assignedToUserId = selectedTask.assignedToUserId;
        }
        
        // Logga vilken funktion som anropas
        console.log('Anropar taskService.updateTask med ID:', selectedTask.id);
        console.log('och data:', taskData);
        
        await taskService.updateTask(selectedTask.id, taskData);
      } 
      // Annars skapar vi en ny uppgift
      else {
        console.log('Skapar ny uppgift');
        
        const taskData = {
          ...formData,
          assignedByUserId: currentUser.id
        };
        
        console.log('Anropar taskService.createTask med data:', taskData);
        
        await taskService.createTask(taskData);
      }
      
      closeTaskModal();
      fetchInitialData();
    } catch (err) {
      console.error('Error handling task:', err);
      setError(selectedTask ? t('tasks.errors.updateError') : t('tasks.errors.createError'));
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
    closeTaskModal();
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    
    // Extrahera ID från objekt om det behövs
    const assignedToUserId = task.assignedToUserId || '';
    
    const apartmentId = task.apartmentId ? 
      (typeof task.apartmentId === 'object' ? task.apartmentId.id : task.apartmentId) : '';
    
    const tenantId = task.tenantId ? 
      (typeof task.tenantId === 'object' ? task.tenantId.id : task.tenantId) : '';
    
    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || '',
      status: task.status || '',
      assignedToUserId,
      assignedByUserId: task.assignedByUserId || '',
      apartmentId,
      tenantId,
      comments: task.comments || '',
      isRecurring: task.isRecurring || false,
      recurringPattern: task.recurringPattern || '',
    });
    
    openTaskModal();
  };

  const handleDelete = (task) => {
    setTaskToDelete(task);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await taskService.deleteTask(taskToDelete.id);
      await fetchInitialData();
      setIsAlertOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      setError(t('tasks.messages.deleteError'));
      console.error('Error deleting task:', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      await fetchInitialData();
    } catch (err) {
      setError(t('tasks.messages.statusUpdateError'));
      console.error('Error updating task status:', err);
    }
  };

  // Hantera filterändringar
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Applicera filter och uppdatera URL
  const applyFilters = () => {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });
    
    navigate(`/tasks?${searchParams.toString()}`);
    fetchInitialData();
  };

  // Rensa filter
  const clearFilters = () => {
    setFilters({
      apartmentId: '',
      tenantId: '',
      status: '',
      priority: '',
    });
    navigate('/tasks');
    fetchInitialData();
  };

  const handleRowClick = async (task) => {
    try {
      // Hämta fullständig uppgiftsinformation från API för att garantera att alla detaljer finns
      const fullTaskData = await taskService.getTaskById(task.id);
      setSelectedTask(fullTaskData);
      
      // Extrahera ID från objekt om det behövs
      const assignedToUserId = fullTaskData.assignedToUserId || '';
      
      const apartmentId = fullTaskData.apartmentId ? 
        (typeof fullTaskData.apartmentId === 'object' ? fullTaskData.apartmentId.id : fullTaskData.apartmentId) : '';
      
      const tenantId = fullTaskData.tenantId ? 
        (typeof fullTaskData.tenantId === 'object' ? fullTaskData.tenantId.id : fullTaskData.tenantId) : '';
      
      // Uppdatera formData med värdena från den hämtade uppgiften
      setFormData({
        title: fullTaskData.title || '',
        description: fullTaskData.description || '',
        dueDate: fullTaskData.dueDate ? new Date(fullTaskData.dueDate).toISOString().split('T')[0] : '',
        priority: fullTaskData.priority || '',
        status: fullTaskData.status || '',
        assignedToUserId,
        assignedByUserId: fullTaskData.assignedByUserId || '',
        apartmentId,
        tenantId,
        comments: '',
        isRecurring: fullTaskData.isRecurring || false,
        recurringPattern: fullTaskData.recurringPattern || '',
      });
      
      // Öppna modalen
      openTaskModal();
    } catch (err) {
      console.error('Error fetching full task data:', err);
      // Fallback till att använda uppgiften från listan om API-anropet misslyckas
      setSelectedTask(task);
      
      // Extrahera ID från objekt om det behövs
      const assignedToUserId = task.assignedToUserId || '';
      
      const apartmentId = task.apartmentId ? 
        (typeof task.apartmentId === 'object' ? task.apartmentId.id : task.apartmentId) : '';
      
      const tenantId = task.tenantId ? 
        (typeof task.tenantId === 'object' ? task.tenantId.id : task.tenantId) : '';
      
      // Uppdatera formData med värdena från uppgiften
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        priority: task.priority || '',
        status: task.status || '',
        assignedToUserId,
        assignedByUserId: task.assignedByUserId || '',
        apartmentId,
        tenantId,
        comments: '',
        isRecurring: task.isRecurring || false,
        recurringPattern: task.recurringPattern || '',
      });
      
      // Öppna modalen
      openTaskModal();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Title level="h1">
          {t('tasks.title')}
        </Title>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            {t('common.filters')}
          </button>
          <button
            onClick={() => {
              resetForm();
              setSelectedTask(null);
              openTaskModal();
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('tasks.add')}
          </button>
        </div>
      </div>
      
      {/* Felmeddelande */}
      {error && (
        <div className="bg-red-600 text-white p-3 mb-4 rounded-md">
          {error}
        </div>
      )}
      
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('common.filters')}</h2>
            <button 
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              {t('common.clear')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tasks.filters.apartment')}
              </label>
              <select
                name="apartmentId"
                value={filters.apartmentId}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                {apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.street} {apartment.number}, LGH {apartment.apartmentNumber}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tasks.filters.tenant')}
              </label>
              <select
                name="tenantId"
                value={filters.tenantId}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.firstName} {tenant.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tasks.filters.status')}
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                <option value="PENDING">{t('tasks.status.PENDING')}</option>
                <option value="IN_PROGRESS">{t('tasks.status.IN_PROGRESS')}</option>
                <option value="COMPLETED">{t('tasks.status.COMPLETED')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tasks.filters.priority')}
              </label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('common.all')}</option>
                <option value="LOW">{t('tasks.priorities.LOW')}</option>
                <option value="MEDIUM">{t('tasks.priorities.MEDIUM')}</option>
                <option value="HIGH">{t('tasks.priorities.HIGH')}</option>
                <option value="URGENT">{t('tasks.priorities.URGENT')}</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {tasks.length} {t('tasks.filteredResults', { count: tasks.length })}
            </div>
            <button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              {t('common.apply')}
            </button>
          </div>
        </div>
      )}
      
      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />
      
      {/* Modalform för att lägga till/redigera uppgifter */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          closeTaskModal();
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
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {selectedTask?.translations?.[currentLocale] || formData.description}
              </p>
            </div>
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
                onSelect={handleApartmentSelect}
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
                onSelect={handleTenantSelect}
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
                  if (formData.comments.trim()) {
                    // Spara meddelandet om uppgiften har ett ID
                    if (selectedTask && selectedTask.id) {
                      taskMessageService.createMessage(selectedTask.id, formData.comments, currentLocale);
                      setFormData({...formData, comments: ''});
                    }
                  }
                }}
                disabled={!formData.comments.trim() || !selectedTask || !selectedTask.id}
                className="absolute bottom-2 right-2 p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center">
              <input
                id="isRecurring"
                name="isRecurring"
                type="checkbox"
                checked={formData.isRecurring}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('tasks.fields.isRecurring')}
              </label>
            </div>
          </div>

          {formData.isRecurring && (
            <div>
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
                <option value="DAILY">{t('tasks.recurring.DAILY')}</option>
                <option value="WEEKLY">{t('tasks.recurring.WEEKLY')}</option>
                <option value="BIWEEKLY">{t('tasks.recurring.BIWEEKLY')}</option>
                <option value="MONTHLY">{t('tasks.recurring.MONTHLY')}</option>
                <option value="QUARTERLY">{t('tasks.recurring.QUARTERLY')}</option>
                <option value="YEARLY">{t('tasks.recurring.YEARLY')}</option>
              </select>
            </div>
          )}
        </div>
      </Modal>
      
      {/* Bekräftelsemodal för borttagning */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={confirmDelete}
        title={t('tasks.confirmDelete')}
        message={`${t('tasks.confirmDelete')} "${taskToDelete?.title}"?`}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      {/* Visa befintliga meddelanden om en uppgift är vald */}
      {selectedTask && selectedTask.id && (
        <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
          <TaskMessages 
            taskId={selectedTask.id} 
            canSendMessages={false} // Använd textfältet ovan istället för det inbyggda
          />
        </div>
      )}
    </div>
  );
};

export default Tasks; 