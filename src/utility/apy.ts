/**
 * Estimates APY based in the daily volumes.
 *
 * Its recommended to use more than 100 days.
 * @param dailyVolumes array containing daily volumes
 * @returns
 */
function cAPY(dailyVolumes: string[]): string {
  const lastVolume = dailyVolumes.pop();
  if (lastVolume) {
    let sum = 0;

    dailyVolumes.forEach((dailyVolume) => {
      sum += +dailyVolume.split('.')[0];
    });

    const fee = sum * 0.25;
    const avg = fee / dailyVolumes.length;
    const apr = avg / +lastVolume.split('.')[0];
    const apy = (((1 + apr) ** 12 - 1) / 100).toFixed(2);
    if (!Number.isNaN(+apy)) {
      return +apy >= 1000 ? '>1000%' : `${apy}%`;
    }
  }
  return '0%';
}

export default cAPY;
