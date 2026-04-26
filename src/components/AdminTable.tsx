import React, { useState } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Pagination } from './Pagination';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface AdminTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  filterNodes?: React.ReactNode;
}

export function AdminTable<T>({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  searchPlaceholder = "Search...",
  onSearch,
  isLoading = false,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 5,
  filterNodes,
}: AdminTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1);

  const isServerSide = currentPage !== undefined && totalPages !== undefined && onPageChange !== undefined;

  const activePage = isServerSide ? currentPage : internalPage;
  const activeTotalPages = isServerSide ? totalPages : Math.ceil(data.length / itemsPerPage);
  const handlePageChange = isServerSide ? onPageChange : setInternalPage;

  const paginatedData = isServerSide
    ? data
    : data.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-[2.5rem] card-shadow border border-[#F5F5F5] dark:border-zinc-800 overflow-hidden max-w-full"
    >
      <div className="p-8 border-b border-[#F5F5F5] dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your {title.toLowerCase()} here.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {filterNodes}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F5] dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#1A1A1A] dark:focus:ring-accent dark:text-white"
              onChange={(e) => {
                if (onSearch) onSearch(e.currentTarget.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearch) {
                  onSearch(e.currentTarget.value);
                }
              }}
            />
          </div>
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FBFBFB] dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-widest text-[#999999] dark:text-zinc-500">
              {columns.map((col, i) => (
                <th key={i} className="px-8 py-4 whitespace-nowrap">{col.header}</th>
              ))}
              <th className="px-8 py-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F5] dark:divide-zinc-800">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columns.length + 1} className="px-8 py-4">
                    <div className="h-5 bg-[#F5F5F5] dark:bg-zinc-800 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : paginatedData.map((item, i) => (
              <tr key={i} className="hover:bg-[#FBFBFB] dark:hover:bg-zinc-950/50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="px-8 py-4 text-sm text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {typeof col.accessor === 'function'
                      ? col.accessor(item)
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
                <td className="px-8 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4 text-[#666666] dark:text-zinc-400" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-[#F5F5F5] dark:border-zinc-800">
        <Pagination
          currentPage={activePage}
          totalPages={activeTotalPages}
          onPageChange={handlePageChange}
          className="mt-0"
        />
      </div>
    </motion.div>
  );
}
