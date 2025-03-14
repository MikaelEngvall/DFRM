import React from 'react';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Apartments from '../pages/Apartments';
import Tenants from '../pages/Tenants';
import Keys from '../pages/Keys';
import Tasks from '../pages/Tasks';
import TaskDetail from '../pages/TaskDetail';
import PendingTasks from '../pages/PendingTasks';
import Staff from '../pages/Staff';
import RequestPasswordReset from '../pages/RequestPasswordReset';
import ResetPassword from '../pages/ResetPassword';
import ConfirmEmailChange from '../pages/ConfirmEmailChange';
import PrivateRoute from '../components/PrivateRoute';
import Import from '../pages/Import';

const routes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/request-password-reset',
    element: <RequestPasswordReset />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/confirm-email',
    element: <ConfirmEmailChange />,
  },
  {
    path: '/',
    element: <PrivateRoute><Dashboard /></PrivateRoute>,
  },
  {
    path: '/apartments',
    element: <PrivateRoute><Apartments /></PrivateRoute>,
  },
  {
    path: '/tenants',
    element: <PrivateRoute><Tenants /></PrivateRoute>,
  },
  {
    path: '/keys',
    element: <PrivateRoute><Keys /></PrivateRoute>,
  },
  {
    path: '/tasks',
    element: <PrivateRoute><Tasks /></PrivateRoute>,
  },
  {
    path: '/tasks/:id',
    element: <PrivateRoute><TaskDetail /></PrivateRoute>,
  },
  {
    path: '/pending-tasks',
    element: <PrivateRoute><PendingTasks /></PrivateRoute>,
  },
  {
    path: '/staff',
    element: <PrivateRoute><Staff /></PrivateRoute>,
  },
  {
    path: '/import',
    element: <PrivateRoute><Import /></PrivateRoute>,
  },
];

export default routes; 