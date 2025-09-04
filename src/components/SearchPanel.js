import React from 'react'
import { Search, SortAsc } from 'lucide-react'

const SearchPanel = ({ searchQuery, setSearchQuery, searchField, setSearchField, useRegex, setUseRegex, sortBy, setSortBy }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2 flex items-center gap-2">
          <Search className="text-gray-400" />
          <input 
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select 
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="title">Title</option>
            <option value="description">Description</option>
            <option value="deadline">Deadline</option>
            <option value="importance">Importance</option>
            <option value="urgency">Urgency</option>
            <option value="score">Score</option>
          </select>
          <div className="flex items-center gap-2 pl-2">
            <input 
              type="checkbox"
              id="useRegex"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="useRegex" className="text-sm text-gray-600">Regex</label>
          </div>
        </div>
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <SortAsc className="text-gray-400" />
          <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">Sort by:</label>
          <select 
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="score">Priority Score</option>
            <option value="urgency">Urgency</option>
            <option value="importance">Importance</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default SearchPanel