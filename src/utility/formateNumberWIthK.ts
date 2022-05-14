function formateNumberWithK(value: number): string {
  let formatedNumber = '';
  if (+value >= 0) {
    formatedNumber = `${+value.toFixed(2)}`;
  }
  if (+value >= 1000) {
    formatedNumber = `${(value / 1000).toFixed(3)}K`;
  }
  if (+value >= 1000000) {
    formatedNumber = `${(+value / 1000000).toFixed(3)}M`;
  }
  return formatedNumber;
}

export default formateNumberWithK;
