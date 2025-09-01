import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import MatrixPage from './components/MatrixPage';
import TodayPage from './components/TodayPage';
import TaskModal from './components/TaskModal';
import Navigation from './components/Navigation';

const App = () => {
  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useLocalStorage('eisenhowerTasks', []);
  const [completedTasks, setCompletedTasks] = useLocalStorage('completedTasks', []);
  const [retentionDays, setRetentionDays] = useLocalStorage('retentionDays', 30);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentPage, setCurrentPage] = useState('matrix');

  // --- HANDLER FUNCTIONS ---
  const openModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (formData, addToToday) => {
    if (editingTask) {
      const isToday = addToToday !== undefined ? addToToday : editingTask.isToday;
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData, isToday } : t));
    } else {
      const newTask = { 
        ...formData, 
        id: Date.now(), 
        isToday: addToToday, 
        startTime: null, 
        endTime: null 
      };
      setTasks([...tasks, newTask]);
    }
    closeModal();
  };

  const handleToggleToday = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, isToday: !task.isToday, startTime: null, endTime: null } : task
    ));
  };

  const handleScheduleTask = (taskId, startTime, endTime) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, startTime, endTime } : task
    ));
  };

  const handleUnscheduleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, startTime: null, endTime: null } : task
    ));
  };

  const handleExport = () => {
    const data = { tasks, completedTasks, retentionDays };
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify(data, null, 2));
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'eisenhower_backup.json');
    linkElement.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          setTasks(data);
          setCompletedTasks([]);
          alert('Successfully imported old backup file!');
        } else if (Array.isArray(data.tasks) && Array.isArray(data.completedTasks)) {
          setTasks(data.tasks);
          setCompletedTasks(data.completedTasks);
          setRetentionDays(data.retentionDays || 30);
          alert('Successfully imported backup file!');
        } else {
          alert('Invalid file format.');
        }
      } catch (error) { 
        alert('Error reading or parsing the file.');
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Header 
          onAddTask={() => openModal()} 
          onExport={handleExport}
          onImport={handleImport}
        />
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

        <main className="mt-6">
          {currentPage === 'matrix' && (
            <MatrixPage
              tasks={tasks}
              setTasks={setTasks}
              completedTasks={completedTasks}
              setCompletedTasks={setCompletedTasks}
              retentionDays={retentionDays}
              setRetentionDays={setRetentionDays}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              onEditTask={openModal}
              onToggleToday={handleToggleToday}
            />
          )}
          {currentPage === 'today' && (
            <TodayPage
              tasks={tasks.filter(t => t.isToday)}
              onScheduleTask={handleScheduleTask}
              onUnscheduleTask={handleUnscheduleTask}
              onAddTask={() => openModal()} // MODIFIED: Pass the handler
            />
          )}
        </main>

        {isModalOpen && (
          <TaskModal 
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmit={handleSubmit}
            editingTask={editingTask}
            currentPage={currentPage} // MODIFIED: Pass current page
          />
        )}
      </div>
    </div>
  );
};

export default App;