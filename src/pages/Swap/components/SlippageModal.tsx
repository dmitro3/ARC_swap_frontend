/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Row, Col, Button } from 'antd';
import DepoModal from '../../../components/DepoModal/DepoModal';

const SlippageModal: React.FC<{
  visible: boolean;
  setVisibility: Function;
  onSelect: (slippage: number) => void;
  slippage: number;
}> = ({ visible, setVisibility, onSelect, slippage }) => (
  <DepoModal
    onClose={() => {
      setVisibility(false);
    }}
    open={visible}
  >
    <Row className="text-white bg-lightgrey rounded py-3 px-0 mx-0">
      <Col xs={24}>
        <h5 className="text-white text-center mb-4">Select slippage</h5>
        <div className="d-flex justify-center">
          <div
            defaultChecked={slippage === 0.1}
            onClick={() => {
              onSelect(0.1);
            }}
            className={`slippage-selector ${
              slippage === 0.1 ? ' selected' : ''
            }`}
          >
            0.1%
          </div>
          <div
            defaultChecked={slippage === 0.5}
            onClick={() => {
              onSelect(0.5);
            }}
            className={`slippage-selector ${
              slippage === 0.5 ? ' selected' : ''
            }`}
          >
            0.5%
          </div>
          <div
            defaultChecked={slippage === 1}
            onClick={() => {
              onSelect(1);
            }}
            className={`slippage-selector ${slippage === 1 ? ' selected' : ''}`}
          >
            1%
          </div>
          <div
            defaultChecked={slippage === 2}
            onClick={() => {
              onSelect(2);
            }}
            className={`slippage-selector ${slippage === 2 ? ' selected' : ''}`}
          >
            2%
          </div>
          <div
            defaultChecked={slippage === 3}
            onClick={() => {
              onSelect(3);
            }}
            className={`slippage-selector ${slippage === 3 ? ' selected' : ''}`}
          >
            3%
          </div>
          <div
            defaultChecked={slippage === 5}
            onClick={() => {
              onSelect(5);
            }}
            className={`slippage-selector ${slippage === 5 ? ' selected' : ''}`}
          >
            5%
          </div>
          <div
            defaultChecked={slippage === 10}
            onClick={() => {
              onSelect(10);
            }}
            className={`slippage-selector ${
              slippage === 10 ? ' selected' : ''
            }`}
          >
            10%
          </div>
        </div>
      </Col>
      <Col xs={24} className="text-center">
        <Button
          className="bg-success px-5"
          onClick={() => {
            setVisibility(false);
          }}
        >
          Ok
        </Button>
      </Col>
    </Row>
  </DepoModal>
);

export default SlippageModal;
