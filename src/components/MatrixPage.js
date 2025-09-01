import React, { useState, useMemo } from 'react';
import { useTaskPositions } from '../hooks/useTaskPositions';
import { calculateUrgency } from '../helpers';

import MatrixGraph from './MatrixGraph';
import TaskDetails from './TaskDetails';
import PriorityList from './PriorityList';
import CompletedTasksList from './CompletedTasksList';
import { Calendar, Grid } from 'lucide-react';

const MatrixPage = ({ tasks, setTasks, completedTasks, setCompletedTasks, retentionDays, setRetentionDays, selectedTask, setSelectedTask, onEditTask, onToggleToday, onDuplicateTask }) => {
  const [showToday, setShowToday] = useState(true);
  const [showOther, setShowOther] = useState(true);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (showToday && task.isToday) return true;
      if (showOther && !task.isToday) return true;
      return false;
    });
  }, [tasks, showToday, showOther]);

  const tasksWithPositions = useTaskPositions(filteredTasks);

  const displayedPriorityList = useMemo(() => {
    const MAX_RAW_SCORE = Math.pow(100, 2) + 2 * Math.pow(100, 2);
    return filteredTasks.map(task => {
        const urgency = calculateUrgency(task.deadline);
        const score = (Math.pow(urgency, 2) + 2 * Math.pow(task.importance, 2)) / MAX_RAW_SCORE * 100;
        return { ...task, urgency, score };
    }).sort((a, b) => b.score - a.score);
  }, [filteredTasks]);

  const visibleCompletedTasks = useMemo(() => {
    const retentionCutoff = new Date();
    retentionCutoff.setDate(retentionCutoff.getDate() - retentionDays);
    return completedTasks.filter(t => new Date(t.completedAt) > retentionCutoff);
  }, [completedTasks, retentionDays]);

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

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-end gap-2 mb-2">
            <button onClick={() => setShowToday(!showToday)} className={`flex items-center gap-2 px-3 py-1 text-xs rounded-full ${showToday ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}>
              <Calendar size={14} /> Today's Tasks
            </button>
            <button onClick={() => setShowOther(!showOther)} className={`flex items-center gap-2 px-3 py-1 text-xs rounded-full ${showOther ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}>
              <Grid size={14} /> Other Tasks
            </button>
          </div>
          <MatrixGraph 
            tasksWithPositions={tasksWithPositions}
            selectedTask={selectedTask}
            onTaskSelect={setSelectedTask}
          />
        </div>
        <div className="lg:col-span-1">
          <TaskDetails 
            selectedTask={tasks.find(t => t.id === selectedTask?.id)}
            onEdit={onEditTask}
            onDelete={handleDeleteTask}
            onComplete={handleCompleteTask}
            onToggleToday={onToggleToday}
            onDuplicate={onDuplicateTask} // MODIFIED: Pass handler
            setTasks={setTasks}
            tasks={tasks}
          />
        </div>
      </div>

      <PriorityList tasks={displayedPriorityList} onTaskSelect={setSelectedTask} />
      
      <CompletedTasksList 
        tasks={visibleCompletedTasks}
        retentionDays={retentionDays}
        onSetRetentionDays={setRetentionDays}
        onRestoreTask={handleRestoreTask}
      />
    </>
  );
};

export default MatrixPage;