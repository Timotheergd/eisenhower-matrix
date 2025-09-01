// MODIFIED: The entire calculateUrgency function is new
export const calculateUrgency = (deadline) => {
  if (!deadline) return 0;

  const now = new Date();
  // Normalize "now" to the start of the current day for accurate day difference calculation
  now.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  // Normalize the deadline to the start of its day
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Overdue tasks are maximum urgency
  if (diffDays < 0) {
    return 100;
  }
  // Tasks due today have a fixed, very high urgency
  if (diffDays === 0) {
    return 95;
  }
  // For tasks due in the future, use a logarithmic decay curve.
  // This means urgency drops sharply at first, then more slowly.
  // We cap the meaningful range at 30 days.
  if (diffDays > 30) {
    return 10;
  }

  // This formula maps day 1 to an urgency of ~94 and day 30 to an urgency of 10.
  // It's derived from: 94 - ( (94-10) / ln(30) ) * ln(diffDays)
  const urgency = 94 - 24.697 * Math.log(diffDays);
  
  return Math.round(urgency);
};

export const getDifficultyColor = (difficulty) => `hsl(${(1 - difficulty / 100) * 120}, 100%, 45%)`;

export const getScoreColor = (score) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const hue = (1 - normalizedScore / 100) * 120;
  return `hsl(${hue}, 90%, 55%)`;
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