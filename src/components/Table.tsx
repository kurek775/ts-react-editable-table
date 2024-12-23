import React, { useState, useEffect, useMemo } from "react";
import "./Table.css";

export type HeaderConfig = {
  key: string;
  type: string;
  disabled?: boolean;
  required?: boolean;
  filterDisabled?: boolean;
  sorterDisabled?: boolean;
};

export type TextConfig = {
  delete?: string;
  addRow?: string;
  submit?: string;
};

export type TableActions = {
  create: boolean;
  edit: boolean;
  delete: boolean;
};

export type TableProps = {
  keyVal: string;
  headers: HeaderConfig[];
  initialData: Array<Record<string, any>>;
  onSubmit?: (data: Array<Record<string, any>>) => void;
  editable?: boolean;
  actions: TableActions;
  text?: TextConfig;
};

export const Table: React.FC<TableProps> = ({
  headers,
  keyVal,
  initialData,
  onSubmit,
  editable = false,
  actions = {
    delete: false,
    create: false,
    edit: true,
  },
  text = {
    delete: "DELETE",
    addRow: "ADD ROW",
    submit: "SUBMIT",
  },
}) => {
  const [data, setData] = useState(() => ensureKeysExist(initialData));
  const [filters, setFilters] = useState<Record<string, string>>(() =>
    headers.reduce((acc, header) => ({ ...acc, [header.key]: "" }), {})
  );
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [errors, setErrors] = useState<Array<Record<string, string>>>([]);

  // Ensure rows contain all keys from headers
  function ensureKeysExist(rows: Array<Record<string, any>>) {
    return rows.map((row) =>
      headers.reduce(
        (acc, header) => ({ ...acc, [header.key]: acc[header.key] ?? "" }),
        row
      )
    );
  }

  const handleDelete = (rowIndex: number) => {
    const updatedData = data.filter((_, index) => index !== rowIndex);
    setData(updatedData);
  };

  const handleAdd = () => {
    const newRow = headers.reduce(
      (acc, header) => ({ ...acc, [header.key]: "" }),
      {}
    );
    setData([...data, { ...newRow, [keyVal]: data.length * 5 + 9 }]);
  };

  const handleInputChange = (rowIndex: number, key: string, value: any) => {
    const updatedData = [...data];
    updatedData[rowIndex][key] = value;
    setData(updatedData);

    const updatedErrors = [...errors];
    if (headers.find((header) => header.key === key)?.required && !value) {
      updatedErrors[rowIndex] = {
        ...updatedErrors[rowIndex],
        [key]: "This field is required",
      };
    } else {
      delete updatedErrors[rowIndex]?.[key];
    }
    setErrors(updatedErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    const newErrors = data.map((row) => {
      const rowErrors: Record<string, string> = {};
      headers.forEach((header) => {
        if (header.required && !row[header.key]) {
          rowErrors[header.key] = "This field is required";
        }
      });
      return rowErrors;
    });
    setErrors(newErrors);

    if (newErrors.every((row) => Object.keys(row).length === 0)) {
      onSubmit(data);
    }
  };

  const handleSort = (key: string) => {
    if (sortConfig && sortConfig.key === key) {
      const sortedData = [...data].sort((a, b) =>
        sortConfig.direction === "asc"
          ? (b[key]?.toString() ?? "").localeCompare(a[key]?.toString() ?? "")
          : (a[key]?.toString() ?? "").localeCompare(b[key]?.toString() ?? "")
      );
      setSortConfig((prev) =>
        prev?.direction === "asc" ? { key, direction: "desc" } : null
      );
      setData(sortedData);
    } else {
      const sortedData = [...data].sort((a, b) =>
        (a[key]?.toString() ?? "").localeCompare(b[key]?.toString() ?? "")
      );
      setSortConfig({ key, direction: "asc" });
      setData(sortedData);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];
    if (sortConfig) {
      result = result.sort((a, b) =>
        sortConfig.direction === "asc"
          ? (a[sortConfig.key]?.toString() ?? "").localeCompare(
              b[sortConfig.key]?.toString() ?? ""
            )
          : (b[sortConfig.key]?.toString() ?? "").localeCompare(
              a[sortConfig.key]?.toString() ?? ""
            )
      );
    }
    result = result.filter((row) =>
      headers.every((header) =>
        (row[header.key]?.toString() ?? "")
          .toLowerCase()
          .includes(filters[header.key]?.toLowerCase() ?? "")
      )
    );
    return result;
  }, [data, headers, sortConfig, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  useEffect(() => {
    setData(ensureKeysExist(initialData));
  }, [initialData, headers]);

  useEffect(() => {
    if (!editable) {
      setData(ensureKeysExist(initialData));
      setFilters(
        headers.reduce((acc, header) => ({ ...acc, [header.key]: "" }), {})
      );
    }
  }, [editable, headers]);

  useEffect(() => {
    const f = Object.values(filters).some((value) => value.trim() !== "");
    setIsFiltered(f);
  }, [filters]);

  return (
    <form className="table-container" onSubmit={handleSubmit}>
      <table className="styled-table modern">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>
                <div className="header-container">
                  <span className="header-label">{header.key}</span>
                  {!header.sorterDisabled && (
                    <button
                      type="button"
                      onClick={() => handleSort(header.key)}
                      className="sort-button"
                    >
                      {sortConfig?.key === header.key
                        ? sortConfig.direction === "asc"
                          ? "▲"
                          : "▼"
                        : "⇅"}
                    </button>
                  )}
                  <div className="header-controls">
                    {!header.filterDisabled && (
                      <input
                        type="text"
                        value={filters[header.key] || ""}
                        onChange={(e) =>
                          handleFilterChange(header.key, e.target.value)
                        }
                        className="filter-input"
                      />
                    )}
                  </div>
                </div>
              </th>
            ))}
            {actions.delete && editable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="modern-row">
              {headers.map((header, colIndex) => (
                <td key={colIndex}>
                  {header.disabled ? (
                    <input
                      className={`table-input modern-input ${
                        editable ? "disabled" : ""
                      }`}
                      type="text"
                      value={row[header.key]?.toString() || ""}
                      readOnly={true}
                    />
                  ) : (
                    <input
                      className={`table-input modern-input ${
                        errors[rowIndex]?.[header.key] ? "error" : ""
                      }`}
                      type="text"
                      value={row[header.key]?.toString() || ""}
                      onChange={(e) =>
                        editable &&
                        handleInputChange(rowIndex, header.key, e.target.value)
                      }
                      readOnly={!editable}
                    />
                  )}

                  {errors[rowIndex]?.[header.key] && (
                    <span className="error-message">
                      {errors[rowIndex][header.key]}
                    </span>
                  )}
                </td>
              ))}
              {actions.delete && editable && (
                <td className="actions-cell">
                  <button
                    type="button"
                    onClick={() => handleDelete(rowIndex)}
                    className="action-button delete modern-delete"
                  >
                    {text.delete}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {actions.create && editable && (
          <tfoot>
            <tr>
              <td colSpan={headers.length + 1} className="footer-cell">
                <button
                  disabled={isFiltered || Boolean(sortConfig)}
                  type="button"
                  onClick={handleAdd}
                  className={`action-button add modern-add ${
                    isFiltered || Boolean(sortConfig) ? "disabled" : ""
                  }`}
                >
                  {text.addRow}
                </button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
      {editable &&
        (actions.create || actions.delete || actions.edit) &&
        Boolean(onSubmit) && (
          <button
            disabled={isFiltered || Boolean(sortConfig)}
            type="submit"
            className={`action-button submit modern-submit ${
              isFiltered || Boolean(sortConfig) ? "disabled" : ""
            }`}
          >
            {text.submit}
          </button>
        )}
    </form>
  );
};

export default Table;
