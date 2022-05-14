/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/ban-types */
import Modal from 'antd/lib/modal/Modal';
import { Grid } from 'antd';
import React from 'react';
import './style.scss';

interface IDepoModal {
  onClose?: Function;
  open: boolean;
}

const FarmModal: React.FC<IDepoModal> = ({ children, onClose, open }) => {
  const breakpoints = Grid.useBreakpoint();

  return (
    <Modal
      destroyOnClose
      closeIcon={false}
      visible={open}
      className="depo__modal-selector d-flex justify-center depo__ant-modal-mask"
      maskStyle={{
        backgroundColor: breakpoints.lg ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,1)',
      }}
      onCancel={($e) => {
        if (onClose) onClose($e);
      }}
    >
      {children}
    </Modal>
  );
};

export default FarmModal;
