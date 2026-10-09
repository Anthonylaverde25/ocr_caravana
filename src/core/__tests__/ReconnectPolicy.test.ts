import { STABLE_LINK_MS, attemptAfterLoss, reconnectDelayMs } from '../readers/ReconnectPolicy';

describe('ReconnectPolicy', () => {
  it('starts over after a link that held', () => {
    expect(attemptAfterLoss(4, STABLE_LINK_MS)).toBe(1);
    expect(attemptAfterLoss(4, STABLE_LINK_MS + 60_000)).toBe(1);
  });

  it('keeps counting when the link drops right after connecting', () => {
    expect(attemptAfterLoss(0, 500)).toBe(1);
    expect(attemptAfterLoss(1, 800)).toBe(2);
    expect(attemptAfterLoss(3, STABLE_LINK_MS - 1)).toBe(4);
  });

  it('waits longer on each attempt, up to the cap', () => {
    expect([1, 2, 3, 4, 5].map(reconnectDelayMs)).toEqual([1_000, 2_000, 4_000, 8_000, 15_000]);
    expect(reconnectDelayMs(12)).toBe(15_000);
  });

  it('treats an out-of-range attempt as the first', () => {
    expect(reconnectDelayMs(0)).toBe(1_000);
  });

  it('backs off a flapping link instead of retrying every second', () => {
    let attempt = 0;
    const waits: number[] = [];
    for (let i = 0; i < 6; i++) {
      attempt = attemptAfterLoss(attempt, 300);
      waits.push(reconnectDelayMs(attempt));
    }
    expect(waits).toEqual([1_000, 2_000, 4_000, 8_000, 15_000, 15_000]);
  });
});
