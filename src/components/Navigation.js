import React from 'react';
import { LayoutGrid, Calendar } from 'lucide-react';

const Navigation = ({ currentPage, setCurrentPage }) => {
  const getButtonClass = (pageName) => {
    return `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
      currentPage === pageName
        ? 'bg-indigo-600 text-white shadow'
        : 'bg-white text-gray-700 hover:bg-gray-100'
    }`;
  };

  return (
    <nav className="flex justify-center gap-4 mt-8">
      <button onClick={() => setCurrentPage('matrix')} className={getButtonClass('matrix')}>
        <LayoutGrid size={16} />
        Matrix View
      </button>
      <button onClick={() => setCurrentPage('today')} className={getButtonClass('today')}>
        <Calendar size={16} />
        Today's Plan
      </button>
    </nav>
  );
};

export default Navigation;