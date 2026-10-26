import type { ProductFieldEntity } from '@library/domain';

export const formatPropertyValue = (
  kind: ProductFieldEntity['property']['kind'],
  value: ProductFieldEntity['values'][number],
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
  return '';
};
