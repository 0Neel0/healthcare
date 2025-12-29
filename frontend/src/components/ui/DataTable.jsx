import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';

/**
 * Professional Data Table Component
 * Enterprise-grade table for medical data with sorting, searching, and actions
 */
const DataTable = ({
    columns,
    data,
    onRowClick,
    actions,
    searchable = true,
    sortable = true
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleSort = (key) => {
        if (!sortable) return;

        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedData = () => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const getFilteredData = () => {
        if (!searchTerm) return getSortedData();

        return getSortedData().filter(row =>
            columns.some(col => {
                const value = row[col.key];
                return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            })
        );
    };

    const displayData = getFilteredData();

    return (
        <div className="bg-white rounded-lg border border-[#DFE1E6] shadow-sm overflow-hidden">
            {/* Search Bar */}
            {searchable && (
                <div className="p-4 border-b border-[#DFE1E6] bg-[#FAFBFC]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7A869A]" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-[#DFE1E6] rounded-md text-sm text-[#42526E] placeholder-[#7A869A] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[#F4F5F7] border-b border-[#DFE1E6]">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                    className={`
                                        px-6 py-3 text-left text-xs font-bold text-[#42526E] uppercase tracking-wider
                                        ${column.sortable !== false && sortable ? 'cursor-pointer hover:bg-[#EBECF0]' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {column.sortable !== false && sortable && sortConfig.key === column.key && (
                                            sortConfig.direction === 'asc' ?
                                                <ChevronUp size={14} className="text-[#0052CC]" /> :
                                                <ChevronDown size={14} className="text-[#0052CC]" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="px-6 py-3 text-right text-xs font-bold text-[#42526E] uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#F4F5F7]">
                        {displayData.length > 0 ? (
                            displayData.map((row, idx) => (
                                <tr
                                    key={row.id || idx}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={`
                                        hover:bg-[#F4F5F7] transition-colors
                                        ${onRowClick ? 'cursor-pointer' : ''}
                                    `}
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-[#42526E]">
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                {actions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                                    <div className="text-[#7A869A]">
                                        <p className="font-medium">No data found</p>
                                        {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            {displayData.length > 0 && (
                <div className="px-6 py-3 bg-[#FAFBFC] border-t border-[#DFE1E6] text-sm text-[#7A869A]">
                    Showing {displayData.length} {displayData.length === 1 ? 'result' : 'results'}
                </div>
            )}
        </div>
    );
};

export default DataTable;
