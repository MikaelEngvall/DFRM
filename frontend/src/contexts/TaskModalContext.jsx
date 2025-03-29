import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TaskModalContext = createContext(null);

export const useTaskModal = () => useContext(TaskModalContext);

export const TaskModalProvider = ({ children }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [initialTaskData, setInitialTaskData] = useState({});
  const navigate = useNavigate();

  const openTaskModal = (data = {}) => {
    // Rensa eventuella tidigare data först
    setInitialTaskData({});
    
    // Anpassa data baserat på vad som skickas in
    const sanitizedData = {};
    
    // Hantera tenant (antingen objekt eller ID)
    if (data.tenant) {
      sanitizedData.tenant = data.tenant;
      sanitizedData.tenantId = data.tenant.id;
    } else if (data.tenantId) {
      sanitizedData.tenantId = data.tenantId;
    }
    
    // Hantera apartment (antingen objekt eller ID)
    if (data.apartment) {
      sanitizedData.apartment = data.apartment;
      sanitizedData.apartmentId = data.apartment.id;
    } else if (data.apartmentId) {
      sanitizedData.apartmentId = data.apartmentId;
    }
    
    // Hantera Task ID (för redigering)
    if (data.id) {
      sanitizedData.id = data.id;
    }
    
    // Kopiera alla andra egenskaper
    Object.keys(data).forEach(key => {
      if (!sanitizedData[key] && 
          key !== 'tenant' && 
          key !== 'tenantId' && 
          key !== 'apartment' && 
          key !== 'apartmentId') {
        sanitizedData[key] = data[key];
      }
    });
    
    // Uppdatera state och öppna modal
    setInitialTaskData(sanitizedData);
    setIsTaskModalOpen(true);
    
    // Navigera till uppgiftssidan direkt
    navigate('/tasks');
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    // Rensa data med lite fördröjning för att undvika flimmer
    setTimeout(() => {
      setInitialTaskData({});
    }, 300);
  };

  return (
    <TaskModalContext.Provider
      value={{
        isTaskModalOpen,
        initialTaskData,
        openTaskModal,
        closeTaskModal
      }}
    >
      {children}
    </TaskModalContext.Provider>
  );
};

export default TaskModalContext; 