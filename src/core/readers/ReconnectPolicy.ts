/** Waits between reconnection attempts: quick at first, then no more than every 15 s. */
export const RECONNECT_BACKOFF_MS = [1_000, 2_000, 4_000, 8_000, 15_000];

/** A link that lasts at least this long counts as recovered. */
export const STABLE_LINK_MS = 10_000;

/**
 * The attempt number after the link is lost. A link that drops soon after connecting did not
 * really recover, so the count goes on and the wait grows; restarting at 1 would reconnect every
 * second forever, flipping between "connected" and "reconnecting".
 */
export function attemptAfterLoss(previousAttempt: number, linkAgeMs: number): number {
  return linkAgeMs < STABLE_LINK_MS ? previousAttempt + 1 : 1;
}

export function reconnectDelayMs(attempt: number): number {
  const index = Math.min(Math.max(attempt, 1), RECONNECT_BACKOFF_MS.length) - 1;
  return RECONNECT_BACKOFF_MS[index];
}
