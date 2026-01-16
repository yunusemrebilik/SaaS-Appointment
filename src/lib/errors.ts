export class AppError extends Error {
  code: string;
  status: number;

  constructor(code: string, status = 500, message?: string) {
    super(message ?? code);
    this.code = code;
    this.status = status;
  }
}

export class Unauthorized extends AppError {
  constructor() {
    super('UNAUTHORIZED', 401, 'Unauthorized');
  }
}

export class BadRequest extends AppError {
  constructor(msg = 'Bad request') {
    super('BAD_REQUEST', 400, msg);
  }
}
