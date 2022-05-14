import React from 'react';
import { Table } from 'antd';
import '../style.scss';
import { dataNft, columsNft } from '../utils/info';

const NftCard: React.FC = () => (
  <div className="tableholder-nft">
    <div
      style={{
        width: '100%',
        height: '4px',
        zIndex: 1,
        position: 'relative',
        top: '3px',
      }}
    >
      <h4 style={{ color: '#FFF', fontSize: '20px' }}>NFT</h4>
    </div>
    <Table
      id="tabela"
      columns={columsNft}
      dataSource={dataNft}
      pagination={false}
    />
  </div>
);

export default NftCard;
