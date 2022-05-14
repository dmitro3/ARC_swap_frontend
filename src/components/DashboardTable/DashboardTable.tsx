import React from 'react';
import { Row, Col } from 'antd';
import './style.scss';
import CexCard from './components/CexCard';
import DexCard from './components/DexCard';
import NftCard from './components/NftCard';

const DashboardTable: React.FC<{
  dexHandler: React.Dispatch<React.SetStateAction<any>>;
}> = ({ dexHandler }) => (
  <Row className="p-0" gutter={[16, 0]}>
    <Col xs={24} sm={24} md={12} lg={8}>
      <CexCard />
    </Col>
    <Col xs={24} sm={24} md={12} lg={8}>
      <DexCard
        afterFetchValues={(assets) => {
          dexHandler(assets);
        }}
      />
    </Col>
    <Col xs={24} sm={24} md={12} lg={8}>
      <NftCard />
    </Col>
  </Row>
);

export default DashboardTable;
