"use client";
import { ReactNode } from "react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface ResourceTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
  onCreateClick?: () => void;
  createButtonLabel?: string;
  title?: string;
}

export default function ResourceTable<T extends { id: string }>({
  data,
  columns,
  loading,
  error,
  emptyMessage = "No records found.",
  onCreateClick,
  createButtonLabel = "Create New",
  title,
}: ResourceTableProps<T>) {
  return (
    <div className="mt-8">
      <div className="flex justify-end mb-4">
        {onCreateClick && <button
          onClick={onCreateClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {createButtonLabel}
        </button>}
      </div>

      {loading && <p className="text-gray-500">Loading data...</p>}

      {error && <p className="text-red-500">Error: {error}</p>}
      {/* table heading */}
      <h6 className="text-lg font-semibold mb-4">{title}</h6>

      {!loading && !error && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="p-2 text-left border border-gray-200"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="p-2 border border-gray-200"
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as any)[column.key] || "N/A")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-gray-500">{emptyMessage}</p>
      )}
    </div>
  );
}
