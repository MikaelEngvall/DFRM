import React from 'react';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Apartments from '../pages/Apartments';
import Tenants from '../pages/Tenants';
import Keys from '../pages/Keys';
import Tasks from '../pages/Tasks';
import TaskDetail from '../pages/TaskDetail';
import PendingTasks from '../pages/PendingTasks';
import Admins from '../pages/Admins';
import PrivateRoute from '../components/PrivateRoute';

const routes = [
  {
    path: '/login',
    element: <Login />,
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
    path: '/admins',
    element: <PrivateRoute><Admins /></PrivateRoute>,
  },
];

export default routes; 