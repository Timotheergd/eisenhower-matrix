import React from 'react';
import { getDifficultyColor } from '../helpers';

const GRAPH_WIDTH = 600;
const GRAPH_HEIGHT = 400;
const MARGIN = 20;

const SmartLabels = ({ tasksWithPositions, selectedTask }) => {
  if (!tasksWithPositions || !tasksWithPositions.positions || tasksWithPositions.positions.length === 0) {
    return null;
  }

  const { positions, config } = tasksWithPositions;
  const { fontSize, labelOffset } = config;

  const placedElements = [];
  const POINT_RADIUS = 10;

  positions.forEach(task => {
    placedElements.push({
      type: 'point',
      id: task.id,
      bbox: { x: task.x - 10, y: task.y - 10, width: 20, height: 20 }
    });
  });

  placedElements.push({ type: 'boundary', bbox: { x: -1, y: -1, width: 1, height: GRAPH_HEIGHT + 2 } });
  placedElements.push({ type: 'boundary', bbox: { x: GRAPH_WIDTH, y: -1, width: 1, height: GRAPH_HEIGHT + 2 } });
  placedElements.push({ type: 'boundary', bbox: { x: -1, y: -1, width: GRAPH_WIDTH + 2, height: 1 } });
  placedElements.push({ type: 'boundary', bbox: { x: -1, y: GRAPH_HEIGHT, width: GRAPH_WIDTH + 2, height: 1 } });

  const doesOverlap = (box1, box2) => {
    if (!box1 || !box2) return false;
    return !(box2.x > box1.x + box1.width || box2.x + box2.width < box1.x || box2.y > box1.y + box1.height || box2.y + box2.height < box1.y);
  };

  const labelsAndLines = positions.map(task => {
    const { x, y, title, id } = task;
    const isSelected = selectedTask?.id === id;
    const charWidth = fontSize * 0.6;
    const truncatedTitle = title;
    const labelWidth = truncatedTitle.length * charWidth;
    const labelHeight = fontSize;

    const simplePositions = [
      { yOffset: -labelOffset, xOffset: 0, anchor: 'middle' },
      { yOffset: labelOffset + 5, xOffset: 0, anchor: 'middle' },
      { yOffset: fontSize / 3, xOffset: labelOffset, anchor: 'start' },
      { yOffset: fontSize / 3, xOffset: -labelOffset, anchor: 'end' },
    ];

    for (const pos of simplePositions) {
      let labelX;
      if (pos.anchor === 'middle') labelX = x + pos.xOffset - labelWidth / 2;
      else if (pos.anchor === 'end') labelX = x + pos.xOffset - labelWidth;
      else labelX = x + pos.xOffset;
      
      const labelBox = { x: labelX, y: y + pos.yOffset - labelHeight, width: labelWidth, height: labelHeight };

      if (!placedElements.some(el => doesOverlap(el.bbox, labelBox))) {
        placedElements.push({ type: 'label', id, bbox: labelBox });
        return (
          <text key={id} x={x + pos.xOffset} y={y + pos.yOffset} textAnchor={pos.anchor} className="font-medium fill-gray-900 pointer-events-none" style={{ fontSize: `${fontSize}px`, fontWeight: isSelected ? 'bold' : 'normal', textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white' }}>
            {truncatedTitle}
          </text>
        );
      }
    }

    let foundSpot = false;
    let finalLabelPos = {};
    let spiralRadius = labelOffset * 1.5;
    const spiralAngleStep = Math.PI / 8;

    while (!foundSpot && spiralRadius < 200) {
      for (let angle = 0; angle < 2 * Math.PI; angle += spiralAngleStep) {
        const candidateX = x + spiralRadius * Math.cos(angle);
        const candidateY = y + spiralRadius * Math.sin(angle);
        
        const anchor = candidateX > x ? 'start' : 'end';
        const labelX = anchor === 'start' ? candidateX : candidateX - labelWidth;
        const labelBox = { x: labelX, y: candidateY - labelHeight / 2, width: labelWidth, height: labelHeight };

        if (!placedElements.some(el => doesOverlap(el.bbox, labelBox))) {
          finalLabelPos = { x: candidateX, y: candidateY, anchor };
          foundSpot = true;
          break;
        }
      }
      spiralRadius += 10;
    }

    if (foundSpot) {
      const { x: finalX, y: finalY, anchor } = finalLabelPos;
      const labelBox = { x: (anchor === 'start' ? finalX : finalX - labelWidth), y: finalY - labelHeight / 2, width: labelWidth, height: labelHeight };
      placedElements.push({ type: 'label', id, bbox: labelBox });

      const angleToLabel = Math.atan2(finalY - y, finalX - x);
      const lineStartX = x + 6 * Math.cos(angleToLabel);
      const lineStartY = y + 6 * Math.sin(angleToLabel);
      const lineEndX = anchor === 'start' ? labelBox.x - 2 : labelBox.x + labelBox.width + 2;

      return (
        <g key={id}>
          <line x1={lineStartX} y1={lineStartY} x2={lineEndX} y2={finalY} stroke="rgba(55, 65, 81, 0.6)" strokeWidth="1" />
          <text x={finalX} y={finalY + fontSize / 3} textAnchor={anchor} className="font-medium fill-gray-900 pointer-events-none" style={{ fontSize: `${fontSize}px`, fontWeight: isSelected ? 'bold' : 'normal', textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white' }}>
            {truncatedTitle}
          </text>
        </g>
      );
    }
    return null;
  });

  return <>{labelsAndLines}</>;
};


const MatrixGraph = ({ tasksWithPositions, selectedTask, onTaskSelect }) => {
  const positions = tasksWithPositions?.positions || [];

  return (
    <div className="bg-white rounded-xl shadow-lg border p-4 md:p-8">
      <div className="relative">
        <div className="absolute -left-8 md:-left-12 top-1/2 transform -translate-y-1/2 -rotate-90"><span className="text-base md:text-lg font-semibold text-gray-700">IMPORTANCE</span></div>
        <div className="absolute -bottom-8 md:-bottom-10 left-1/2 transform -translate-x-1/2"><span className="text-base md:text-lg font-semibold text-gray-700">URGENCY</span></div>
        <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} className="w-full h-auto">
          <rect x={GRAPH_WIDTH/2} y="0" width={GRAPH_WIDTH/2} height={GRAPH_HEIGHT/2} fill="#fee2e2" />
          <rect x="0" y="0" width={GRAPH_WIDTH/2} height={GRAPH_HEIGHT/2} fill="#dbeafe" />
          <rect x={GRAPH_WIDTH/2} y={GRAPH_HEIGHT/2} width={GRAPH_WIDTH/2} height={GRAPH_HEIGHT/2} fill="#fef3c7" />
          <rect x="0" y={GRAPH_HEIGHT/2} width={GRAPH_WIDTH/2} height={GRAPH_HEIGHT/2} fill="#f3f4f6" />
          <text x={GRAPH_WIDTH * 0.75} y="30" textAnchor="middle" className="text-sm font-bold fill-red-700">DO</text>
          <text x={GRAPH_WIDTH * 0.25} y="30" textAnchor="middle" className="text-sm font-bold fill-blue-700">SCHEDULE</text>
          <text x={GRAPH_WIDTH * 0.75} y={GRAPH_HEIGHT - 20} textAnchor="middle" className="text-sm font-bold fill-yellow-700">DELEGATE</text>
          <text x={GRAPH_WIDTH * 0.25} y={GRAPH_HEIGHT - 20} textAnchor="middle" className="text-sm font-bold fill-gray-700">ELIMINATE</text>
          <line x1={GRAPH_WIDTH/2} y1="0" x2={GRAPH_WIDTH/2} y2={GRAPH_HEIGHT} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="0" y1={GRAPH_HEIGHT/2} x2={GRAPH_WIDTH} y2={GRAPH_HEIGHT/2} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
          
          {positions.map(task => {
            const isSelected = selectedTask?.id === task.id;
            
            if (task.isToday) {
              // MODIFIED: The outer ring now uses the difficulty color
              const difficultyColor = getDifficultyColor(task.difficulty);
              return (
                <g key={task.id} onClick={() => onTaskSelect(task.id === selectedTask?.id ? null : task)} className="cursor-pointer">
                  <circle cx={task.x} cy={task.y} r={isSelected ? 10 : 7} fill={difficultyColor} />
                  <circle cx={task.x} cy={task.y} r={isSelected ? 8 : 5} fill="white" />
                  <circle cx={task.x} cy={task.y} r={isSelected ? 5 : 3} fill={difficultyColor} />
                </g>
              );
            }

            // Standard task rendering
            return (
              <g key={task.id}>
                <circle 
                  cx={task.x} 
                  cy={task.y} 
                  r={isSelected ? 10 : 6} 
                  fill={getDifficultyColor(task.difficulty)} 
                  stroke={isSelected ? '#333' : 'white'} 
                  strokeWidth={2} 
                  className="cursor-pointer transition-all duration-200" 
                  onClick={() => onTaskSelect(task.id === selectedTask?.id ? null : task)} 
                />
              </g>
            );
          })}
          <SmartLabels tasksWithPositions={tasksWithPositions} selectedTask={selectedTask} />
        </svg>
      </div>
    </div>
  );
};

export default MatrixGraph;