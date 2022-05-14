/* eslint-disable */
import React, { createContext, useContext, useState } from 'react';

interface BridgeContextState {
  sendingChainId: number;
  setSendingChainId: Function;
  sendingAssetId: string;
  setSendingAssetId: Function;
  receivingChainId: number;
  setReceivingChainId: Function;
  receivingAssetId: string;
  setReceivingAssetId: Function;
  amount: string;
  setAmount: Function;
}

export const BridgeContext = createContext<BridgeContextState>(
  {} as BridgeContextState,
);

const BridgeProvider: React.FC = ({ children }) => {
  const [sendingChainId, setSendingChainId] = useState<number>(1);
  const [sendingAssetId, setSendingAssetId] = useState<string>('');
  const [receivingChainId, setReceivingChainId] = useState<number>(1);
  const [receivingAssetId, setReceivingAssetId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  return (
    <BridgeContext.Provider
      value={{
        sendingChainId,
        setSendingChainId,
        sendingAssetId,
        setSendingAssetId,
        receivingChainId,
        setReceivingChainId,
        receivingAssetId,
        setReceivingAssetId,
        amount,
        setAmount,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export default BridgeProvider;
