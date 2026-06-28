/**
 * Gamification & Temporal Analytics Engine for HabitPulse
 * Processes time-series string indicators to output real-time RPG states.
 */

const XP_PER_COMPLETION = 10;
const STREAK_BONUS_MULTIPLIER = 5;

/**
 * Calculates current and longest streaks for a specific habit ID
 * Handles timezone-safe string dates formatted as YYYY-MM-DD
 */
export const calculateHabitStreaks = (trackerData, habitId) => {
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  // Sort dates chronologically to evaluate continuous chains
  const sortedDates = Object.keys(trackerData).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDateStr = sortedDates[i];
    const isCompleted = trackerData[currentDateStr]?.[habitId] === true;

    if (isCompleted) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0; // Chain broken
    }
  }

  // A streak is only currently active if completed today or yesterday
  const finalDateWithActivity = [...sortedDates]
    .reverse()
    .find((date) => trackerData[date]?.[habitId] === true);

  if (
    finalDateWithActivity === todayStr ||
    finalDateWithActivity === yesterdayStr
  ) {
    // Walk backward from the final active date to accurately lock active continuity
    let walkDate = new Date(finalDateWithActivity);
    while (true) {
      const walkStr = walkDate.toISOString().split("T")[0];
      if (trackerData[walkStr]?.[habitId] === true) {
        currentStreak++;
        walkDate.setDate(walkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
};

/**
 * Calculates global user level and remaining experience points
 * Employs a linear scale curve where each tier requires 100 XP
 */
export const computeLevelFromXP = (totalXP) => {
  const level = Math.floor(totalXP / 100) + 1;
  const xpInCurrentLevel = totalXP % 100;
  const xpNeededForNextLevel = 100;
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  // Compute Hunter Rank details
  let rank = "E-Rank";
  let rankGlow = "rank-e-glow";

  if (level >= 30) {
    rank = "Shadow Monarch";
    rankGlow = "rank-monarch-glow";
  } else if (level >= 25) {
    rank = "S-Rank";
    rankGlow = "rank-s-glow";
  } else if (level >= 20) {
    rank = "A-Rank";
    rankGlow = "rank-a-glow";
  } else if (level >= 15) {
    rank = "B-Rank";
    rankGlow = "rank-b-glow";
  } else if (level >= 10) {
    rank = "C-Rank";
    rankGlow = "rank-c-glow";
  } else if (level >= 5) {
    rank = "D-Rank";
    rankGlow = "rank-d-glow";
  }

  return {
    level,
    xpInCurrentLevel,
    progressPercentage,
    rank,
    rankGlow
  };
};

/**
 * Computes individual bonus multipliers for logging actions
 */
export const evaluateActionXPReward = (currentStreak) => {
  if (currentStreak > 0 && currentStreak % 7 === 0) {
    return XP_PER_COMPLETION + STREAK_BONUS_MULTIPLIER * 7; // Massive Milestone Drop
  }
  return XP_PER_COMPLETION;
};

/**
 * Computes the Unified Power Rating (EMA) scaled from 0 to 1000
 * Evaluates active consistency, applying 4x higher weight to the last 72 hours.
 */
export const calculateUnifiedPowerRating = (trackerData, allHabits) => {
  if (allHabits.length === 0) return 0;
  
  const today = new Date();
  let weightedSum = 0;
  let weightTotal = 0;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayData = trackerData[dateStr] || {};
    
    const completedCount = allHabits.filter(h => dayData[h.id] === true).length;
    const ratio = completedCount / allHabits.length;

    // Weight multiplier: 4x for the last 72 hours (last 3 days), 1x for older days
    const weight = i < 3 ? 4.0 : 1.0;

    weightedSum += ratio * weight;
    weightTotal += weight;
  }

  return Math.round((weightedSum / weightTotal) * 1000);
};

/**
 * Performs behavioral risk analysis over a 6-week sliding window
 * Detects completion frequencies per day of the week to highlight drops
 */
export const analyzeBehavioralRisk = (trackerData, allHabits) => {
  if (allHabits.length === 0) return null;
  
  const today = new Date();
  const dayStats = {};
  
  for (let i = 0; i < 7; i++) {
    dayStats[i] = { total: 0, completed: 0 };
  }

  for (let i = 41; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();

    const dayData = trackerData[dateStr] || {};
    const completedCount = allHabits.filter(h => dayData[h.id] === true).length;
    const ratio = allHabits.length > 0 ? completedCount / allHabits.length : 0;

    dayStats[dayOfWeek].total++;
    if (ratio >= 0.5) {
      dayStats[dayOfWeek].completed++;
    }
  }

  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let highRiskDay = null;
  let lowestRatio = 1.0;

  for (let i = 0; i < 7; i++) {
    const stats = dayStats[i];
    if (stats.total >= 2) {
      const ratio = stats.completed / stats.total;
      if (ratio < 0.50 && ratio < lowestRatio) {
        lowestRatio = ratio;
        highRiskDay = {
          dayName: daysMap[i],
          percentage: Math.round(ratio * 100)
        };
      }
    }
  }

  return highRiskDay;
};
