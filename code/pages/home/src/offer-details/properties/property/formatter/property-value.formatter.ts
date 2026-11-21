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
    case 'DECIMAL': {
      if (value.valueDecimal === null) return '';

      const [integer, fraction = ''] = value.valueDecimal.split('.');
      const significantFraction = fraction.replace(/0+$/, '');

      return significantFraction ? `${integer}.${significantFraction}` : integer;
    }
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
