/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';
import { AvailableTokens } from '../../../components/AvailableTokens/AvailableTokens';
import DepoModal from '../../../components/DepoModal/DepoModal';
import { IToken } from '../../../interfaces/IToken';

const AvailableTokensModal: React.FC<{
  visible: boolean;
  setVisibility: (visible: boolean) => void;
  onSelect: Function;
}> = ({ visible, setVisibility, onSelect }) => (
  <DepoModal
    open={visible}
    onClose={() => {
      setVisibility(false);
    }}
  >
    <AvailableTokens
      onSelect={($e: IToken) => {
        setVisibility(false);
        onSelect($e);
      }}
      visible
      setVisibility={setVisibility}
    />
  </DepoModal>
);

export default AvailableTokensModal;
