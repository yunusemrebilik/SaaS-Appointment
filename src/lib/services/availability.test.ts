import { describe, it, expect } from 'vitest';
import { computeMemberSlots } from './availability';

describe('Availability Service', () => {
  const baseDate = new Date('2024-01-01T00:00:00Z'); // Monday
  const duration = 60; // 60 minutes for easy math

  const normalSchedule = [{
    memberId: '1',
    startTime: '09:00',
    endTime: '17:00' // 8 hours
  }];

  it('should generate basic slots from schedule', () => {
    const slots = computeMemberSlots(
      normalSchedule,
      [],
      [],
      baseDate,
      duration
    );

    // 09:00 to 17:00 with 60min duration => 8 slots
    // 09:00, 10:00, ..., 16:00
    expect(slots).toHaveLength(8);
    expect(slots[0]).toBe('09:00');
    expect(slots[7]).toBe('16:00');
  });

  it('should handle day_off override', () => {
    const slots = computeMemberSlots(
      normalSchedule,
      [{
        memberId: '1',
        type: 'day_off',
        date: baseDate,
        startTime: null,
        endTime: null
      }],
      [],
      baseDate,
      duration
    );
    expect(slots).toHaveLength(0);
  });

  it('should handle time_off override', () => {
    // Off from 12:00 to 13:00 (lunch)
    const slots = computeMemberSlots(
      normalSchedule,
      [{
        memberId: '1',
        type: 'time_off',
        date: baseDate,
        startTime: '12:00',
        endTime: '13:00'
      }],
      [],
      baseDate,
      duration
    );

    // Should remove 12:00 slot (starts at 12:00, ends at 13:00)
    // 09, 10, 11, [12 skipped], 13, 14, 15, 16
    expect(slots).not.toContain('12:00');
    expect(slots).toContain('11:00');
    expect(slots).toContain('13:00');
    expect(slots).toHaveLength(7);
  });

  it('should handle extra_work override', () => {
    // Add 17:00 to 19:00
    const slots = computeMemberSlots(
      normalSchedule,
      [{
        memberId: '1',
        type: 'extra_work',
        date: baseDate,
        startTime: '17:00',
        endTime: '19:00'
      }],
      [],
      baseDate,
      duration
    );

    // 09..16 (8 slots) + 17, 18 (2 slots) = 10 slots
    expect(slots).toHaveLength(10);
    expect(slots).toContain('17:00');
    expect(slots).toContain('18:00');
  });

  it('should handle booking conflicts', () => {
    // Booking from 10:00 to 11:00
    const bookingStart = new Date(baseDate);
    bookingStart.setHours(10, 0, 0, 0);
    const bookingEnd = new Date(baseDate);
    bookingEnd.setHours(11, 0, 0, 0);

    const slots = computeMemberSlots(
      normalSchedule,
      [],
      [{
        memberId: '1',
        startTime: bookingStart,
        endTime: bookingEnd
      }],
      baseDate,
      duration
    );

    expect(slots).not.toContain('10:00');
    expect(slots).toHaveLength(7);
  });

  it('should handle overlapping extra_work seamlessly', () => {
    // Schedule ends 17:00. Extra work starts 16:00 to 19:00.
    // Should merge to 09:00 - 19:00.
    const slots = computeMemberSlots(
      normalSchedule,
      [{
        memberId: '1',
        type: 'extra_work',
        date: baseDate,
        startTime: '16:00',
        endTime: '19:00'
      }],
      [],
      baseDate,
      duration
    );

    // 09..18 = 10 slots
    expect(slots).toHaveLength(10);
    expect(slots).toContain('16:00'); // Was already in schedule, should still be there
    expect(slots).toContain('18:00'); // New slot
  });
});
