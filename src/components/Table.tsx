import React, { useState, useEffect } from 'react';
import './Table.css';

type TableProps = {
  headers: string[];
  initialData: Array<Record<string, any>>;
  onSubmit: (data: Array<Record<string, any>>) => void;
  editable?: boolean;
  actions?: boolean;
};

const Table: React.FC<TableProps> = ({ headers, initialData, onSubmit, editable = false, actions = false}) => {
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState<Record<string, string>>(() =>
    headers.reduce((acc, header) => ({ ...acc, [header]: '' }), {})
  );
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleDelete = (rowIndex: number) => {
    const updatedData = data.filter((_, index) => index !== rowIndex);
    setData(updatedData);
  };

  const handleAdd = () => {
    const newRow = headers.reduce((acc, key) => ({ ...acc, [key]: '' }), {});
    setData([...data, newRow]);
  };

  const handleInputChange = (rowIndex: number, key: string, value: any) => {
    const updatedData = [...data];
    updatedData[rowIndex][key] = value;
    setData(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const handleSort = (key: string) => {
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        const sortedData = [...data].sort((a, b) => {
          if (a[key] < b[key]) return 1;
          if (a[key] > b[key]) return -1;
          return 0;
        });
        setSortConfig({ key, direction: 'desc' });
        setData(sortedData);
      } else {
        setSortConfig(null);
        setData([...initialData]); // Reset to initial data
      }
    } else {
      const sortedData = [...data].sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      });
      setSortConfig({ key, direction: 'asc' });
      setData(sortedData);
    }
  };

  const filteredData = data.filter(row =>
    headers.every(header =>
      row[header]?.toString().toLowerCase().includes(filters[header].toLowerCase())
    )
  );

  const handleFilterChange = (header: string, value: string) => {
    setFilters({ ...filters, [header]: value });
  };

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <form className="table-container" onSubmit={handleSubmit}>
      <table className="styled-table modern">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>
                <div className="header-container">
                  <span className="header-label">{header}</span>
                  <div className="header-controls">
                    <input
                      type="text"
                      value={filters[header] || ''}
                      onChange={(e) => handleFilterChange(header, e.target.value)}
                      className="filter-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleSort(header)}
                      className="sort-button"
                    >
                      {sortConfig?.key === header
                        ? sortConfig.direction === 'asc'
                          ? '▲'
                          : '▼'
                        : '⇅'}
                    </button>
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
                  <input
                    className="table-input modern-input"
                    type="text"
                    value={row[header]?.toString() || ''}
                    onChange={(e) => editable && handleInputChange(rowIndex, header, e.target.value)}
                    readOnly={!editable}
                  />
                </td>
              ))}
              {actions && (
                <td className="actions-cell">
                  <button type="button" onClick={() => handleDelete(rowIndex)} className="action-button delete modern-delete">Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {actions && (
          <tfoot>
            <tr>
              <td colSpan={headers.length + 1} className="footer-cell">
                <button type="button" onClick={handleAdd} className="action-button add modern-add">Add Row</button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
      {actions && <button type="submit" className="action-button submit modern-submit">Submit</button>}
    </form>
  );
};

export default Table;