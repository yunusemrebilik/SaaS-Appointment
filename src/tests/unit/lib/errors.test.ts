import { describe, it, expect } from 'vitest';
import { AppError, Unauthorized, BadRequest } from '@/lib/errors';

describe('AppError', () => {
  it('sets code and default status', () => {
    const error = new AppError('SOME_CODE');
    expect(error.code).toBe('SOME_CODE');
    expect(error.status).toBe(500);
    expect(error.message).toBe('SOME_CODE');
  });

  it('accepts custom status and message', () => {
    const error = new AppError('CUSTOM', 422, 'Something went wrong');
    expect(error.code).toBe('CUSTOM');
    expect(error.status).toBe(422);
    expect(error.message).toBe('Something went wrong');
  });

  it('is an instance of Error', () => {
    const error = new AppError('TEST');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('Unauthorized', () => {
  it('has correct defaults', () => {
    const error = new Unauthorized();
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.status).toBe(401);
    expect(error.message).toBe('Unauthorized');
  });

  it('extends AppError and Error', () => {
    const error = new Unauthorized();
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('BadRequest', () => {
  it('has correct defaults', () => {
    const error = new BadRequest();
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad request');
  });

  it('accepts custom message', () => {
    const error = new BadRequest('Invalid email format');
    expect(error.message).toBe('Invalid email format');
    expect(error.status).toBe(400);
  });

  it('extends AppError and Error', () => {
    const error = new BadRequest();
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });
});
