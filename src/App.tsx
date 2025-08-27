import { useState } from "react";
import Table, { HeaderConfig } from "./components/Table";

function App() {
  const headers: HeaderConfig[] = [
    {
      columnLabel: "Jméno",
      key: "Name",
      type: "text",
      required: true,
      filterDisabled: true,
      sorterDisabled: false,
    },
    {
      columnLabel: "Věk",
      key: "Age",
      type: "number",
      required: true,
      filterDisabled: false,
      sorterDisabled: false,
    },
    {
      columnLabel: "Chytrý",
      key: "smart",
      type: "boolean",
      required: true,
      filterDisabled: true,
      sorterDisabled: true,
    },
    {
      enumConfig: {
        enumItems: ["Dragonstone", "King's Landing"],
      },
      columnLabel: "Město",
      key: "City",
      type: "enum",
      required: true,
      disabled: false,
      filterDisabled: true,
      sorterDisabled: true,
    },
  ];
  const [editable, setEditable] = useState<boolean>(false);
  type DataRow = Record<string, string | number | null | boolean>;

  const [data, setData] = useState<DataRow[]>([
    { id: 1, Name: "Jon Snow", Age: 10, House: "Stark", smart: true },
    { id: 444, Name: "Bran Stark", Age: null, House: "Stark", smart: false },
    { id: 555, Name: "Samwell Tarly", Age: null, House: "Tarly", smart: false },
    {
      id: 5545,
      Name: "Theon Greyjoy",
      Age: null,
      House: "Greyjoy",
      smart: true,
    },
  ]);

  const handleSubmit = (updatedData: Array<Record<string, any>>) => {
    console.log("Updated Data:", updatedData);
    setData(updatedData);
    setEditable(false);
  };

  const handleDoubleClick = (item: Record<string, any>) => {
    console.log("Double click:", item);
  };
  const handleClick = (item: Record<string, any>) => {
    console.log("Click:", item);
  };

  return (
    <div>
      <button className="control-button" onClick={() => setEditable(!editable)}>
        {editable ? "STORNO" : "EDIT"}
      </button>
      <Table
        keyVal="id"
        initialData={data}
        headers={headers}
        onSubmit={handleSubmit}
        onRowDoubleClick={handleDoubleClick}
        onRowClick={handleClick}
        editable={editable}
        actions={{
          create: true,
          edit: true,
          delete: true,
        }}
      />
    </div>
  );
}

export default App;
