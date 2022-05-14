export interface ModalProps {
  showModal: boolean;
  message?: string;
  okText?: string;
  cancelText?: string;
  closeModal(): void;
  handleConfirm(): void;
}
