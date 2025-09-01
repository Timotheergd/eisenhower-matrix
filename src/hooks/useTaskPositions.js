import { useMemo } from 'react';
import { calculateUrgency } from '../helpers';

const GRAPH_WIDTH = 600;
const GRAPH_HEIGHT = 400;
const MARGIN = 20;

export const useTaskPositions = (tasks) => {
  const layoutConfig = useMemo(() => {
    const numTasks = tasks.length;
    const fontSize = Math.max(8, 14 - numTasks * 0.15);
    
    // MODIFIED: Reduced the labelOffset values to bring text closer to the points.
    // The maximum distance is now 18 (down from 20) and the minimum is 10 (down from 12).
    const labelOffset = Math.max(10, 18 - numTasks * 0.2);
    
    const pointDistance = Math.max(18, 25 - numTasks * 0.1);
    const jitterRadius = Math.max(10, 15 - numTasks * 0.1);
    
    return { fontSize, labelOffset, pointDistance, jitterRadius };
  }, [tasks.length]);

  const tasksWithPositions = useMemo(() => {
    const { pointDistance, jitterRadius } = layoutConfig;
    const ITERATIONS = 15;
    const positionGroups = new Map();

    // Stage 1: Group tasks by exact position and apply circular layout
    tasks.forEach(task => {
        const urgency = calculateUrgency(task.deadline);
        const key = `${urgency}-${task.importance}`;
        if (!positionGroups.has(key)) {
            positionGroups.set(key, []);
        }
        positionGroups.get(key).push(task);
    });

    let initialPositions = [];
    for (const group of positionGroups.values()) {
        const centerUrgency = calculateUrgency(group[0].deadline);
        const centerImportance = group[0].importance;
        const centerX = MARGIN + (centerUrgency / 100) * (GRAPH_WIDTH - 2 * MARGIN);
        const centerY = GRAPH_HEIGHT - (MARGIN + (centerImportance / 100) * (GRAPH_HEIGHT - 2 * MARGIN));

        if (group.length === 1) {
            initialPositions.push({ ...group[0], x: centerX, y: centerY });
        } else {
            const angleStep = (2 * Math.PI) / group.length;
            group.forEach((task, index) => {
                const angle = angleStep * index;
                const x = centerX + jitterRadius * Math.cos(angle);
                const y = centerY + jitterRadius * Math.sin(angle);
                initialPositions.push({ ...task, x, y });
            });
        }
    }

    // Stage 2: Run force-directed layout on the result of Stage 1
    let finalPositions = [...initialPositions];
    for (let i = 0; i < ITERATIONS; i++) {
        for (let j = 0; j < finalPositions.length; j++) {
            for (let k = j + 1; k < finalPositions.length; k++) {
                const taskA = finalPositions[j];
                const taskB = finalPositions[k];
                const dx = taskA.x - taskB.x;
                const dy = taskA.y - taskB.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                if (distance < pointDistance) {
                    const overlap = (pointDistance - distance) / 2;
                    const pushX = (dx / distance) * overlap;
                    const pushY = (dy / distance) * overlap;
                    
                    taskA.x = Math.min(GRAPH_WIDTH - MARGIN, Math.max(MARGIN, taskA.x + pushX));
                    taskA.y = Math.min(GRAPH_HEIGHT - MARGIN, Math.max(MARGIN, taskA.y + pushY));
                    taskB.x = Math.min(GRAPH_WIDTH - MARGIN, Math.max(MARGIN, taskB.x - pushX));
                    taskB.y = Math.min(GRAPH_HEIGHT - MARGIN, Math.max(MARGIN, taskB.y - pushY));
                }
            }
        }
    }
    return { positions: finalPositions, config: layoutConfig };
  }, [tasks, layoutConfig]);

  return tasksWithPositions;
};