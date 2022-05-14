/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { FaChevronLeft } from 'react-icons/fa';

const BackButton: React.FC<{
  onBack?: () => void;
  className?: string;
  showBackTitle?: boolean;
  backTitle?: string;
}> = ({ onBack, className, showBackTitle = false, backTitle = 'Back' }) => (
  <div
    className={`${className} depo__back-button pointer d-flex align-center`}
    onClick={() => onBack && onBack()}
  >
    <FaChevronLeft className="mr-2" /> {showBackTitle && backTitle}
  </div>
);

export default BackButton;
