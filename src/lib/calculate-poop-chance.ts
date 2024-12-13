import type { ResolvedEntryDocument } from "@/types/entry";

const MAX_POOP_COUNTER = 10;
const POOP_COUNTER_REDUCTION = 5;
const HOURLY_INCREASE = 0.3;
const MORNING_BONUS = 1.5;
const EVENING_BONUS = 0.8;

/**
 * Calculate chance of poop for a given new trip based on a point system.
 * The counter increases over time and decreases when the dog poops.
 * Additional factors like time of day are considered.
 * @returns A probability between 0 and 1 (0 = 0% chance, 1 = 100% chance)
 */
export const calculatePoopChance = (
  entries: ResolvedEntryDocument[],
  newTrip: ResolvedEntryDocument,
): number => {
  const previousEntries = entries.filter((entry) => entry._id !== newTrip._id);

  const lastPoopTrip = [...previousEntries].find(
    (entry) => entry.poops && entry.poops > 0,
  );

  let poopCounter = 0;
  if (lastPoopTrip) {
    const hoursSinceLastPoop =
      (new Date(newTrip.startTime).getTime() -
        new Date(lastPoopTrip.startTime).getTime()) /
      (1000 * 60 * 60);

    poopCounter = Math.max(0, MAX_POOP_COUNTER - POOP_COUNTER_REDUCTION);
    poopCounter += hoursSinceLastPoop * HOURLY_INCREASE;
  } else {
    poopCounter = MAX_POOP_COUNTER * 0.5;
  }

  // Add time of day bonuses
  const hour = new Date(newTrip.startTime).getHours();
  if (hour >= 6 && hour <= 9) {
    poopCounter += MORNING_BONUS;
  } else if (hour >= 17 && hour <= 20) {
    poopCounter += EVENING_BONUS;
  }

  poopCounter = Math.min(poopCounter, MAX_POOP_COUNTER);

  const probability = (poopCounter / MAX_POOP_COUNTER) ** 1.5;

  const today = new Date(newTrip.startTime).toDateString();
  const poopsToday = previousEntries.filter(
    (entry) =>
      new Date(entry.startTime).toDateString() === today &&
      entry.poops &&
      entry.poops > 0,
  ).length;

  let finalProbability = probability;
  if (poopsToday >= 1) {
    finalProbability *= 0.6 ** poopsToday;
  }

  return Math.min(Math.max(finalProbability, 0), 1);
};
