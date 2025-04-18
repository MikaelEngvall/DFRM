import React, { useState, useEffect, useRef } from 'react';
import { taskMessageService, userService } from '../services';
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
  const { user, users = [] } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [cachedUsers, setCachedUsers] = useState({});
  
  // Hämta meddelanden när komponenten laddas eller taskId ändras
  useEffect(() => {
    if (taskId) {
      fetchMessages();
    }
  }, [taskId]);

  // Hämta användare om de inte finns tillgängliga i auth-kontexten
  useEffect(() => {
    if (users.length === 0) {
      const fetchUsers = async () => {
        try {
          const fetchedUsers = await userService.getAllUsers();
          const userMap = {};
          fetchedUsers.forEach(user => {
            userMap[user.id] = user;
          });
          setCachedUsers(userMap);
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };
      fetchUsers();
    } else {
      // Skapa en map av användare från auth-kontexten
      const userMap = {};
      users.forEach(user => {
        userMap[user.id] = user;
      });
      setCachedUsers(userMap);
    }
  }, [users]);
  
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
  
  // Kontrollera om meddelandet visas på originalspråket
  const isOriginalLanguage = (message) => {
    return message.language === currentLocale;
  };
  
  // Hämta språknamn baserat på språkkod
  const getLanguageName = (languageCode) => {
    switch (languageCode) {
      case 'sv': return t('languages.swedish');
      case 'en': return t('languages.english');
      case 'pl': return t('languages.polish');
      case 'uk': return t('languages.ukrainian');
      default: return languageCode;
    }
  };
  
  // Hämta översättningsfrån-text med fallback till vanlig text
  const getTranslatedFromText = (languageCode) => {
    try {
      // Använd språkspecifika översättningsnycklar
      return t(`tasks.messages.translatedFrom.${languageCode}`, { 
        defaultValue: `${t('tasks.messages.translatedFrom', { defaultValue: 'Översatt från' })} ${getLanguageName(languageCode)}`
      });
    } catch (error) {
      // Om det blir fel, använd en generisk text
      return t('tasks.messages.translatedGeneric', { defaultValue: 'Översatt' });
    }
  };
  
  // Kontrollera om användaren är avsändaren av ett meddelande
  const isCurrentUserSender = (message) => {
    return message.sender === user.id;
  };
  
  // Hämta avsändarens namn
  const getSenderName = (message) => {
    // Om message.sender är ett objekt med firstName, använd det
    if (typeof message.sender === 'object' && message.sender?.firstName) {
      return message.sender.firstName;
    }
    
    // Om message.sender är ett ID, försök hitta användaren i cachedUsers
    if (typeof message.sender === 'string') {
      const senderId = message.sender;
      
      // Kontrollera först om användaren finns i cachedUsers
      if (cachedUsers[senderId]) {
        return `${cachedUsers[senderId].firstName} ${cachedUsers[senderId].lastName || ''}`;
      }
      
      // Om användaren inte finns i cachedUsers, kolla users-arrayen från auth-kontexten
      const foundUser = users.find(u => u.id === senderId);
      if (foundUser) {
        return `${foundUser.firstName} ${foundUser.lastName || ''}`;
      }
    }
    
    // Om vi inte kunde hitta användarinformation, visa "Okänd användare"
    return t('tasks.messages.unknownUser');
  };
  
  // Formatera tidpunkt
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <div className="p-2 flex-grow overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-2 text-sm">
            {t('tasks.messages.noMessages')}
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUserSender(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg px-3 py-2 ${
                    isCurrentUserSender(message) 
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-100' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">
                      {getSenderName(message)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {getMessageContent(message)}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    {!isOriginalLanguage(message) && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {getTranslatedFromText(message.language)}
                      </span>
                    )}
                    
                    {isCurrentUserSender(message) && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-auto"
                        title={t('tasks.messages.delete')}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {canSendMessages && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-2 mt-auto">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
              placeholder={t('tasks.messages.inputPlaceholder')}
            />
            <button
              type="submit"
              className="px-3 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={!newMessage.trim()}
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskMessages; 