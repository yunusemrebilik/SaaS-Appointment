import { describe, it, expect } from 'vitest';
import { ok, err } from '@/lib/safe-action';

describe('ok helper', () => {
  it('returns success result with data', () => {
    const result = ok({ id: '123', name: 'Test' });
    expect(result).toEqual({
      success: true,
      data: { id: '123', name: 'Test' },
    });
  });

  it('handles primitive data', () => {
    expect(ok(42)).toEqual({ success: true, data: 42 });
    expect(ok('hello')).toEqual({ success: true, data: 'hello' });
    expect(ok(true)).toEqual({ success: true, data: true });
  });

  it('handles null and undefined data', () => {
    expect(ok(null)).toEqual({ success: true, data: null });
    expect(ok(undefined)).toEqual({ success: true, data: undefined });
  });

  it('handles array data', () => {
    const result = ok([1, 2, 3]);
    expect(result).toEqual({ success: true, data: [1, 2, 3] });
  });
});

describe('err helper', () => {
  it('returns error result with message', () => {
    const result = err('Something went wrong');
    expect(result).toEqual({
      success: false,
      error: 'Something went wrong',
    });
  });

  it('returns error result with message and code', () => {
    const result = err('Not found', 'NOT_FOUND');
    expect(result).toEqual({
      success: false,
      error: 'Not found',
      code: 'NOT_FOUND',
    });
  });

  it('has undefined code when not provided', () => {
    const result = err('Failed');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBeUndefined();
    }
  });
});
