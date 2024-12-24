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
  console.log("[Table Component] Rendered with Props:", {
    headers,
    keyVal,
    initialData,
    editable,
    actions,
    text,
  });

  const [data, setData] = useState(() => {
    console.log("[Table Component] Initializing data:", initialData);
    return ensureKeysExist(initialData);
  });
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
    console.log("[ensureKeysExist] Processing rows:", rows);
    const result = rows.map((row) =>
      headers.reduce(
        (acc, header) => ({ ...acc, [header.key]: acc[header.key] ?? "" }),
        row
      )
    );
    console.log("[ensureKeysExist] Processed rows:", result);
    return result;
  }

  const handleDelete = (rowIndex: number) => {
    console.log("[handleDelete] Row index to delete:", rowIndex);
    const updatedData = data.filter((_, index) => index !== rowIndex);
    console.log("[handleDelete] Updated data:", updatedData);
    setData(updatedData);
  };

  const handleAdd = () => {
    console.log("[handleAdd] Adding new row");
    const newRow = headers.reduce(
      (acc, header) => ({ ...acc, [header.key]: "" }),
      {}
    );
    const updatedData = [...data, { ...newRow, [keyVal]: data.length * 5 + 9 }];
    console.log("[handleAdd] Updated data:", updatedData);
    setData(updatedData);
  };

  const handleInputChange = (rowIndex: number, key: string, value: any) => {
    console.log("[handleInputChange] Input changed:", { rowIndex, key, value });
    const updatedData = [...data];
    updatedData[rowIndex][key] = value;
    console.log("[handleInputChange] Updated data:", updatedData);
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
    console.log("[handleInputChange] Updated errors:", updatedErrors);
    setErrors(updatedErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[handleSubmit] Submitting form");
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
    console.log("[handleSubmit] Validation errors:", newErrors);
    setErrors(newErrors);

    if (newErrors.every((row) => Object.keys(row).length === 0)) {
      console.log("[handleSubmit] Data submitted:", data);
      onSubmit(data);
    }
  };

  const handleSort = (key: string) => {
    console.log("[handleSort] Sorting by key:", key);
    let sortedData;
    if (sortConfig && sortConfig.key === key) {
      sortedData = [...data].sort((a, b) =>
        sortConfig.direction === "asc"
          ? (b[key]?.toString() ?? "").localeCompare(a[key]?.toString() ?? "")
          : (a[key]?.toString() ?? "").localeCompare(b[key]?.toString() ?? "")
      );
      setSortConfig((prev) =>
        prev?.direction === "asc" ? { key, direction: "desc" } : null
      );
    } else {
      sortedData = [...data].sort((a, b) =>
        (a[key]?.toString() ?? "").localeCompare(b[key]?.toString() ?? "")
      );
      setSortConfig({ key, direction: "asc" });
    }
    console.log("[handleSort] Sorted data:", sortedData);
    setData(sortedData);
  };

  const filteredAndSortedData = useMemo(() => {
    console.log("[filteredAndSortedData] Calculating filtered and sorted data");
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
    console.log("[filteredAndSortedData] Result:", result);
    return result;
  }, [data, headers, sortConfig, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value ?? "", // Default to empty string
    }));
  };

  useEffect(() => {
    console.log("[useEffect] Initial data changed:", initialData);
    setData(ensureKeysExist(initialData));
  }, [initialData, headers]);

  useEffect(() => {
    if (!editable) {
      console.log("[useEffect] Editable mode disabled. Resetting data.");
      setData(ensureKeysExist(initialData));
      setFilters(
        headers.reduce((acc, header) => ({ ...acc, [header.key]: "" }), {})
      );
    }
  }, [editable, headers]);

  useEffect(() => {
    let hasActiveFilter = false;
    console.log("[useEffect] Filter state to be updated:", filters);
    for (const key in filters) {
      if (typeof filters[key] === "string" && filters[key].trim() !== "") {
        hasActiveFilter = true;
        break;
      }
    }
    console.log("[useEffect] Filter state updated:", hasActiveFilter);
    setIsFiltered(hasActiveFilter);
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
