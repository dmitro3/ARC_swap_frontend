import React, { useState, useEffect, useContext } from 'react';
import { Select } from 'antd';

import ETH from 'assets/tokens/eth.png';
import BNB from 'assets/tokens/bnb.png';
import MATIC from 'assets/tokens/matic.png';

import ChainHelper from 'utility/chainlist/ChainHelper';

import { BridgeContext } from '../../context/bridgeContext';

import './style.scss';

const ChainSelector: React.FC<{ type: string }> = ({ type }) => {
  const chainlist = ChainHelper.getBridgeChains();
  const [selectedChainId, setSelectedChainId] = useState<string>('0x1');

  const { setSendingChainId, setReceivingChainId, setAmount } =
    useContext(BridgeContext);

  const tokenImages: any = {
    '0x1': ETH,
    '0x38': BNB,
    '0x89': MATIC,
  };

  const getNetworkTokenImg = (hexChainId: string) =>
    tokenImages[hexChainId] ?? tokenImages['0x1'];

  useEffect(() => {
    if (type === 'from') {
      setSendingChainId(+selectedChainId);
    } else {
      setReceivingChainId(+selectedChainId);
    }
  }, [selectedChainId]);

  return (
    <div className="depo__chain-selector d-flex">
      <Select
        className="text-white ant-select-customize-input"
        dropdownClassName="depo__chain-selector-dropdown"
        value={selectedChainId}
        onChange={(value: any) => {
          setSelectedChainId(value);
          setAmount('');
        }}
      >
        {chainlist.map((chain) => (
          <Select.Option
            value={chain.chainId}
            className="selectOptions"
            key={chain.chainId}
          >
            <img
              src={getNetworkTokenImg(chain.chainId)}
              alt={chain.nativeCurrency.name}
              height={20}
              className="mr-2"
            />
            {chain.chainName}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ChainSelector;
