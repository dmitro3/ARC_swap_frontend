import React from 'react';
import { BridgeLabel } from '../../styles';

const Time: React.FC<{ preparedAt: number }> = ({ preparedAt }) => {
  const date = new Date(preparedAt * 1000);
  return (
    <div>
      <BridgeLabel fontSize={14} fontWeight={700}>
        {date.toLocaleDateString('en-US', { timeZone: 'UTC' })}
      </BridgeLabel>
      <BridgeLabel fontSize={12} color="#8d8d8d">
        {date.toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          timeZoneName: 'short',
        })}
      </BridgeLabel>
    </div>
  );
};
export default Time;
