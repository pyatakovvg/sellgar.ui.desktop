export const formatMoney = (value: string | null, currencyCode: string): string => {
  if (value === null) return 'Уточняется';

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));
};

export const formatPositions = (count: number): string => {
  const plural = new Intl.PluralRules('ru-RU').select(count);
  const label = plural === 'one' ? 'позиция' : plural === 'few' ? 'позиции' : 'позиций';

  return `${count} ${label}`;
};
