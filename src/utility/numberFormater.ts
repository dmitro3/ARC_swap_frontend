function numberFormater(amount: number, locale = 'en-US'): string {
  return Intl.NumberFormat(locale).format(amount);
}

export default numberFormater;
