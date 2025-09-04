import React from 'react';
import { Settings, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import { formatDateEuropean } from '../helpers';

const CompletedTasksList = ({ tasks, retentionDays, onSetRetentionDays, onRestoreTask, onDeleteCompletedTask }) => {
  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Completed Tasks ({tasks.length})
        </h2>
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-gray-600" />
          <label htmlFor="retention" className="text-sm text-gray-600">Retention (days):</label>
          <input id="retention" type="number" value={retentionDays} onChange={(e) => onSetRetentionDays(parseInt(e.target.value) || 0)} className="w-16 p-1 border rounded-md text-sm" />
        </div>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {tasks.length > 0 ? tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-gray-500 line-through">{task.title}</p>
              <span className="text-xs text-gray-400"> (Completed: {formatDateEuropean(task.completedAt)})</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onRestoreTask(task.id)} className="p-1 text-gray-500 hover:text-indigo-600" title="Restore Task">
                <RotateCcw size={16} />
              </button>
              {/* NEW: Delete Button */}
              <button onClick={() => onDeleteCompletedTask(task.id)} className="p-1 text-gray-500 hover:text-red-600" title="Permanently Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )) : <p className="text-gray-500">No recently completed tasks.</p>}
      </div>
    </div>
  );
};

export default CompletedTasksList;