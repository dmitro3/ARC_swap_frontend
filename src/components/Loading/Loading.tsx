/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import './style.scss';

const Loading: React.FC<{ show: boolean; className?: string }> = ({
  show = false,
  className,
}) => (
  <>
    {show && (
      <div
        className={`depo__loading-icon text-center d-flex justify-center align-center ${className}`}
      >
        <LoadingOutlined />
      </div>
    )}
  </>
);

export default Loading;
