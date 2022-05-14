import React from 'react';
import { Button, Typography } from 'antd';
import DepoModal from 'components/DepoModal/DepoModal';

import tokenAdded from 'assets/icons/tokenAdded.gif';
import openLinkSvg from 'assets/openlink.svg';
import closeImg from 'assets/close.svg';

const ConfirmModal: React.FC<{
  visible: boolean;
  symbol: String;
  onClose: () => void;
  toEtherscan: Function;
}> = ({ visible, symbol, onClose, toEtherscan }) => {
  const onCloseHandler = () => {
    onClose();
  };

  const handleEtherScan = () => {
    toEtherscan();
    onClose();
  };

  return (
    <DepoModal open={visible} onClose={onClose}>
      <div
        className="depo__fulfill-modal bg-darkgrey rounded"
        id="importTokenConfirm"
      >
        <Button
          type="link"
          className="btn-close mt-4 mr-4"
          onClick={onCloseHandler}
        >
          <img src={closeImg} alt="down-arrow" />
        </Button>
        <div className="depo__token-import-confirm p-4">
          <Typography
            className="text-center"
            style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: '30px' }}
          >
            Token added
          </Typography>
          <div className="depo__token-import-success">
            <div style={{ padding: '48px' }}>
              <img
                src={tokenAdded}
                alt="Token Added"
                width="204px"
                height="204px"
              />
            </div>
            <div>You have successfully added and approved {symbol}</div>
            <Button
              className="btn-depo bg-swap-success btn-md rounded-sm"
              block
              onClick={handleEtherScan}
            >
              View on Etherscan
              <img src={openLinkSvg} alt="Open Link" />
            </Button>
          </div>
        </div>
      </div>
    </DepoModal>
  );
};

export default ConfirmModal;
