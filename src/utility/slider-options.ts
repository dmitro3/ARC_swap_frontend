import { SliderMarks } from 'antd/lib/slider';

/**
 * Mounts a [Slider](https://ant.design/components/slider/) option object.
 *
 * If `maxValue` is set, the values will be distributed evenly across the slider track
 * varying from 0% to `maxValue`% but the labels will still be `100/4`.
 *
 * This means that the if you put `50` as `maxValue`, the values will be distributed
 * as 0%, 12.5%, 25%, 37.5% and 50% but the labels will be shown as 0%, 25%, 50%, 100%.
 * A reason for this is to not confuse the user showing different values from slider to slider.
 * It is recommended that the `max amount` shown to the user is normalized at `(maxValue/100) * maxAmount`
 * to show the real percentage values.
 *
 * @param maxValue the max percentage of the original value to be used.
 * @returns
 */
const sliderMarkOptions = (maxValue = 100): SliderMarks => ({
  0: {
    style: {
      color: 'var(--brand-secondary)',
      fontWeight: 'lighter',
    },
    label: '0%',
  },
  [(maxValue / 4).toFixed(0)]: {
    style: {
      color: 'var(--brand-secondary)',
      fontWeight: 'lighter',
    },
    label: '25%',
  },
  [(maxValue / 2).toFixed(0)]: {
    style: {
      color: 'var(--brand-secondary)',
      fontWeight: 'lighter',
    },
    label: '50%',
  },
  [((maxValue / 4) * 3).toFixed(0)]: {
    style: {
      color: 'var(--brand-secondary)',
      fontWeight: 'lighter',
    },
    label: '75%',
  },
  [maxValue.toFixed(0)]: {
    style: {
      color: 'var(--brand-secondary)',
      fontWeight: 'lighter',
    },
    label: '100%',
  },
});

export default sliderMarkOptions;
