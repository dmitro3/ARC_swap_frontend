import React, { useEffect, useMemo, useState } from 'react';
import './style.scss';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { IBalanceSummaryTable } from '../../interfaces/BalanceSummary';

ChartJS.register(ArcElement, Tooltip, Legend);

const preLoadChart = {
  labels: [],
  datasets: [
    {
      data: [1],
      backgroundColor: ['rgba(0,0,0,0.125)'],
      borderColor: ['transparent'],
      borderWidth: 1,
    },
  ],
};

const colorSet = ['#007aff', '#19f736', '#3fd953', '#29f244', '#48bd57'];

const DashboardDonut: React.FC<{
  data?: IBalanceSummaryTable[];
}> = ({ data }) => {
  const getColor = (seed: number) => colorSet[seed % (colorSet.length - 1)];

  const [chartData, setChartData] = useState<any>();

  const prepareChartData = () => {
    if (data) {
      const parsedData = {
        labels: [] as string[],
        datasets: [
          {
            data: [] as number[],
            backgroundColor: [] as string[],
            borderColor: [] as string[],
            borderWidth: 1,
          },
        ],
      };

      data.forEach((item, index) => {
        parsedData.labels.push(item.name);
        parsedData.datasets[0].data.push(+item.value);
        parsedData.datasets[0].backgroundColor.push(getColor(index));
        parsedData.datasets[0].borderColor.push('#2626');
      });

      setChartData(parsedData);
    }
  };

  const options: any = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  useEffect(() => {
    if (data) prepareChartData();
  }, [data]);

  return (
    <>
      <div className="donut-container">
        {useMemo(
          () => (
            <Doughnut data={chartData ?? preLoadChart} options={options} />
          ),
          [chartData],
        )}
      </div>
    </>
  );
};

export default DashboardDonut;
