import React, { useState, useEffect } from 'react';

const TaskModal = ({ isOpen, onClose, onSubmit, editingTask }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', importance: 50, difficulty: 50, deadline: ''
  });

  useEffect(() => {
    if (editingTask) {
      setFormData(editingTask);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        title: '', description: '', importance: 50, difficulty: 50, deadline: tomorrow.toISOString().split('T')[0]
      });
    }
  }, [editingTask]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'range' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.deadline) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Importance ({formData.importance})</label>
              <input type="range" name="importance" min="0" max="100" value={formData.importance} onChange={handleChange} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty ({formData.difficulty})</label>
              <input type="range" name="difficulty" min="0" max="100" value={formData.difficulty} onChange={handleChange} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline *</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{editingTask ? 'Update' : 'Add'} Task</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;