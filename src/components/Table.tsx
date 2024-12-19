import React, { useState, useEffect } from "react";
import "./Table.css";

export type HeaderConfig = {
  key: string;
  type: string;
  disabled?: boolean;
  required?: boolean;
  filterDisabled?: boolean;
  sorterDisabled?: boolean;
};

export type TableProps = {
  headers: HeaderConfig[];
  initialData: Array<Record<string, any>>;
  onSubmit: (data: Array<Record<string, any>>) => void;
  editable?: boolean;
  actions?: boolean; 
};

export const Table: React.FC<TableProps> = ({
  headers,
  initialData,
  onSubmit,
  editable = true,
  actions = false,
}) => {
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState<Record<string, string>>(() =>
    headers.reduce((acc, header) => ({ ...acc, [header.key]: "" }), {})
  );
  const [isFiltered,setIsFiltered]= useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [errors, setErrors] = useState<Array<Record<string, string>>>([]);

  const handleDelete = (rowIndex: number) => {
    const updatedData = data.filter((_, index) => index !== rowIndex);
    setData(updatedData);
  };

  const handleAdd = () => {
    const newRow = headers.reduce(
      (acc, header) => ({ ...acc, [header.key]: "" }),
      {}
    );
    setData([...data, newRow]);
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
      if (sortConfig.direction === "asc") {
        const sortedData = [...data].sort((a, b) => (a[key] < b[key] ? 1 : -1));
        setSortConfig({ key, direction: "desc" });
        setData(sortedData);
      } else {
        setSortConfig(null);
        setData([...initialData]); 
      }
    } else {
      const sortedData = [...data].sort((a, b) => (a[key] < b[key] ? -1 : 1));
      setSortConfig({ key, direction: "asc" });
      setData(sortedData);
    }
  };

  const filteredData = data.filter((row) =>
    headers.every((header) =>
      row[header.key]
        ?.toString()
        .toLowerCase()
        .includes(filters[header.key].toLowerCase())
    )
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

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
            {actions && <th></th>}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
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
              {actions && (
                <td className="actions-cell">
                  <button
                    type="button"
                    onClick={() => handleDelete(rowIndex)}
                    className="action-button delete modern-delete"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {actions && (
          <tfoot>
            <tr>
              <td colSpan={headers.length + 1} className="footer-cell">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="action-button add modern-add"
                >
                  Add Row
                </button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
      {editable && (
        <button
          disabled={isFiltered || Boolean(sortConfig) ? true : false}
          type="submit"
          className={`action-button submit modern-submit ${
            isFiltered || Boolean(sortConfig) ? "disabled" : ""
          }`}
        >
          Submit
        </button>
      )}
    </form>
  );
};

export default Table;
