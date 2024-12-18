import { useState } from "react";
import Table from "./components/Table";

function App() {
  const headers = ["Name", "Age", "City"];
  const [editable, setEditable] = useState<boolean>(false);
  type DataRow = Record<string, string | number>;

  const [data, setData] = useState<DataRow[]>([
    { Name: "Alice", Age: 25, City: "New York" },
    { Name: "Bob", Age: 30, City: "San Francisco" },
    { Name: "Charlie", Age: 35, City: "Chicago" },
  ]);

  const handleSubmit = (updatedData: Array<Record<string, any>>) => {
    console.log('Updated Data:', updatedData);
    setData(updatedData);
  };

  return (
    <div>
      <button className="action-button" onClick={() => setEditable(!editable)}>{editable ? 'STORNO':'EDIT'}</button>
      <Table
        initialData={data}
        headers={headers}
        onSubmit={handleSubmit}
        editable={editable}
        actions={editable}
      />
    </div>
  );
}

export default App;
