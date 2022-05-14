/* eslint-disable */
import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { SubgraphPair } from '../../../interfaces/Subgraphs';

const today: any = new Date();
const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const dd = String(today.getDate()).padStart(2, '0');
const mm = monthNames[today.getMonth()];
const yyyy = today.getFullYear();
const now = `${mm} ${dd}, ${yyyy}`;

interface StateProps {
  options: any;
  series: any;
}
const PoolGraphic: React.FC<{
  pairContent: string[];
}> = ({ pairContent }) => {
  const state: StateProps = {
    options: {
      noData: {
        text: 'Loading data...',
      },
      chart: {
        foreColor: '#cecece',
        background: 'transparent',
        toolbar: {
          show: false,
        },
        width: '100%',
        height: 270,
      },
      xaxis: {
        labels: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
        itemMargin: {
          horizontal: 10,
          vertical: 20,
        },
        fontSize: '16px',
      },
      theme: {
        mode: 'dark',
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
          formatter: (value: number) => `${now}`,
        },
        y: {
          show: false,
        },
      },
      grid: {
        borderColor: '#494949',
      },
      widthMobile: 340,
      stroke: {
        colors: ' #007aff80',
        lineCap: 'butt',
      },
    },
    series: [
      {
        name: 'Volume in USD',
        data: pairContent,
      },
    ],
  };
  const chartWidth = () => {
    const width = window.innerWidth;
    if (width > 1080) {
      return state.options.chart.width;
    }
    if (width < 500) {
      return state.options.widthMobile;
    }
    return 180;
  };
  return (
    <div className="gphcholder" style={{ width: '100%' }}>
      <div className="gphcholder__graphic" style={{ width: '100%' }}>
        <h1>Volume</h1>
        <Chart
          options={state.options}
          series={state.series}
          type="area"
          width={chartWidth()}
          height={state.options.chart.height}
        />
      </div>
    </div>
  );
};
export default PoolGraphic;
