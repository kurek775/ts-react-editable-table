import { useState } from "react";
import Table from "./components/Table";

function App() {
  const headers = [
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
  type DataRow = Record<string, string | number | null>;

  const [data, setData] = useState<DataRow[]>([
    { Name: "Jon Snow", Age: 10, House: "Stark" },
    {
      Name: "Daenerys Targaryen",
      Age: 124,
      House: "Targaryen",
    },
    {
      Name: "Tyrion Lannister",
      Age: null,
      City: null,
      House: "Lannister",
    },
    {
      Name: "Cersei Lannister",
      Age: null,
      City: "King's Landing",
      House: "Lannister",
    },
    { Name: "Arya Stark", Age: null, House: "Stark" },
    { Name: "Sansa Stark", Age: null, House: "Stark" },
    {
      Name: "Jaime Lannister",
      Age: null,
      House: "Lannister",
    },
    { Name: "Bran Stark", Age: null, House: "Stark" },
    { Name: "Samwell Tarly", Age: null, House: "Tarly" },
    { Name: "Theon Greyjoy", Age: null, House: "Greyjoy" },
  ]);

  const handleSubmit = (updatedData: Array<Record<string, any>>) => {
    console.log("Updated Data:", updatedData);
    setData(updatedData);
    setEditable(false);
  };

  return (
    <div>
      <button className="control-button" onClick={() => setEditable(!editable)}>
        {editable ? "STORNO" : "EDIT"}
      </button>
      <Table
        keyVal="Id"
        initialData={data}
        headers={headers}
        onSubmit={handleSubmit}
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
