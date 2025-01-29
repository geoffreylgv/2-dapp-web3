import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from '../abi.json';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskText, setTaskText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';

  useEffect(() => {
    loadTasks();
  }, []);

  const getContract = async () => {
    if (!window.ethereum) {
      setMessage('Metamask is required.');
      return null;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      if (!contract) return;
      const taskList = await contract.getMyTask();
      setTasks(taskList);
    } catch (error) {
      setMessage(`Error loading tasks: ${error.message}`);
    }
    setLoading(false);
  };

  const addTask = async () => {
    setLoading(true);
    setMessage('');
    try {
      const contract = await getContract();
      if (!contract) return;
      const tx = await contract.addTask(taskText, taskTitle, false);
      await tx.wait();
      setMessage('Task added successfully!');
      setTaskTitle('');
      setTaskText('');
      loadTasks();
    } catch (error) {
      setMessage(`Error adding task: ${error.message}`);
    }
    setLoading(false);
  };

  const deleteTask = async (taskId) => {
    setLoading(true);
    setMessage('');
    try {
      const contract = await getContract();
      if (!contract) return;
      const tx = await contract.deleteTask(taskId);
      await tx.wait();
      setMessage('Task deleted successfully!');
      loadTasks();
    } catch (error) {
      setMessage(`Error deleting task: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Web3 To-Do App</h1>
        {message && <div className="message-box">{message}</div>}
      </header>
      <main className="app-main">
        <section className="task-form">
          <h2>Add a Task</h2>
          <input type="text" placeholder="Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
          <textarea placeholder="Task Description" value={taskText} onChange={(e) => setTaskText(e.target.value)} />
          <button onClick={addTask} disabled={loading || !taskTitle || !taskText}>
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </section>
        <section className="task-list">
          <h2>My Tasks</h2>
          {tasks.length === 0 ? (
            <p>No tasks available.</p>
          ) : (
            tasks.map((task, index) => (
              <div key={index} className="task-item">
                <h3>{task.taskTitle}</h3>
                <p>{task.taskText}</p>
                <button onClick={() => deleteTask(task.id)} disabled={loading}>Delete</button>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default App;