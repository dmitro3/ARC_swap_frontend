import { HistoricalTransactionStatus } from '@connext/nxtp-sdk';
import React from 'react';
import styled from 'styled-components';
import { BridgeLabel } from '../../styles';

const SuccessBadge = styled.span`
  padding: 4px 8px;
  border: 1px solid #007aff;
  box-sizing: border-box;
  border-radius: 16px;
  color: #7ee57a;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
`;

const FailBadge = styled.span`
  padding: 4px 8px;
  border: 1px solid #007aff;
  box-sizing: border-box;
  border-radius: 16px;
  color: #7ee57a;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
`;

const Status: React.FC<{ status: string; expiry?: number }> = ({
  status,
  expiry,
}) => {
  if (status === HistoricalTransactionStatus.FULFILLED) {
    return <SuccessBadge>Successful</SuccessBadge>;
  }
  if (status === HistoricalTransactionStatus.CANCELLED) {
    return <FailBadge>Cancelled</FailBadge>;
  }
  if (expiry) {
    if (expiry <= Date.now() / 1000) {
      return <FailBadge>Expired</FailBadge>;
    }
    return (
      <>
        <BridgeLabel fontSize={14} fontWeight={700}>
          Expires
        </BridgeLabel>
        <BridgeLabel fontSize={12} color="#8d8d8d">
          {((expiry - Date.now() / 1000) / 3600).toFixed(2)} hours
        </BridgeLabel>
      </>
    );
  }
  return null;
};

export default Status;
