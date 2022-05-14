import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from 'antd';
import MarketListTable from '../../components/MarketListTable/MarketListTable';
import Top3CEXCharts from '../../components/Top3CEXCharts/Top3CEXCharts';

import capitalize from '../../utility/FirstLetterCapital';

import './styles.scss';

const MarketOverview: React.FC = () => {
  const { type }: any = useParams();
  const titlePage = type ? `${capitalize(type)} Markets` : 'Spot Markets';
  const { Link } = Typography;

  return (
    <div>
      <h3 className="page-title">{titlePage}</h3>
      <Link
        href="http://www.tradingview.com/markets"
        target="_blank"
        style={{ color: '#8D8D8D', fontSize: '14px', cursor: 'pointer' }}
      >
        Market data provided by Tradingview
      </Link>
      <Top3CEXCharts />
      <div className="market-list-container">
        <MarketListTable type={type} />
      </div>
    </div>
  );
};

export default MarketOverview;
