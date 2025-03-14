import React, { useState } from 'react';
import { PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

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
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      // Hitta motsvarande kolumndefinition
      const column = columns.find(col => col.key === sortConfig.key);
      
      let valueA = a[sortConfig.key];
      let valueB = b[sortConfig.key];
      
      // Om kolumnen har en getSortValue funktion, använd den för sortering
      if (column && column.getSortValue) {
        valueA = column.getSortValue(valueA, a);
        valueB = column.getSortValue(valueB, b);
      }
      
      // Hantera null/undefined värden
      if (valueA === null || valueA === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valueB === null || valueB === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Sortera datum
      if (valueA instanceof Date && valueB instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }
      
      // Sortera strängar med svenska tecken korrekt
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        // Använd svenska collation-regler
        return sortConfig.direction === 'asc' 
          ? valueA.localeCompare(valueB, 'sv', { sensitivity: 'base' })
          : valueB.localeCompare(valueA, 'sv', { sensitivity: 'base' });
      }
      
      // Sortera nummer och andra typer
      if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, columns]);
  
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {sortConfig.key === column.key && (
                    sortConfig.direction === 'asc' 
                    ? <ChevronUpIcon className="h-4 w-4" /> 
                    : <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {sortedData.map((item) => (
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