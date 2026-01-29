import { describe, it, expect } from 'vitest';
import { normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('removes spaces from phone number', () => {
    expect(normalizePhone('555 123 4567')).toBe('5551234567');
  });

  it('removes plus sign and country code formatting', () => {
    expect(normalizePhone('+90 555 123 4567')).toBe('905551234567');
  });

  it('removes dashes from phone number', () => {
    expect(normalizePhone('555-123-4567')).toBe('5551234567');
  });

  it('removes parentheses from phone number', () => {
    expect(normalizePhone('(555) 123-4567')).toBe('5551234567');
  });

  it('removes dots from phone number', () => {
    expect(normalizePhone('555.123.4567')).toBe('5551234567');
  });

  it('handles already normalized phone numbers', () => {
    expect(normalizePhone('5551234567')).toBe('5551234567');
  });

  it('handles mixed formatting', () => {
    expect(normalizePhone('+1 (555) 123-4567')).toBe('15551234567');
  });

  it('returns empty string for empty input', () => {
    expect(normalizePhone('')).toBe('');
  });

  it('handles phone with only non-digit characters', () => {
    expect(normalizePhone('+-() ')).toBe('');
  });
});
