import React, { useState, useEffect } from "react";
import "./Table.css";

export type ColumnType = "text" | "number" | "enum";
export type EnumConfig = {
  enumItems: string[];
};
export type HeaderConfig = {
  columnLabel?: string;
  key: string;
  type: ColumnType;
  disabled?: boolean;
  required?: boolean;
  filterDisabled?: boolean;
  sorterDisabled?: boolean;
  enumConfig?: EnumConfig;
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
  initialData: Array<Record<string, string | number | null>>;
  onSubmit?: (data: Array<Record<string, string | number | null>>) => void;
  editable?: boolean;
  actions: TableActions;
  text?: TextConfig;
};

export const Table: React.FC<TableProps> = ({
  keyVal,
  headers,
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
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState<Record<string, string>>(() =>
    headers.reduce((acc, header) => ({ ...acc, [header.key]: "" }), {})
  );
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
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
    setData([...data, { ...newRow, [keyVal]: data.length * 5 + 9 }]);
  };

  const handleInputChange = (
    rowIndex: number,
    key: string,
    value: string | number
  ) => {
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
    if (!onSubmit) {
      return;
    }
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
    //TODO = fix null sorting
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        const sortedData = [...data].sort((a, b) =>
          a[key] && b[key] && a[key] < b[key] ? 1 : -1
        );
        setSortConfig({ key, direction: "desc" });
        setData(sortedData);
      } else {
        setSortConfig(null);
        const difData = data.filter(
          (item) =>
            !initialData.map((inData) => inData[keyVal]).includes(item[keyVal])
        );
        setData(initialData.concat(difData));
      }
    } else {
      const sortedData = [...data].sort((a, b) =>
        a[key] && b[key] && a[key] < b[key] ? -1 : 1
      );
      setSortConfig({ key, direction: "asc" });
      setData(sortedData);
    }
  };

  const filteredData = data.filter((row) =>
    headers.every((header) => {
      const cellValue = (row[header.key] ?? "").toString().toLowerCase();
      const filterValue = (filters[header.key] ?? "").toString().toLowerCase();
      return cellValue.includes(filterValue);
    })
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  useEffect(() => {
    if (initialData) {
      setData(
        initialData.map((item, index) => ({ ...item, originalIndex: index }))
      );
    }
  }, [initialData]);

  useEffect(() => {
    if (!editable) {
      setData(initialData);
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
                  <span className="header-label">
                    {header?.columnLabel ?? header.key}
                  </span>
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
          {filteredData.map((row, rowIndex) => (
            <tr key={rowIndex} className="modern-row">
              {headers.map((header, colIndex) => (
                <td key={colIndex}>
                  {header.disabled && (
                    <input
                      id={header.key + "_view" + "_" + rowIndex}
                      name={header.key + "_" + rowIndex}
                      className={`table-input modern-input ${
                        editable ? "disabled" : ""
                      }`}
                      type="text"
                      value={row[header.key]?.toString() || ""}
                      readOnly={true}
                    />
                  )}
                  {!header.disabled &&
                    header.type == "enum" &&
                    header.enumConfig?.enumItems && (
                      <select
                        onChange={(e) =>
                          editable &&
                          handleInputChange(
                            rowIndex,
                            header.key,
                            e.target.value
                          )
                        }
                        className={`table-input modern-input select-input ${
                          errors[rowIndex]?.[header.key] && editable
                            ? "error"
                            : ""
                        } ${editable ? "editable-input" : ""}`}
                        id={header.key + "_select" + "_" + rowIndex}
                        name={header.key + "_" + rowIndex}
                        disabled={!editable}
                        value={row[header.key]?.toString() || ""}
                      >
                        {header.enumConfig?.enumItems.length && (
                          <option key="0" value=""></option>
                        )}
                        {header.enumConfig?.enumItems.map((value, index) => (
                          <option key={index + 1} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    )}
                  {!header.disabled && header.type == "text" && (
                    <input
                      id={header.key + "_input" + "_" + rowIndex}
                      name={header.key + "_" + rowIndex}
                      className={`table-input modern-input ${
                        errors[rowIndex]?.[header.key] && editable
                          ? "error"
                          : ""
                      } ${editable ? "editable-input" : ""}`}
                      type="text"
                      value={row[header.key]?.toString() || ""}
                      onChange={(e) =>
                        editable &&
                        handleInputChange(rowIndex, header.key, e.target.value)
                      }
                      readOnly={!editable}
                    />
                  )}
                  {!header.disabled && header.type == "number" && (
                    <input
                      id={header.key + "_input" + "_" + rowIndex}
                      name={header.key + "_" + rowIndex}
                      className={`table-input modern-input ${
                        errors[rowIndex]?.[header.key] && editable
                          ? "error"
                          : ""
                      } ${editable ? "editable-input" : ""}`}
                      type="number"
                      value={row[header.key] || ""}
                      onChange={(e) =>
                        editable &&
                        handleInputChange(rowIndex, header.key, e.target.value)
                      }
                      readOnly={!editable}
                    />
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
                  disabled={isFiltered || Boolean(sortConfig) ? true : false}
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
