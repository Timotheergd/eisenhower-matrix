import React, { useState } from 'react';
import { Clock, Trash2 } from 'lucide-react';

const TimeEditModal = ({ task, onClose, onSave, onUnschedule }) => {
  const [startTime, setStartTime] = useState(task.startTime || '09:00');
  const [endTime, setEndTime] = useState(task.endTime || '10:00');

  const handleSave = (e) => {
    e.preventDefault();
    if (endTime > startTime) {
      onSave(task.id, startTime, endTime);
      onClose();
    } else {
      alert("End time must be after start time.");
    }
  };

  const handleUnschedule = () => {
    onUnschedule(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
        <form onSubmit={handleSave} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-800">Edit Time for "{task.title}"</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="startTime" className="text-sm font-semibold text-gray-700">Start</label>
              <input 
                id="startTime"
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                step="900" // 15 minute intervals
              />
            </div>
            <div className="flex items-center gap-4">
              <label htmlFor="endTime" className="text-sm font-semibold text-gray-700">End  </label>
              <input 
                id="endTime"
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                step="900" // 15 minute intervals
              />
            </div>
          </div>
          <div className="flex gap-2 pt-6">
            <button type="button" onClick={handleUnschedule} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Unschedule (move to Task Pool)">
              <Trash2 />
            </button>
            <div className="flex-grow"></div>
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeEditModal;