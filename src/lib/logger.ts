type LogExtra = Record<string, unknown>;

const isDev = import.meta.env.DEV;

const toErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'Unknown error';
};

export const createErrorId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const maskPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '***';
  const last4 = digits.slice(-4);
  return `***${last4}`;
};

export const logError = (context: string, error: unknown, extra: LogExtra = {}): string => {
  const errorId = createErrorId();
  const message = toErrorMessage(error);

  if (isDev) {
    console.error(`[${context}]`, { errorId, message, error, extra });
  } else {
    console.error(`[${context}]`, { errorId, message, extra });
  }

  return errorId;
};
