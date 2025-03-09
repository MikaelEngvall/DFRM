import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete,
  onRowClick,
  isLoading = false,
  actions = [],
  rowClassName
}) => {
  
  const handleRowClick = (item, event) => {
    // Om klicket var på en knapp, förhindra radklick-eventet
    if (event.target.closest('button')) return;
    
    if (onRowClick) {
      onRowClick(item);
    } else if (onEdit) {
      onEdit(item);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 text-center text-gray-500 dark:text-gray-400 rounded-md shadow">
        Inga poster hittades
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete || actions.length > 0) && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Åtgärder
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item) => (
            <tr 
              key={item.id} 
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${rowClassName ? rowClassName(item) : ''}`}
              onClick={(e) => handleRowClick(item, e)}
            >
              {columns.map((column) => (
                <td
                  key={`${item.id}-${column.key}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                >
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </td>
              ))}
              
              {(onEdit || onDelete || actions.length > 0) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {actions.map((action, index) => {
                      if (action.condition && !action.condition(item)) {
                        return null;
                      }
                      return (
                        <button 
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(item);
                          }}
                          className={`${action.className || 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'}`}
                        >
                          {action.label || ''}
                        </button>
                      );
                    })}
                    
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable; 