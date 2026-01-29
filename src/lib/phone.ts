/**
 * Phone number utilities for consistent formatting across the application.
 */

/**
 * Normalizes a phone number by removing all non-digit characters.
 * This ensures consistent storage and matching regardless of input format.
 *
 * @example
 * normalizePhone('+90 555 123 4567') // Returns '905551234567'
 * normalizePhone('(555) 123-4567')   // Returns '5551234567'
 * normalizePhone('555.123.4567')     // Returns '5551234567'
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
