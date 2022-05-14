/* eslint-disable @typescript-eslint/ban-types */
import React, { useState } from 'react';
import TokenSelector from '../../../components/TokenSelector';
import { IToken } from '../../../interfaces/IToken';
import SelectTokenModal from './SelectTokenModal';
import Loading from '../../../components/Loading/Loading';

const ToTokenField: React.FC<{
  selectedTokens: { from: IToken; to?: IToken };
  currentSelecting: Function;
  toTokenAmount: string;
  balanceAmount: number;
  loading: boolean;
  onSelect: (token: IToken) => void;
}> = ({
  selectedTokens,
  currentSelecting,
  toTokenAmount,
  balanceAmount,
  onSelect,
  loading = false,
}) => {
  const [selectTokenModal, setSelectTokenModal] = useState(false);
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
            token={selectedTokens.to}
            onClick={() => {
              currentSelecting('to');
              if (!selectTokenModal) setSelectTokenModal(true);
            }}
          />
          <input
            value={Number(toTokenAmount).toFixed(3)}
            type="number"
            step="0.001"
            min={0}
            className="depo__text-input text-right"
            onChange={($e) => {
              Number($e.target.value).toFixed(3);
            }}
          />
        </div>
        <div
          className="d-flex justify-content-between mt-2"
          style={{ color: '#8D8D8D' }}
        >
          <p>Balance</p>
          <p>{balanceAmount.toFixed(3)}</p>
        </div>
      </div>
      <Loading show={loading} className="rounded-lg" />
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

export default ToTokenField;
