// Lägg till en ny menypost för e-postrapporter
const menuItems = [
  // ... existing items ...
  {
    path: '/pending-tasks',
    label: t('sidebar.pendingTasks'),
    icon: <ClipboardDocumentListIcon className="h-6 w-6" />,
    permission: 'tasks:review'
  },
  {
    path: '/email-reports',
    label: t('sidebar.emailReports'),
    icon: <EnvelopeIcon className="h-6 w-6" />,
    permission: 'tasks:create'
  },
  // ... existing items ...
]; 