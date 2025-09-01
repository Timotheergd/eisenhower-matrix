import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTaskPositions } from './hooks/useTaskPositions';
import { calculateUrgency } from './helpers';

import Header from './components/Header';
import MatrixGraph from './components/MatrixGraph';
import TaskDetails from './components/TaskDetails';
import PriorityList from './components/PriorityList';
import CompletedTasksList from './components/CompletedTasksList';
import TaskModal from './components/TaskModal';

const App = () => {
  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useLocalStorage('eisenhowerTasks', []);
  const [completedTasks, setCompletedTasks] = useLocalStorage('completedTasks', []);
  const [retentionDays, setRetentionDays] = useLocalStorage('retentionDays', 30);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // --- DERIVED STATE & LOGIC ---
  const tasksWithPositions = useTaskPositions(tasks);

  // MODIFIED: Priority list now uses the new scoring formula
  const priorityList = useMemo(() => {
    const MAX_RAW_SCORE = Math.pow(100, 2) + 2 * Math.pow(100, 2); // 30000

    return tasks.map(task => {
        const urgency = calculateUrgency(task.deadline);
        const importance = task.importance;
        
        // Calculate raw score based on the formula x^2 + 2y^2
        const rawScore = Math.pow(urgency, 2) + 2 * Math.pow(importance, 2);
        
        // Map the raw score to a 0-100 scale
        const score = (rawScore / MAX_RAW_SCORE) * 100;

        return { ...task, urgency, score };
    }).sort((a, b) => b.score - a.score);
  }, [tasks]);

  const visibleCompletedTasks = useMemo(() => {
    const retentionCutoff = new Date();
    retentionCutoff.setDate(retentionCutoff.getDate() - retentionDays);
    return completedTasks.filter(t => new Date(t.completedAt) > retentionCutoff);
  }, [completedTasks, retentionDays]);

  // --- HANDLER FUNCTIONS ---
  const openModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (formData) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData } : t));
    } else {
      setTasks([...tasks, { ...formData, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  const handleCompleteTask = (taskId) => {
    const taskToComplete = tasks.find(t => t.id === taskId);
    if (!taskToComplete) return;
    const newCompletedTask = { ...taskToComplete, completedAt: new Date().toISOString() };
    setCompletedTasks([newCompletedTask, ...completedTasks]);
    setTasks(tasks.filter(t => t.id !== taskId));
    setSelectedTask(null);
  };

  const handleRestoreTask = (taskId) => {
    const taskToRestore = completedTasks.find(t => t.id === taskId);
    if (!taskToRestore) return;
    const { completedAt, ...restoredTask } = taskToRestore;
    setTasks([...tasks, restoredTask]);
    setCompletedTasks(completedTasks.filter(t => t.id !== taskId));
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
        if (Array.isArray(data.tasks) && Array.isArray(data.completedTasks)) {
            setTasks(data.tasks);
            setCompletedTasks(data.completedTasks);
            setRetentionDays(data.retentionDays || 30);
        } else alert('Invalid file format.');
      } catch (error) { alert('Error reading file.'); }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Header onAddTask={() => openModal()} onExport={handleExport} onImport={handleImport} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MatrixGraph 
              tasksWithPositions={tasksWithPositions}
              selectedTask={selectedTask}
              onTaskSelect={setSelectedTask}
            />
          </div>
          <div className="lg:col-span-1">
            <TaskDetails 
              selectedTask={selectedTask}
              onEdit={openModal}
              onDelete={handleDeleteTask}
              onComplete={handleCompleteTask}
              setTasks={setTasks}
              tasks={tasks}
            />
          </div>
        </div>

        <PriorityList tasks={priorityList} onTaskSelect={setSelectedTask} />
        <CompletedTasksList 
          tasks={visibleCompletedTasks}
          retentionDays={retentionDays}
          onSetRetentionDays={setRetentionDays}
          onRestoreTask={handleRestoreTask}
        />

        {isModalOpen && (
          <TaskModal 
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmit={handleSubmit}
            editingTask={editingTask}
          />
        )}
      </div>
    </div>
  );
};

export default App;