/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';
import DepoModal from '../../../components/DepoModal/DepoModal';
import { IProtocol } from '../../../interfaces/IProtocol';
import { ListProtocol } from '../../../components/ListProtocol/ListProtocol';

const AvailableProtocolsModal: React.FC<{
  visible: boolean;
  setVisibility: Function;
  onSelect: Function;
}> = ({ visible, setVisibility, onSelect }) => (
  <DepoModal
    open={visible}
    onClose={() => {
      setVisibility(false);
    }}
  >
    <ListProtocol
      onSelect={($e: IProtocol) => {
        setVisibility(false);
        onSelect($e);
      }}
    />
  </DepoModal>
);

export default AvailableProtocolsModal;
