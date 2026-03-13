export type MainStepValidationInput = {
  fullName: string;
  phone: string;
  date: string;
  dateFlex: boolean;
  guests: string;
};

export const normalizeMxToE164 = (value: string): string | null => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) return `+52${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return `+${digits}`;
  return null;
};

export const formatPhoneInput = (value: string): string =>
  value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

export const isValidMxPhone = (value: string): boolean => normalizeMxToE164(value) !== null;

export const validateMainStep = (input: MainStepValidationInput): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (input.fullName.trim().length < 2) {
    errors.fullName = 'Escribe tu nombre completo.';
  }

  if (!isValidMxPhone(input.phone)) {
    errors.phone = 'Revisa tu numero (10 digitos en MX).';
  }

  if (!input.dateFlex && !input.date) {
    errors.date = 'Selecciona una fecha o marca la opcion flexible.';
  }

  if (input.guests) {
    const guestsNum = Number(input.guests);
    if (!Number.isFinite(guestsNum) || guestsNum < 1) {
      errors.guests = 'Ingresa un numero valido.';
    }
  }

  return errors;
};
