import { useMemo } from 'react';
import { calculateHabitStreaks, computeLevelFromXP } from './gamificationEngine';

export const useGamifiedState = (trackerData, customHabits) => {
  return useMemo(() => {
    let cumulativeXP = 0;
    const habitMetrics = {};

    // 1. Calculate historical XP logs based on all recorded checkboxes
    Object.keys(trackerData).forEach((dateKey) => {
      customHabits.forEach((habit) => {
        if (trackerData[dateKey]?.[habit.id] === true) {
          cumulativeXP += 10; // Base completion XP
        }
      });
    });

    // 2. Compute analytical streak arrays for every unique habit profile
    customHabits.forEach((habit) => {
      const { currentStreak, longestStreak } = calculateHabitStreaks(trackerData, habit.id);
      
      // Inject streak bonuses directly into your global XP pool
      if (currentStreak >= 7) {
        cumulativeXP += Math.floor(currentStreak / 7) * 50; 
      }

      habitMetrics[habit.id] = {
        currentStreak,
        longestStreak
      };
    });

    // 3. Resolve RPG level boundaries from the cumulative XP pool
    const levelTelemetry = computeLevelFromXP(cumulativeXP);

    return {
      totalXP: cumulativeXP,
      ...levelTelemetry,
      habitMetrics
    };
  }, [trackerData, customHabits]);
};
