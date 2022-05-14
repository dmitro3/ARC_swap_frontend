/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Button } from 'antd';
import DepoModal from '../DepoModal/DepoModal';

const ModalAlert = ({ open, message, onCancel, onOk }: any) => (
  <DepoModal open={open}>
    <div className="bg-lightgrey rounded px-3 py-4">
      <h4 className="text-danger">Warning!</h4>
      <p className="text-secondary">{message}</p>
      <div className="d-flex justify-right">
        <Button className="bg-danger" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="bg-success ml-3" onClick={onOk}>
          I'm aware
        </Button>
      </div>
    </div>
  </DepoModal>
);

export default ModalAlert;
