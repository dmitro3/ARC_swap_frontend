import React, { useState, useContext, useEffect } from 'react';
import { Select } from 'antd';

import { SwapConfig, swapConfig } from '../../config';
import { BridgeContext } from '../../context/bridgeContext';
import { getTokenLogoUrl } from '../../utils';

import './style.scss';

const TokenSelector: React.FC<{ type: string }> = ({ type }) => {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0);
  const {
    setSendingAssetId,
    setReceivingAssetId,
    sendingChainId,
    receivingChainId,
    setAmount,
  } = useContext(BridgeContext);

  useEffect(() => {
    if (type === 'from') {
      setSendingAssetId(swapConfig[selectedTokenIndex].assets[sendingChainId]);
    } else {
      setReceivingAssetId(
        swapConfig[selectedTokenIndex].assets[receivingChainId],
      );
    }
  }, [selectedTokenIndex, sendingChainId, receivingChainId]);

  const chainId = type === 'from' ? sendingChainId : receivingChainId;

  return (
    <div className="depo__bridge-token-selector d-flex">
      <Select
        className="text-white ant-select-customize-input"
        dropdownClassName="depo__bridge-token-selector-dropdown"
        value={selectedTokenIndex}
        onChange={(value) => {
          setSelectedTokenIndex(value);
          setAmount('');
        }}
      >
        {swapConfig
          .filter((s) => !!s.assets[chainId])
          .map((s: SwapConfig) => (
            <Select.Option
              value={s.index}
              className="selectOptions"
              key={s.name}
            >
              <img
                src={getTokenLogoUrl(s.assets[1])}
                alt={s.name}
                height={20}
                className="mr-2"
              />
              {s.name}
            </Select.Option>
          ))}
      </Select>
    </div>
  );
};

export default TokenSelector;
