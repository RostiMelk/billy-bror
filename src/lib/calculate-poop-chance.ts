import type { ResolvedEntryDocument } from "@/types/entry";

const MAX_POOP_COUNTER = 10;
const POOP_COUNTER_REDUCTION = 5;
const HOURLY_INCREASE = 0.4; // Counter increases by 0.4 every hour
const MORNING_BONUS = 2; // Extra points during morning hours
const EVENING_BONUS = 1; // Extra points during evening hours

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
  // Filter out the current trip and get previous entries
  const previousEntries = entries.filter((entry) => entry._id !== newTrip._id);

  // Find the last poop entry
  const lastPoopTrip = [...previousEntries]
    .reverse()
    .find((entry) => entry.poops && entry.poops > 0);

  // Calculate base counter based on hours since last poop
  let poopCounter = 0;
  if (lastPoopTrip) {
    const hoursSinceLastPoop =
      (new Date(newTrip.startTime).getTime() -
        new Date(lastPoopTrip.startTime).getTime()) /
      (1000 * 60 * 60);

    // Start with counter at last known state (after reduction from last poop)
    poopCounter = Math.max(0, MAX_POOP_COUNTER - POOP_COUNTER_REDUCTION);

    // Add accumulation since last poop
    poopCounter += hoursSinceLastPoop * HOURLY_INCREASE;
  } else {
    // If no previous poop found, assume it's been a while
    poopCounter = MAX_POOP_COUNTER * 0.7; // Start at 70% of max
  }

  // Add time of day bonuses
  const hour = new Date(newTrip.startTime).getHours();
  if (hour >= 6 && hour <= 9) {
    // Morning bonus (6 AM - 9 AM)
    poopCounter += MORNING_BONUS;
  } else if (hour >= 17 && hour <= 20) {
    // Evening bonus (5 PM - 8 PM)
    poopCounter += EVENING_BONUS;
  }

  // Cap the counter at MAX_POOP_COUNTER
  poopCounter = Math.min(poopCounter, MAX_POOP_COUNTER);

  // Convert counter to probability
  let probability = 0;

  if (poopCounter >= 5) {
    // At or above threshold (5), scale from 100% to 200%
    probability = 1 + (poopCounter - 5) / 5;
  } else {
    // Below threshold, scale from 0% to 100%
    probability = poopCounter / 5;
  }

  // Check for recent poops today to potentially reduce probability
  const today = new Date(newTrip.startTime).toDateString();
  const poopsToday = previousEntries.filter(
    (entry) =>
      new Date(entry.startTime).toDateString() === today &&
      entry.poops &&
      entry.poops > 0,
  ).length;

  if (poopsToday >= 2) {
    // Reduce probability if dog has already pooped twice or more today
    probability *= 0.5;
  }

  // Ensure final probability is between 0 and 1
  return Math.min(Math.max(probability, 0), 1);
};
