function money(
  amount: number,
  locale = 'en-US',
  currency = 'USD',
  minimumFractionDigits = 2,
  maximumFractionDigits = 10,
): string {
  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

export default money;
