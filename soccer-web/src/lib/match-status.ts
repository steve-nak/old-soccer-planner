export type MatchTimingState = "upcoming" | "current" | "past";
export type MatchCapacityState = "under capacity" | "full capacity" | "over capacity";

const MATCH_DURATION_MS = 60 * 60 * 1000;

export function getMatchTimingState(startsAt: Date, now = new Date()): MatchTimingState {
  const startsAtTime = startsAt.getTime();
  const currentTime = now.getTime();

  if (currentTime < startsAtTime) {
    return "upcoming";
  }

  if (currentTime < startsAtTime + MATCH_DURATION_MS) {
    return "current";
  }

  return "past";
}

export function getMatchCapacityState(totalPlayers: number, capacity: number): MatchCapacityState {
  if (totalPlayers < capacity) {
    return "under capacity";
  }

  if (totalPlayers === capacity) {
    return "full capacity";
  }

  return "over capacity";
}

export function isMatchActive(match: { startsAt: Date; isCanceled: boolean }, now = new Date()) {
  return !match.isCanceled && getMatchTimingState(match.startsAt, now) !== "past";
}
