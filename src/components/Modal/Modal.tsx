import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ModalProps } from '../../interfaces/IModal';
import './styles.scss';

const ModalComponent = ({
  message,
  okText,
  cancelText,
  showModal,
  closeModal,
  handleConfirm,
}: ModalProps): JSX.Element => (
  <Modal
    visible={showModal}
    okText={okText}
    okType="danger"
    cancelText={cancelText}
    centered
    className="modal"
    onCancel={closeModal}
    onOk={handleConfirm}
  >
    <ExclamationCircleOutlined className="icon" />
    <p>{message}</p>
  </Modal>
);

export default ModalComponent;
