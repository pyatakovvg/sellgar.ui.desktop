import type { StorefrontFieldInput } from '../../../../input/storefront-field.input.ts';

export const formatPropertyValue = (
  kind: StorefrontFieldInput['property']['kind'],
  value: StorefrontFieldInput['values'][number],
): string => {
  switch (kind) {
    case 'TEXT':
      return value.valueText ?? '';
    case 'INTEGER':
      return value.valueInteger ?? '';
    case 'DECIMAL':
      return value.valueDecimal ?? '';
    case 'BOOLEAN':
      return value.valueBoolean === null ? '' : value.valueBoolean ? 'Да' : 'Нет';
    case 'DATE': {
      if (!value.valueDate) return '';
      const date = new Date(value.valueDate);
      return Number.isNaN(date.getTime()) ? value.valueDate : date.toLocaleDateString('ru-RU', { timeZone: 'UTC' });
    }
    case 'OPTIONS':
      return '';
  }
};
