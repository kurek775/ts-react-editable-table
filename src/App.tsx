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
      sorterDisabled: true,
    },
    {
      columnLabel: "Věk",
      key: "Age",
      type: "number",
      required: true,
      filterDisabled: true,
      sorterDisabled: true,
    },
    {
      columnLabel: "Město",
      key: "City",
      type: "text",
      disabled: true,
      filterDisabled: true,
      sorterDisabled: true,
    },
  ];
  const [editable, setEditable] = useState<boolean>(false);
  type DataRow = Record<string, string | number>;

  const [data, setData] = useState<DataRow[]>([
    { Name: "Jon Snow", Age: 30, City: "Winterfell", House: "Stark" },
    {
      Name: "Daenerys Targaryen",
      Age: 25,
      City: "Dragonstone",
      House: "Targaryen",
    },
    {
      Name: "Tyrion Lannister",
      Age: 40,
      City: "Casterly Rock",
      House: "Lannister",
    },
    {
      Name: "Cersei Lannister",
      Age: 42,
      City: "King's Landing",
      House: "Lannister",
    },
    { Name: "Arya Stark", Age: 18, City: "Winterfell", House: "Stark" },
    { Name: "Sansa Stark", Age: 24, City: "Winterfell", House: "Stark" },
    {
      Name: "Jaime Lannister",
      Age: 42,
      City: "Casterly Rock",
      House: "Lannister",
    },
    { Name: "Bran Stark", Age: 20, City: "Winterfell", House: "Stark" },
    { Name: "Samwell Tarly", Age: 29, City: "Horn Hill", House: "Tarly" },
    { Name: "Theon Greyjoy", Age: 30, City: "Pyke", House: "Greyjoy" },
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
