export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof Error) {
    return new APIError(error.message, 500);
  }

  return new APIError('An unexpected error occurred', 500);
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
} 
