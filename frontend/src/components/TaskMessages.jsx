import React, { useState, useEffect, useRef } from 'react';
import { taskMessageService } from '../services';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';
import { PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/outline';

/**
 * Komponent för att visa och skicka meddelanden i en uppgift
 * 
 * @param {Object} props - Komponentens props
 * @param {string} props.taskId - ID för uppgiften
 * @param {boolean} props.canSendMessages - Om användaren kan skicka meddelanden
 */
const TaskMessages = ({ taskId, canSendMessages = true }) => {
  const { t, currentLocale } = useLocale();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Hämta meddelanden när komponenten laddas eller taskId ändras
  useEffect(() => {
    if (taskId) {
      fetchMessages();
    }
  }, [taskId]);
  
  // Scrolla till botten när nya meddelanden läggs till
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Hämta meddelanden från API
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskMessageService.getMessagesByTaskId(taskId);
      console.log('Fetched messages:', data);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(t('tasks.messages.fetchError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Skicka ett nytt meddelande
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setError(null);
      console.log('Sending message:', newMessage);
      await taskMessageService.createMessage(taskId, newMessage, currentLocale);
      setNewMessage('');
      fetchMessages(); // Hämta uppdaterade meddelanden
    } catch (err) {
      console.error('Error sending message:', err);
      setError(t('tasks.messages.sendError'));
    }
  };
  
  // Ta bort ett meddelande
  const handleDeleteMessage = async (messageId) => {
    try {
      setError(null);
      console.log('Deleting message:', messageId);
      await taskMessageService.deleteMessage(taskId, messageId);
      fetchMessages(); // Hämta uppdaterade meddelanden
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(t('tasks.messages.deleteError'));
    }
  };
  
  // Scrolla till botten av meddelandelistan
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Hämta meddelandetext baserat på språk
  const getMessageContent = (message) => {
    // Om meddelandet är på samma språk som användaren, visa originalinnehållet
    if (message.language === currentLocale) {
      return message.content;
    }
    
    // Annars, försök hitta en översättning
    if (message.translations && message.translations[currentLocale]) {
      return message.translations[currentLocale];
    }
    
    // Om ingen översättning finns, visa originalinnehållet
    return message.content;
  };
  
  // Kontrollera om användaren är avsändaren av ett meddelande
  const isCurrentUserSender = (message) => {
    return message.sender === user.id;
  };
  
  // Formatera tidpunkt
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('tasks.messages.title')}
        </h3>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <div className="p-4 h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t('tasks.messages.noMessages')}
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUserSender(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    isCurrentUserSender(message) 
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">
                      {message.senderName || t('tasks.messages.unknownUser')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {getMessageContent(message)}
                  </p>
                  {isCurrentUserSender(message) && (
                    <button 
                      onClick={() => handleDeleteMessage(message.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-1 text-xs flex items-center"
                      aria-label={t('tasks.messages.delete')}
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      {t('tasks.messages.delete')}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {canSendMessages && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('tasks.messages.inputPlaceholder')}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskMessages; 