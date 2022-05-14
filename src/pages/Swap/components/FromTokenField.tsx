/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/ban-types */
import React, { useState } from 'react';
import { SwapOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import TokenSelector from '../../../components/TokenSelector';
import { IToken } from '../../../interfaces/IToken';
import escapeRegExp from '../../../utility';
import SelectTokenModal from './SelectTokenModal';
import RefreshIcon from '../../../assets/refresh-icon.svg';

const FromTokenField: React.FC<{
  selectedTokens: { from: IToken; to?: IToken };
  currentSelecting: Function;
  fromTokenAmount: string;
  balanceAmount: number;
  fromTokenPrice: number;
  setFromTokenAmount: Function;
  switchTokens: Function;
  onSelect: (token: IToken) => void;
  disabled: boolean;
}> = ({
  selectedTokens,
  currentSelecting,
  fromTokenAmount,
  balanceAmount,
  fromTokenPrice,
  setFromTokenAmount,
  switchTokens,
  onSelect,
  disabled = false,
}) => {
  const [selectTokenModal, setSelectTokenModal] = useState(false);
  const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      setFromTokenAmount(nextUserInput);
    }
  };
  const setMax = () => {
    setFromTokenAmount(balanceAmount);
  };

  const handleOnClick = () => {
    if (selectedTokens.from && selectedTokens.to) switchTokens();
  };
  return (
    <>
      <div
        className="depo__swap-body position-relative p-3"
        style={{ backgroundColor: '#1E1E1E', borderRadius: 10 }}
      >
        <div
          className="d-flex pb-2"
          style={{ border: '1px solid #2c2c2c', borderWidth: '0 0 1px 0' }}
        >
          <TokenSelector
            token={selectedTokens.from}
            onClick={() => {
              if (!selectTokenModal) setSelectTokenModal(true);
              currentSelecting('from');
            }}
          />
          <input
            value={fromTokenAmount}
            placeholder="0.0"
            className="depo__text-input text-right"
            type="text"
            pattern="^[0-9]*[.,]?[0-9]*$"
            disabled={disabled}
            onChange={($e) => {
              enforcer($e.target.value.replace(/,/g, '.'));
            }}
            autoComplete="off"
            autoCorrect="off"
          />
          <Button className="btn-max" type="link" onClick={setMax}>
            Max
          </Button>
        </div>
        <div
          className="d-flex justify-content-between mt-2"
          style={{ color: '#8D8D8D' }}
        >
          <p>USD Value</p>
          <p>${(fromTokenPrice * +fromTokenAmount).toFixed(3)}</p>
        </div>
        <div className="refresh-icon position-absolute bg-swap-success rounded text-center d-flex justify-center align-center pointer deft mt-1">
          <Button onClick={handleOnClick} style={{ background: 'transparent' }}>
            <img
              src={RefreshIcon}
              className="text-dark"
              style={{ filter: 'brightness(1) invert(0)' }}
              width="16px"
              height="16px"
              alt="refresh"
            />
          </Button>
          {/* <SwapOutlined
            style={{ transform: 'rotate(90deg)' }}
            className="text-dark"
            onClick={() => {
              if (selectedTokens.from && selectedTokens.to) switchTokens();
            }}
          /> */}
        </div>
      </div>
      {/* Select price for swap */}
      <SelectTokenModal
        visible={selectTokenModal}
        onSelect={($e: IToken) => {
          onSelect($e);
          setSelectTokenModal(false);
        }}
        onClose={() => {
          setSelectTokenModal(false);
        }}
      />
    </>
  );
};
export default FromTokenField;
