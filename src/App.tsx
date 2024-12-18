import './App.css';
import Table from './components/Table';

function App() {
  const headers = ['Name', 'Age', 'City'];
  const data = [
    { Name: 'Alice', Age: 25, City: 'New York' },
    { Name: 'Bob', Age: 30, City: 'San Francisco' },
    { Name: 'Charlie', Age: 35, City: 'Chicago' },
  ];

  return (
    <>
      <div>Welcome to table</div>
      <Table headers={headers} data={data} />
    </>
  );
}

export default App;
