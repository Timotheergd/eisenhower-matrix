import React, { useRef } from 'react';
import { Plus, Download, Upload } from 'lucide-react';

// MODIFIED: Added onExport and onImport back to the props
const Header = ({ onAddTask, onExport, onImport }) => {
  const fileInputRef = useRef(null);

  return (
    <div className="text-center mb-2">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Eisenhower Matrix</h1>
      <p className="text-lg md:text-xl text-gray-600 mb-6">Organize tasks by importance and urgency</p>
      
      {/* MODIFIED: Added the buttons back */}
      <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
        <button onClick={onAddTask} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-md">
          <Plus size={20} />Add Task
        </button>
        <button onClick={onExport} className="bg-gray-600 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 shadow-md">
          <Download size={20} />Export
        </button>
        <button onClick={() => fileInputRef.current.click()} className="bg-gray-600 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center gap-2 shadow-md">
          <Upload size={20} />Import
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={onImport} />
      </div>
    </div>
  );
};

export default Header;