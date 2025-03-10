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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable; 