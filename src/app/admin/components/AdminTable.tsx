"use client";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: unknown, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  isLoading?: boolean;
  rowKey: keyof T;
}

export default function AdminTable<T extends Record<string, unknown>>({
  columns,
  data,
  onSort,
  sortKey,
  sortDirection = "asc",
  isLoading = false,
  rowKey,
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 py-8 text-center">
        <p className="text-gray-500">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${
                  column.width ? column.width : ""
                }`}
              >
                {column.sortable && onSort ? (
                  <button
                    onClick={() =>
                      onSort(
                        String(column.key),
                        sortKey === String(column.key) && sortDirection === "asc"
                          ? "desc"
                          : "asc"
                      )
                    }
                    className="flex items-center gap-2 hover:text-black"
                  >
                    {column.label}
                    {sortKey === String(column.key) && (
                      <span className="text-xs">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={String(item[rowKey])}
              className={`border-b border-gray-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-gray-100`}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="px-6 py-4 text-sm">
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
