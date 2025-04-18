import React, { useState, useEffect, useRef } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import FormInput from '../components/FormInput';
import Title from '../components/Title';
import { pendingTaskService, pendingEmailReportService, taskService, apartmentService, tenantService, userService, taskMessageService, emailService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { PaperAirplaneIcon, EnvelopeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import TaskMessages from '../components/TaskMessages';
import { createLogger } from '../utils/logger';

// Skapa en logger för denna komponent
const logger = createLogger('PendingTasks');

const PendingTasks = () => {
  const { t, currentLocale } = useLocale();
  const { user: currentUser } = useAuth();
  const [pendingTasks, setPendingTasks] = useState([]);
  const [emailReports, setEmailReports] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [showApproved, setShowApproved] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const [isExporting, setIsExporting] = useState(false);

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
      render: (_, pendingTask) => {
        logger.debug('Task data for row:', pendingTask);
        return pendingTask.task?.title || 
              (pendingTask.description || '-');
      }
    },
    {
      key: 'requestedBy',
      label: t('pendingTasks.fields.requestedBy'),
      render: (_, pendingTask) => {
        if (pendingTask.requestedBy) {
          return `${pendingTask.requestedBy.firstName || ''} ${pendingTask.requestedBy.lastName || ''}`;
        } else if (pendingTask.requestedByTenant) {
          return `${pendingTask.requestedByTenant.firstName || ''} ${pendingTask.requestedByTenant.lastName || ''}`;
        } else if (pendingTask.name) {
          return pendingTask.name;
        } else {
          return '-';
        }
      }
    },
    {
      key: 'requestedAt',
      label: t('pendingTasks.fields.requestedAt'),
      render: (_, pendingTask) => pendingTask.requestedAt ? new Date(pendingTask.requestedAt).toLocaleString() : '-'
    },
    {
      key: 'taskPriority',
      label: t('tasks.fields.priority'),
      render: (_, pendingTask) => {
        const priority = pendingTask.task?.priority || 'MEDIUM';
        return t(`tasks.priorities.${priority}`);
      }
    },
    {
      key: 'taskStatus',
      label: t('tasks.fields.status'),
      render: (_, pendingTask) => {
        // Försök först med task, sedan med status på pendingTask och till sist med ett standardvärde
        const status = pendingTask.task?.status || pendingTask.status || 'PENDING';
        return t(`tasks.status.${status}`);
      }
    },
    {
      key: 'reviewedBy',
      label: t('pendingTasks.fields.reviewedBy'),
      render: (_, pendingTask) => {
        // Visa bara förnamnet på den som granskade uppgiften
        if (pendingTask.reviewedBy) {
          // Om reviewedBy är ett objekt med namn
          if (typeof pendingTask.reviewedBy === 'object') {
            return pendingTask.reviewedBy.firstName || '-';
          }
          // Om reviewedBy bara är ett ID, försök hämta användarens namn
          if (typeof pendingTask.reviewedBy === 'string') {
            // Här skulle vi behöva en funktion för att hämta användarnamn från ID
            // Tills vidare visa bara ID:t
            return pendingTask.reviewedBy;
          }
        }
        return '-';
      }
    },
    {
      key: 'reviewedAt',
      label: t('pendingTasks.fields.reviewedAt'),
      render: (_, pendingTask) => pendingTask.reviewedAt ? new Date(pendingTask.reviewedAt).toLocaleString() : '-'
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (_, pendingTask) => (
        <div className="flex space-x-2">
          {!pendingTask.reviewedBy && !pendingTask.approved && (
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

  // Lägg till en funktion för att skapa en testuppgift
  const handleCreateTestTask = async () => {
    try {
      setLoading(true);
      await pendingTaskService.checkEmails();
      // Ladda om data direkt efter att testuppgiften skapats
      await fetchData();
    } catch (error) {
      console.error("Fel vid skapande av testuppgift:", error);
      setError("Kunde inte skapa testuppgift: " + (error.message || "Okänt fel"));
    } finally {
      setLoading(false);
    }
  };

  // Lägg till en funktion för att manuellt ladda om data
  const handleRefreshData = async () => {
    try {
      setLoading(true);
      await fetchData();
    } catch (error) {
      console.error("Fel vid omladdning av data:", error);
      setError("Kunde inte ladda om data: " + (error.message || "Okänt fel"));
    } finally {
      setLoading(false);
    }
  };

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
      logger.error('Error fetching reference data:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Hämta både vanliga väntande uppgifter och e-postrapporter
      const [pendingData, emailReportsData] = await Promise.all([
        pendingTaskService.getUnreviewedTasks(),
        pendingEmailReportService.getAll()
      ]);
      
      console.log("Hämtade e-postrapporter (rå data):", emailReportsData);
      
      // Komplett lista med nyckelord som indikerar intresseanmälningar
      const interestKeywords = [
        // Svenska nyckelord
        "intresse", "lägenhet", "visning", "bostad", "ledig", "ledigt", 
        "flyttar", "flytta", "bostadsintresse", "bostadskö", "uthyrning",
        "hyra", "hyres", "lediga", "bostäder", "boende", "kontrakt",
        "inflyttning", "uthyres", "bobutik", "bostadsförmedling", "bostadsrätt",
        "bostadssökande", "bostadssituation", "nybyggd", "nyproduktion",

        // Engelska nyckelord
        "interest", "apartment", "showing", "housing", "vacant", "available", 
        "moving", "move", "rental", "rent", "renting", "accommodation",
        "vacancy", "residence", "property", "viewing", "new home", "contract",
        "relocation", "flat", "studio", "real estate", "home viewing", "lease",
        "tenancy", "new construction", "condo", "condominium",

        // Generella ord som ofta finns i intresseanmälningar
        "kvadratmeter", "kvm", "m²", "square meters", "sqm", "room size",
        "rumsstorlek", "våning", "floor", "balkong", "balcony", "utsikt", "view",
        "centralt", "central", "nycklar", "keys", "varmhyra", "kallhyra", "deposit",
        "deposition", "husdjur", "pets", "borgenär", "guarantor"
      ];
      
      // Hjälpfunktion för att kontrollera om en text innehåller intresserelaterade nyckelord
      const containsInterestKeyword = (text) => {
        if (!text) return false;
        const lowerText = text.toLowerCase();
        return interestKeywords.some(keyword => lowerText.includes(keyword));
      };
      
      // Hjälpfunktion för att kontrollera om objektet verkar vara en intresseanmälan
      const isInterestRelated = (obj) => {
        // 1. Kontrollera STATUS - den mest explicita indikatorn
        if (obj.status === 'INTEREST' || 
           (obj.status && obj.status.toLowerCase().includes('intresse'))) {
          return true;
        }
        
        // 2. Kontrollera TASK STATUS om det finns
        if (obj.task && 
           (obj.task.status === 'INTEREST' || 
           (obj.task.status && obj.task.status.toLowerCase().includes('intresse')))) {
          return true;
        }
        
        // 3. Kontrollera ÄMNE - viktigt för att identifiera e-postämnen relaterade till intresse
        if (obj.subject && containsInterestKeyword(obj.subject)) {
          return true;
        }
        
        // 4. Kontrollera E-POST - kan innehålla adresser relaterade till intresseanmälningar
        if (obj.email && containsInterestKeyword(obj.email)) {
          return true;
        }
        
        // 5. Kontrollera BESKRIVNING - huvudinnehållet som ofta avslöjar om det är en intresseanmälan
        if (obj.description && containsInterestKeyword(obj.description)) {
          return true;
        }
        
        // 6. Kontrollera TASK BESKRIVNING om det finns
        if (obj.task && obj.task.description && containsInterestKeyword(obj.task.description)) {
          return true;
        }
        
        // 7. Kontrollera TASK TITEL om det finns
        if (obj.task && obj.task.title && containsInterestKeyword(obj.task.title)) {
          return true;
        }
        
        // 8. Kontrollera NAMN på avsändaren - ibland innehåller även namnet ledtrådar
        if (obj.name && containsInterestKeyword(obj.name)) {
          return true;
        }
        
        // 9. Kontrollera ADRESS och LÄGENHETSNUMMER - dessa fält kan innehålla ledtrådar
        if ((obj.address && containsInterestKeyword(obj.address)) || 
            (obj.apartment && containsInterestKeyword(obj.apartment))) {
          return true;
        }
        
        // Nämner orden "intresse" eller "lägenhet" någonstans i något fält
        const allText = [
          obj.status, obj.subject, obj.email, obj.description, obj.name, 
          obj.address, obj.apartment, obj.task?.status, obj.task?.title, 
          obj.task?.description
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (allText.includes('intresse') || 
            allText.includes('interest') || 
            allText.includes('lägenhet') || 
            allText.includes('apartment') ||
            allText.includes('visning') ||
            allText.includes('showing')) {
          return true;
        }
        
        // Om vi kommer hit, är det troligen inte en intresseanmälan
        return false;
      };
      
      // Filtrera bort intresseanmälningar och redan granskade uppgifter
      const filteredPendingData = pendingData
        .filter(task => !isInterestRelated(task))
        .filter(task => !task.reviewedBy); // Viktig filtrering - visa bara uppgifter som inte har reviewedBy
      
      // Filtrera också bort intresseanmälningar från e-postrapporter, men visa alla som inte har reviewedBy
      // TEMP: Ta bort intressefiltreringen och visa alla e-postrapporter för felsökning
      // Ändrad för att visa alla nya uppgifter, även om de skulle klassificeras som intresserelaterade
      const filteredEmailReports = emailReportsData
        //.filter(report => !isInterestRelated(report))
        .filter(report => !report.reviewedBy); // Viktig filtrering - visa bara rapporter som inte har reviewedBy
      
      logger.debug(`Filtrerade bort ${pendingData.length - filteredPendingData.length} intresseanmälningar/granskade från ${pendingData.length} väntande uppgifter`);
      logger.debug(`Filtrerade bort ${emailReportsData.length - filteredEmailReports.length} granskade rapporter från ${emailReportsData.length} e-postrapporter`);
      console.log("Filtrerade e-postrapporter som visas:", filteredEmailReports);
      
      setPendingTasks(filteredPendingData);
      setEmailReports(filteredEmailReports);
      
      if (showApproved) {
        await fetchApprovedTasks();
      }
      
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      logger.error('Error fetching pending tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedTasks = async () => {
    try {
      // Använd getApproved-metoden som hämtar godkända uppgifter från backend
      const approvedData = await pendingTaskService.getApproved();
      
      // Logga data för felsökning
      logger.debug("Mottagna godkända uppgifter:", approvedData);
      
      // Skriver mer detaljerad debug-info
      if (approvedData && Array.isArray(approvedData)) {
        logger.trace(`Fick ${approvedData.length} godkända uppgifter:`);
        approvedData.forEach((task, index) => {
          logger.trace(`Uppgift ${index+1}:`, {
            id: task.id,
            reviewedBy: task.reviewedBy ? (typeof task.reviewedBy === 'object' ? task.reviewedBy.firstName : task.reviewedBy) : 'ingen',
            task: task.task ? task.task.title : 'ingen uppgift'
          });
        });
      }
      
      // Berika godkända uppgifter med användarnamn om de saknas
      const enrichedApprovedTasks = await Promise.all(
        approvedData.map(async (task) => {
          // Om reviewedBy bara är ett ID, försök hämta användarobjektet
          if (task.reviewedBy && typeof task.reviewedBy === 'string') {
            try {
              const user = users.find(u => u.id === task.reviewedBy);
              if (user) {
                task.reviewedBy = {
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName
                };
              }
            } catch (err) {
              logger.error(`Kunde inte hämta användarinformation för ${task.reviewedBy}:`, err);
            }
          }
          return task;
        })
      );
      
      // Sätt godkända uppgifter
      setApprovedTasks(enrichedApprovedTasks);
      return true;
    } catch (err) {
      logger.error('Error fetching approved tasks:', err);
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
    // Logga hela objektet för diagnostik
    logger.debug("Klickad uppgift:", item);
    
    setSelectedTask(item);
    
    // Om det är en e-postrapport
    if (item && !item.task && item.name) {
      setFormData({
        title: item.address ? `${item.address}${item.apartment ? ` Lgh ${item.apartment}` : ''}` : `Felanmälan från ${item.name}`,
        description: item.description || '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'MEDIUM',
        status: 'NEW',
        assignedToUserId: '',
        assignedByUserId: currentUser.id,
        apartmentId: item.apartmentId || '',
        tenantId: item.tenantId || '',
        comments: '',
        isRecurring: false,
        recurringPattern: '',
      });
    } 
    // Om det är en vanlig väntande uppgift
    else if (item && item.task) {
      // Extraktion av task för att hantera fall där task är tomt eller saknar egenskaper
      const task = item.task || {};
      
      // Utskrift för debugging
      logger.debug("Task-objekt som används för formulär:", task);
      
      setFormData({
        title: task.title || item.description || '',
        description: task.description || item.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        priority: task.priority || 'MEDIUM',
        status: task.status || item.status || 'PENDING',
        assignedToUserId: task.assignedToUserId || task.assignedUser || '',
        assignedByUserId: task.assignedByUserId || currentUser.id,
        apartmentId: task.apartmentId || item.apartmentId || '',
        tenantId: task.tenantId || item.tenantId || '',
        comments: task.comments || '',
        isRecurring: task.isRecurring || false,
        recurringPattern: task.recurringPattern || '',
      });
      
      // Logga det populerade formuläret för felsökning
      logger.debug("Populerat formulär:", formData);
    }
    
    setOpenModal(true);
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
      // Kontrollera om det är en e-postrapport eller en vanlig uppgift
      const isEmailReport = selectedTask && !selectedTask.task && selectedTask.name;
      
      // Skapa en kopia av formulärdatan och logga för felsökning
      let taskData = { ...formData };
      logger.debug('Formulärdata före godkännande:', taskData);
      
      // Säkerställ att tenantId och apartmentId är strängar, inte objekt
      if (taskData.tenantId && typeof taskData.tenantId === 'object') {
        taskData.tenantId = taskData.tenantId.id;
      }
      
      if (taskData.apartmentId && typeof taskData.apartmentId === 'object') {
        taskData.apartmentId = taskData.apartmentId.id;
      }
      
      // Fixa tidszonsproblemet för dueDate
      if (taskData.dueDate) {
        // Skapa ett Date-objekt från datumet och ange tiden till 12:00 för att undvika tidzonsförskjutningar
        const dueDateParts = taskData.dueDate.split('-');
        if (dueDateParts.length === 3) {
          const year = parseInt(dueDateParts[0]);
          const month = parseInt(dueDateParts[1]) - 1; // JS månad är 0-baserad
          const day = parseInt(dueDateParts[2]);
          
          // Skapa ett datum med lokal tid (12:00) för att undvika dagförskjutningar
          const localDate = new Date(year, month, day, 12, 0, 0);
          
          // Omvandla datumet till ISO-format medan vi behåller rätt dag
          const isoDate = localDate.toISOString().split('T')[0] + 'T12:00:00.000Z';
          taskData.dueDate = isoDate;
          
          logger.debug(`Origianl dueDate: ${taskData.dueDate}`);
          logger.debug(`Korrigerat dueDate: ${isoDate}, dag: ${localDate.getDate()}`);
        }
      }

      if (isEmailReport) {
        // Ta bort eventuellt prefix från ID:t
        const cleanId = selectedTask.id.replace('email-', '');
        logger.debug('Konverterar e-postrapport med ID:', cleanId);
        
        // För felsökning
        logger.debug('Fullständigt e-postrapport-objekt:', selectedTask);
        
        try {
          // För e-postrapporter, konvertera till en uppgift med pendingEmailReportService
          const newTask = await pendingEmailReportService.convertToTask(cleanId, taskData);
          logger.debug('Konverterad e-postrapport till uppgift:', newTask);
        } catch (error) {
          logger.error('Fel vid konvertering av e-postrapport:', error);
          
          // Om vi får ett 404-fel, kan det vara för att ID:t fortfarande har fel format
          if (error.response && error.response.status === 404) {
            // Försök med ett annat ID-format: ta bort "task-" prefixet om det finns
            const alternativeId = cleanId.replace('task-', '');
            logger.debug('Försöker med alternativt ID-format:', alternativeId);
            
            const newTask = await pendingEmailReportService.convertToTask(alternativeId, taskData);
            logger.debug('Konverterad e-postrapport till uppgift med alternativt ID:', newTask);
          } else {
            // Återkasta felet om det inte var ett 404-fel
            throw error;
          }
        }
      } else if (selectedTask && selectedTask.task) {
        // För vanliga uppgifter, uppdatera först uppgiften
        await taskService.updateTask(selectedTask.task.id, taskData);
        
        // Godkänn uppgiften
        const reviewData = {
          reviewedById: currentUser.id,
          comment: reviewComments
        };
        await pendingTaskService.approvePendingTask(selectedTask.id, reviewData);
      } else {
        throw new Error('Ogiltig uppgiftstyp');
      }
      
      // Uppdatera antalet olästa uppgifter
      await pendingTaskService.getUnreviewedCount(true);
      
      await fetchData();
      setOpenModal(false);
      setSelectedTask(null);
      setReviewComments('');
      resetForm();
    } catch (err) {
      logger.error('Error approving task:', err);
      setError(t('pendingTasks.messages.approveError'));
    }
  };

  const handleReject = async () => {
    try {
      const isEmailReport = !selectedTask.task && selectedTask.name;
      
      // Skapa en kopia av formulärdatan och logga för felsökning
      let taskData = { ...formData };
      logger.debug('Formulärdata före avvisning:', taskData);
      
      // Säkerställ att tenantId och apartmentId är strängar, inte objekt
      if (taskData.tenantId && typeof taskData.tenantId === 'object') {
        taskData.tenantId = taskData.tenantId.id;
      }
      
      if (taskData.apartmentId && typeof taskData.apartmentId === 'object') {
        taskData.apartmentId = taskData.apartmentId.id;
      }
      
      if (taskData.dueDate) {
        // Skapa ett Date-objekt från datumet och ange tiden till 12:00 för att undvika tidzonsförskjutningar
        const dueDateParts = taskData.dueDate.split('-');
        if (dueDateParts.length === 3) {
          const year = parseInt(dueDateParts[0]);
          const month = parseInt(dueDateParts[1]) - 1; // JS månad är 0-baserad
          const day = parseInt(dueDateParts[2]);
          
          // Skapa ett datum med lokal tid (12:00) för att undvika dagförskjutningar
          const localDate = new Date(year, month, day, 12, 0, 0);
          
          // Omvandla datumet till ISO-format medan vi behåller rätt dag
          const isoDate = localDate.toISOString().split('T')[0] + 'T12:00:00.000Z';
          taskData.dueDate = isoDate;
          
          logger.debug(`Korrigerat dueDate för avvisning: ${isoDate}, dag: ${localDate.getDate()}`);
        }
      }
      
      if (isEmailReport) {
        // Avvisa e-postrapporten
        await pendingEmailReportService.rejectEmailReport(
          selectedTask.id,
          currentUser.id,
          reviewComments
        );
      } else {
        logger.debug('Skickar avvisad uppgiftsdata till servern:', taskData);
        
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
      setOpenModal(false);
      setSelectedTask(null);
      setReviewComments('');
      resetForm();
    } catch (err) {
      setError(t('pendingTasks.messages.rejectError'));
      logger.error('Error rejecting task:', err);
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
    const uniqueDataMap = new Map();
    
    // Förbättrad loggning för felsökning
    console.log("Visar uppgifter:", {
      showApproved,
      pendingTasksCount: pendingTasks.length,
      emailReportsCount: emailReports.length,
      approvedTasksCount: approvedTasks.length
    });
    
    // Välj vilka kolumner och data att visa baserat på om vi visar godkända uppgifter eller ej
    if (showApproved) {
      // När vi visar godkända uppgifter, visa bara de godkända
      if (approvedTasks && approvedTasks.length > 0) {
        logger.debug(`Lägger till ${approvedTasks.length} godkända uppgifter till vyn`);
        approvedTasks.forEach(task => {
          if (task && task.id) {
            // Logga för debugging
            logger.trace("Lägger till godkänd uppgift:", task);
            
            // Se till att task-objektet är meningsfullt och att reviewedBy-fältet finns
            const enhancedTask = {
              ...task,
              id: `approved-${task.id}`,
              type: 'approved',
              approved: true,
              // Om task saknas, skapa ett grundläggande task-objekt från tillgänglig data
              task: task.task || {
                title: task.description || `Uppgift ${task.id}`,
                status: task.status || 'CONVERTED',
                priority: 'MEDIUM'
              },
              // Säkerställ att reviewedBy finns och är korrekt formaterat
              reviewedBy: task.reviewedBy || { firstName: 'Okänd', lastName: '' },
              // Se till att requestedAt är satt för att visa när uppgiften efterfrågades
              requestedAt: task.requestedAt || task.reviewedAt || new Date().toISOString()
            };

            uniqueDataMap.set(task.id, enhancedTask);
          }
        });
      }
    } else {
      // När vi visar obehandlade uppgifter
      
      // Lägg till e-postrapporter först
      if (emailReports && emailReports.length > 0) {
        logger.debug(`Lägger till ${emailReports.length} e-postrapporter till vyn`);
        emailReports.forEach(report => {
          if (report && report.id) {
            logger.trace("Lägger till e-postrapport:", report);
            
            // Berika rapporten med mer information
            const enhancedReport = {
              ...report,
              id: `email-${report.id}`,
              type: 'email',
              approved: false,
              // För konsistens med uppgifter
              taskTitle: report.subject || 'Ingen rubrik'
            };
            
            uniqueDataMap.set(report.id, enhancedReport);
          }
        });
      }
      
      // Lägg sedan till vanliga väntande uppgifter
      if (pendingTasks && pendingTasks.length > 0) {
        logger.debug(`Lägger till ${pendingTasks.length} vanliga väntande uppgifter till vyn`);
        pendingTasks.forEach(pendingTask => {
          if (pendingTask && pendingTask.id) {
            logger.trace("Lägger till väntande uppgift:", pendingTask);
            
            // Berika uppgiften med mer information
            const enhancedTask = {
              ...pendingTask,
              id: `pending-${pendingTask.id}`,
              type: 'pending',
              approved: false
            };
            
            uniqueDataMap.set(pendingTask.id, enhancedTask);
          }
        });
      }
    }
    
    // Konvertera Map till array för rendering
    const finalData = Array.from(uniqueDataMap.values());
    
    // Logga för felsökning
    logger.debug(`Visar ${finalData.length} unika objekt, varav ${finalData.filter(item => item.approved).length} godkända`);
    console.log("Slutliga data att visa:", finalData);
    
    return finalData;
  };

  const getColumns = () => {
    // Om showApproved är true, använd alltid pendingTaskColumns
    if (showApproved) {
      return pendingTaskColumns;
    }
    
    // För e-postrapporter, använd emailReportColumns
    if (emailReports && emailReports.length > 0 && (!pendingTasks || pendingTasks.length === 0)) {
      return emailReportColumns;
    }
    
    // För blandade vyer med både uppgifter och e-postrapporter, använd anpassade kolumner
    // eller pendingTaskColumns som standard
    return emailReportColumns;
  };

  const getRowClassName = (row) => {
    const classes = ["cursor-pointer"];
    if (row.approved) {
      classes.push("opacity-50");
    }
    return classes.join(" ");
  };

  // Hantera export till SQL
  const handleExportToSql = async () => {
    try {
      setIsExporting(true);
      await pendingTaskService.exportToSql();
    } catch (error) {
      console.error('Fel vid export till SQL:', error);
      setError(`${t('pendingTasks.messages.exportError')}: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Lägg till en funktion för att kontrollera e-post
  const checkEmails = async () => {
    try {
      setLoading(true);
      await pendingTaskService.checkEmails();
      // Ladda om data efter att e-post kontrollerats
      await fetchData();
    } catch (error) {
      console.error("Fel vid kontroll av e-post:", error);
      setError("Kunde inte kontrollera e-post: " + (error.message || "Okänt fel"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Avgör om den valda uppgiften är en e-postrapport
  const isEmailReport = selectedTask && !selectedTask.task && selectedTask.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Title level="h1">
          {t('pendingTasks.title')}
        </Title>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExporting(true)}
            disabled={isExporting}
            className={`flex items-center px-4 py-2 ${isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-secondary'} text-white rounded-md`}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            {isExporting ? t('common.exporting') : t('common.export')}
          </button>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                await pendingTaskService.checkEmails();
                fetchData();
              } catch (err) {
                logger.error('Fel vid läsning av felanmälnings-e-post:', err);
                setError(t('pendingTasks.messages.emailCheckError'));
              } finally {
                setLoading(false);
              }
            }}
            title={t('pendingTasks.actions.checkEmails')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center"
          >
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            {t('pendingTasks.actions.checkEmails')}
          </button>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
        <div className="flex items-center mr-2">
          <input
            type="checkbox"
            id="showApproved"
            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out mr-2"
            checked={showApproved}
            onChange={handleShowApprovedChange}
          />
          <label htmlFor="showApproved" className="text-gray-700 dark:text-gray-300">
            {t('pendingTasks.showApproved')}
          </label>
        </div>
      </div>
      
      {/* Felmeddelande */}
      {error && (
        <div className="bg-red-600 text-white p-3 mb-4 rounded-md">
          {error}
        </div>
      )}

      {getDisplayData().length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            {!showApproved ? t('pendingTasks.noTasks') : t('pendingTasks.noApprovedTasks')}
          </p>
        </div>
      ) : (
        <DataTable
          columns={getColumns()}
          data={getDisplayData()}
          onRowClick={handleRowClick}
          getRowClassName={getRowClassName}
        />
      )}

      {selectedTask && (
        <Modal
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedTask(null);
            resetForm();
          }}
          title={isEmailReport ? t('pendingTasks.emailReport') : t('pendingTasks.reviewRequest')}
          showFooter={false}
        >
          <div className="grid grid-cols-1 gap-4">
            {/* Visa endast beskrivningen från e-postrapporten */}
            {isEmailReport && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('pendingTasks.fields.description')}</h3>
                <div className="mt-1 border rounded p-3 bg-gray-50 dark:bg-gray-700 whitespace-pre-wrap">
                  {selectedTask.description || t('pendingTasks.noDescription')}
                </div>
              </div>
            )}
            
            {/* Visa titelraden för alla uppgifter (även e-postrapporter) */}
            <FormInput
              label={t('tasks.fields.title')}
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              required
              error={formData.title.trim() === '' && 'Titel är obligatorisk'}
            />
            
            {/* För vanliga uppgifter (inte e-postrapporter) visa beskrivningsfältet */}
            {!isEmailReport && (
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
            )}
            
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

          {/* Visa befintliga meddelanden om en uppgift är vald och det INTE är en e-postrapport */}
          {selectedTask && selectedTask.task && selectedTask.task.id && (
            <div className="mt-4">
              <TaskMessages 
                taskId={selectedTask.task.id} 
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
              onClick={() => setOpenModal(false)}
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