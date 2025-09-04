import React from 'react'
import { getScoreColor, getPastelColor, getDarkerColor } from '../helpers'

const PriorityList = ({ tasks, onTaskSelect, displayFields = [] }) => {
  const fieldsToDisplay = [...new Set(displayFields)].filter(f => f !== 'title' && f !== 'description')

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Task List ({tasks.length})
      </h2>
      <div className="space-y-2">
        {tasks.length > 0 ? tasks.map(task => {
          const scoreColor = getScoreColor(task.score)

          const scoreStyle = task.isToday 
            ? { 
                backgroundColor: getPastelColor(scoreColor),
                color: getDarkerColor(scoreColor),
                border: `2px solid ${scoreColor}`
              }
            : { 
                backgroundColor: scoreColor,
                color: 'white',
                textShadow: '0px 1px 2px rgba(0, 0, 0, 0.5)'
              }

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
                {/* NEW: Dynamically display relevant fields */}
                {fieldsToDisplay.map(field => (
                  <span key={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}: 
                    <span className="font-bold">
                      {field === 'score' ? task[field].toFixed(1) : task[field]}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )
        }) : <p className="text-gray-500">No tasks match your search criteria.</p>}
      </div>
    </div>
  )
}

export default PriorityList