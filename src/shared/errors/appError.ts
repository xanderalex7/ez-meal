export type AppErrorCode = 'VALIDATION_ERROR' | 'PERSISTENCE_ERROR' | 'DOMAIN_CONFLICT';

export type AppError = {
  code: AppErrorCode;
  message: string;
};

export function toSafeUserMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }

  return 'Si è verificato un problema. Riprova.';
}

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as AppError).message === 'string'
  );
}
