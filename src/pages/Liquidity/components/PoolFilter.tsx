/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';
import { Row, Col, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const PoolFilter: React.FC<{
  search: string;
  onChange: Function;
}> = ({ search, onChange }) => (
  <div className="depo__liquidity-filter depo__liquidity__ant-input  text-left">
    <h5 className="text-white">Filter</h5>
    <Row className="m-0 p-0">
      <Col className="bg-light-alpha-10 ml-0 rounded py-2 w-100">
        <Input
          className="depo__liquidity-filter-input"
          placeholder="Enter token or pair symbols (weth usdt) or a pool ticker (contract address)"
          value={search}
          onChange={($e) => {
            onChange($e);
          }}
        />
      </Col>
      {/* <Col xs={12} md={8} className="py-0 text-right mr-0 pr-0">
        <Button className="btn-depo btn-md bg-secondary">
          Create Pool
          <PlusOutlined className="ml-4" />
        </Button>
      </Col> */}
    </Row>
  </div>
);

export default PoolFilter;
