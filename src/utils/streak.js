/**
 * Computes active "Current Streak" and "Longest All-Time Streak" next to a habit
 * by traversing historical logs.
 *
 * @param {string} habitId - The ID of the target habit.
 * @param {Object} trackerData - Active log dataset (mapping of dateStr to completion states).
 * @param {string} todayStr - System current date string (e.g. '2026-06-28').
 * @returns {{currentStreak: number, longestStreak: number}}
 */
export function calculateStreak(habitId, trackerData, todayStr) {
  // Find all dates where the habit was completed
  const completedDates = Object.keys(trackerData).filter(
    date => trackerData[date] && trackerData[date][habitId]
  );
  
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  // Sort dates chronologically
  const sortedDates = completedDates
    .map(d => new Date(d + 'T00:00:00'))
    .sort((a, b) => a - b);
  
  let longestStreak = 0;
  let currentStreak = 0;
  
  // Compute longest streak
  let tempStreak = 0;
  let prevDate = null;
  
  for (let i = 0; i < sortedDates.length; i++) {
    const curDate = sortedDates[i];
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(curDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    prevDate = curDate;
  }
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }
  
  // Compute current streak
  // Start checks from today and yesterday
  const today = new Date(todayStr + 'T00:00:00');
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayFormatted = todayStr;
  const yesterdayFormatted = yesterday.toISOString().split('T')[0];
  
  const isCompletedToday = !!(trackerData[todayFormatted] && trackerData[todayFormatted][habitId]);
  const isCompletedYesterday = !!(trackerData[yesterdayFormatted] && trackerData[yesterdayFormatted][habitId]);
  
  if (isCompletedToday || isCompletedYesterday) {
    let checkDate = isCompletedToday ? today : yesterday;
    let counting = true;
    
    while (counting) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (trackerData[checkStr] && trackerData[checkStr][habitId]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        counting = false;
      }
    }
  } else {
    currentStreak = 0;
  }
  
  return { currentStreak, longestStreak };
}
