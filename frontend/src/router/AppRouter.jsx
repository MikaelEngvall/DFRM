import PendingTasks from '../pages/PendingTasks';
import EmailReports from '../pages/EmailReports';
import NotFound from '../pages/NotFound';
import Import from '../pages/Import';

// Routes inside the Dashboard (authenticated)
const authenticatedRoutes = [
  { path: '/pending-tasks', element: <PendingTasks /> },
  { path: '/email-reports', element: <EmailReports /> },
  { path: '/import', element: <Import /> },
]; 