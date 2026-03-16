import { describe, it, expect } from 'vitest';
import { serviceFormSchema } from '@/actions/services.schema';

describe('serviceFormSchema', () => {
  const validInput = {
    name: 'Haircut',
    durationMin: 30,
    priceCents: 2500,
  };

  it('accepts valid input', () => {
    const result = serviceFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('accepts valid input with optional description', () => {
    const result = serviceFormSchema.safeParse({
      ...validInput,
      description: 'A classic haircut',
    });
    expect(result.success).toBe(true);
  });

  // Name validation
  it('rejects name shorter than 2 characters', () => {
    const result = serviceFormSchema.safeParse({ ...validInput, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = serviceFormSchema.safeParse({
      ...validInput,
      name: 'x'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  // Duration validation
  it('rejects duration below 5 minutes', () => {
    const result = serviceFormSchema.safeParse({ ...validInput, durationMin: 4 });
    expect(result.success).toBe(false);
  });

  it('rejects duration above 480 minutes', () => {
    const result = serviceFormSchema.safeParse({ ...validInput, durationMin: 481 });
    expect(result.success).toBe(false);
  });

  it('accepts boundary duration values', () => {
    expect(serviceFormSchema.safeParse({ ...validInput, durationMin: 5 }).success).toBe(true);
    expect(serviceFormSchema.safeParse({ ...validInput, durationMin: 480 }).success).toBe(true);
  });

  // Price validation
  it('rejects negative price', () => {
    const result = serviceFormSchema.safeParse({ ...validInput, priceCents: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts zero price (free service)', () => {
    const result = serviceFormSchema.safeParse({ ...validInput, priceCents: 0 });
    expect(result.success).toBe(true);
  });

  // Description validation
  it('rejects description longer than 500 characters', () => {
    const result = serviceFormSchema.safeParse({
      ...validInput,
      description: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
