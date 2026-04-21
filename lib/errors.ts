import * as Sentry from '@sentry/nextjs'

export class AppError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, status = 500, code = 'app_error') {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404, 'not_found')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'rate_limited')
    this.name = 'RateLimitError'
  }
}

export function handleError(error: unknown): never {
  Sentry.captureException(error)
  throw error
}
