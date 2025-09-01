import React, { useState, useMemo, useRef } from 'react';
import { getDifficultyColor, getScoreColor, calculateUrgency } from '../helpers';
import { Clock, Plus } from 'lucide-react';
import TimeEditModal from './TimeEditModal';

// Helper to convert "HH:MM" to total minutes from midnight
const timeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to convert total minutes to "HH:MM"
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const TodayPage = ({ tasks, onScheduleTask, onUnscheduleTask, onAddTask }) => {
  const timelineRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const { unscheduled, layout } = useMemo(() => {
    const MAX_RAW_SCORE = Math.pow(100, 2) + 2 * Math.pow(100, 2);
    const tasksWithScores = tasks.map(task => {
      const urgency = calculateUrgency(task.deadline);
      const score = (Math.pow(urgency, 2) + 2 * Math.pow(task.importance, 2)) / MAX_RAW_SCORE * 100;
      return { ...task, urgency, score };
    }).sort((a, b) => b.score - a.score);

    const scheduled = tasksWithScores.filter(t => t.startTime && t.endTime);
    const unscheduled = tasksWithScores.filter(t => !t.startTime || !t.endTime);

    // --- NEW: Overlap Calculation Logic ---
    const layout = [];
    const columns = [];
    scheduled.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    for (const task of scheduled) {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i] < timeToMinutes(task.startTime)) {
          layout.push({ ...task, col: i, numCols: 0 }); // numCols will be set later
          columns[i] = timeToMinutes(task.endTime);
          placed = true;
          break;
        }
      }
      if (!placed) {
        layout.push({ ...task, col: columns.length, numCols: 0 });
        columns.push(timeToMinutes(task.endTime));
      }
    }

    for (const task of layout) {
      const start = timeToMinutes(task.startTime);
      const end = timeToMinutes(task.endTime);
      const overlappingTasks = layout.filter(t => timeToMinutes(t.startTime) < end && timeToMinutes(t.endTime) > start);
      task.numCols = Math.max(...overlappingTasks.map(t => t.col)) + 1;
    }

    return { unscheduled, layout };
  }, [tasks]);

  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  const handleDragStart = (e, task, type) => {
    setDragState({ type, task });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const yToTime = (y) => {
    if (!timelineRef.current) return '00:00';
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const hourHeight = timelineRect.height / hours.length;
    const totalMinutes = Math.round(((y / hourHeight) * 60) / 15) * 15;
    const finalMinutes = (hours[0] * 60) + totalMinutes;
    return minutesToTime(finalMinutes);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!dragState || !timelineRef.current) return;

    const dropY = e.clientY - timelineRef.current.getBoundingClientRect().top;
    const newTime = yToTime(dropY);

    if (dragState.type === 'resize-end') {
      if (timeToMinutes(newTime) > timeToMinutes(dragState.task.startTime)) {
        onScheduleTask(dragState.task.id, dragState.task.startTime, newTime);
      }
    } else if (dragState.type === 'resize-start') {
      if (timeToMinutes(newTime) < timeToMinutes(dragState.task.endTime)) {
        onScheduleTask(dragState.task.id, newTime, dragState.task.endTime);
      }
    } else {
      const startMinutes = timeToMinutes(newTime);
      const duration = dragState.task.startTime ? timeToMinutes(dragState.task.endTime) - timeToMinutes(dragState.task.startTime) : 60;
      const endMinutes = startMinutes + duration;
      onScheduleTask(dragState.task.id, minutesToTime(startMinutes), minutesToTime(endMinutes));
    }
    setDragState(null);
  };

  const timeToYPercent = (time) => {
    const totalMinutes = timeToMinutes(time) - (hours[0] * 60);
    return (totalMinutes / (hours.length * 60)) * 100;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Timeline</h2>
          <div ref={timelineRef} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="relative h-[720px] bg-gray-50 rounded-lg">
            {hours.map(hour => (
              <div key={hour} className="h-[40px] border-t border-gray-200 flex items-start">
                <span className="text-xs text-gray-400 -mt-2 ml-2">{hour}:00</span>
              </div>
            ))}
            {layout.map(task => {
              const top = timeToYPercent(task.startTime);
              const bottom = timeToYPercent(task.endTime);
              const height = Math.max(0, bottom - top);
              const width = 100 / task.numCols;
              const left = task.col * width;

              return (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, 'move')}
                  onClick={() => setEditingTask(task)}
                  className="absolute p-2 rounded-lg shadow-md cursor-pointer flex flex-col justify-between transition-all duration-100"
                  style={{
                    top: `${top}%`,
                    height: `${height}%`,
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: getDifficultyColor(task.difficulty),
                    color: 'white',
                    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <div 
                    draggable onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, task, 'resize-start'); }}
                    className="absolute -top-1 left-0 w-full h-2 cursor-n-resize"
                  />
                  <div>
                    <p className="font-bold text-sm">{task.title}</p>
                    <p className="text-xs">{task.startTime} - {task.endTime}</p>
                  </div>
                  <div 
                    draggable onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, task, 'resize-end'); }}
                    className="absolute -bottom-1 left-0 w-full h-2 cursor-s-resize"
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Task Pool ({unscheduled.length})</h2>
            <button onClick={onAddTask} className="flex items-center gap-2 text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200">
              <Plus size={16} /> Add Task
            </button>
          </div>
          <div className="space-y-2">
            {unscheduled.length > 0 ? unscheduled.map(task => {
              const scoreColor = getScoreColor(task.score);
              return (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, 'new')}
                  className="p-3 bg-gray-100 rounded-lg border cursor-grab flex items-center gap-3"
                >
                  <span className="font-bold text-sm w-16 text-center py-1 rounded-full" style={{ backgroundColor: scoreColor, color: 'white', textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                    {task.score.toFixed(1)}
                  </span>
                  <p className="font-semibold text-gray-800">{task.title}</p>
                </div>
              );
            }) : (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">All tasks scheduled!</h3>
                <p className="text-sm text-gray-500">Drag tasks from the timeline to unschedule them.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {editingTask && (
        <TimeEditModal 
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={onScheduleTask}
          onUnschedule={onUnscheduleTask}
        />
      )}
    </>
  );
};

export default TodayPage;