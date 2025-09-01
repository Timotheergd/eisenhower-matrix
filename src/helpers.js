export const calculateUrgency = (deadline) => {
  if (!deadline) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 100;
  if (diffDays === 0) return 95;
  if (diffDays > 30) return 10;
  const urgency = 94 - 24.697 * Math.log(diffDays);
  return Math.round(urgency);
};

export const getDifficultyColor = (difficulty) => `hsl(${(1 - difficulty / 100) * 120}, 100%, 45%)`;

export const getScoreColor = (score) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const hue = (1 - normalizedScore / 100) * 120;
  return `hsl(${hue}, 90%, 55%)`;
};

export const getPastelColor = (hslColor) => {
  if (!hslColor || !hslColor.startsWith('hsl')) {
    return '#f3f4f6';
  }
  const parts = hslColor.match(/(\d+(\.\d+)?)/g);
  if (!parts || parts.length < 3) {
    return '#f3f4f6';
  }
  const [hue, saturation] = parts;
  return `hsl(${hue}, ${saturation}%, 90%)`;
};

// NEW: Helper function to create a darker version of a given HSL color for text
export const getDarkerColor = (hslColor) => {
  if (!hslColor || !hslColor.startsWith('hsl')) {
    return '#1f2937'; // A dark gray fallback
  }
  const parts = hslColor.match(/(\d+(\.\d+)?)/g);
  if (!parts || parts.length < 3) {
    return '#1f2937';
  }
  const [hue, saturation] = parts;
  // Use the same hue and saturation but with a much lower lightness for high contrast
  return `hsl(${hue}, ${saturation}%, 40%)`;
};

export const getQuadrant = (importance, urgency) => {
  if (importance >= 50 && urgency >= 50) return { name: 'DO', color: '#fee2e2', border: '#dc2626', textColor: '#dc2626' };
  if (importance >= 50 && urgency < 50) return { name: 'SCHEDULE', color: '#dbeafe', border: '#2563eb', textColor: '#2563eb' };
  if (importance < 50 && urgency >= 50) return { name: 'DELEGATE', color: '#fef3c7', border: '#d97706', textColor: '#d97706' };
  return { name: 'ELIMINATE', color: '#f3f4f6', border: '#6b7280', textColor: '#6b7280' };
};

export const formatDateEuropean = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB');
};
