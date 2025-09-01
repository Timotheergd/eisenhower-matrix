import React from 'react';
// MODIFIED: Import the new helper function
import { getScoreColor, getPastelColor, getDarkerColor } from '../helpers';

const PriorityList = ({ tasks, onTaskSelect }) => {
  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg border p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Priority To-Do List ({tasks.length})
      </h2>
      <div className="space-y-2">
        {tasks.length > 0 ? tasks.map(task => {
          const scoreColor = getScoreColor(task.score);

          const scoreStyle = task.isToday 
            ? { 
                backgroundColor: getPastelColor(scoreColor),
                // MODIFIED: Use the new darker color for the number to ensure high contrast
                color: getDarkerColor(scoreColor),
                border: `2px solid ${scoreColor}`
              }
            : { 
                backgroundColor: scoreColor,
                color: 'white',
                textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)'
              };

          return (
            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border cursor-pointer hover:bg-indigo-50" onClick={() => onTaskSelect(task)}>
              <div className="flex items-center gap-3">
                <span 
                  className="font-bold text-sm w-16 text-center py-1 rounded-full transition-all"
                  style={scoreStyle}
                >
                  {task.score.toFixed(1)}
                </span>
                <p className="font-semibold text-gray-700">{task.title}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Imp: <span className="font-bold">{task.importance}</span></span>
                <span>Urg: <span className="font-bold">{task.urgency}</span></span>
                <span>Diff: <span className="font-bold">{task.difficulty}</span></span>
              </div>
            </div>
          );
        }) : <p className="text-gray-500">No active tasks. Add one to get started!</p>}
      </div>
    </div>
  );
};

export default PriorityList;