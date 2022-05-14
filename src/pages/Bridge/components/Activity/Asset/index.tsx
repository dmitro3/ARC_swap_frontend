import React from 'react';
import ChainHelper from 'utility/chainlist/ChainHelper';
import styled from 'styled-components';

import { getTokenLogoUrl } from '../../../utils';
import { BridgeLabel } from '../../styles';

const AssetWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const AssetLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 100%;
`;

const AssetAmountWrapper = styled.div`
  margin-left: 8px;
`;

const Asset: React.FC<{
  chainId: number;
  tokenAddress?: string;
  amount: string;
}> = ({ chainId, tokenAddress, amount }) => (
  <AssetWrapper>
    <AssetLogo src={getTokenLogoUrl(tokenAddress)} alt="logo" />
    <AssetAmountWrapper>
      <BridgeLabel fontSize={14} fontWeight={700}>
        {amount}
      </BridgeLabel>
      <BridgeLabel fontSize={12} color="#8d8d8d">
        {ChainHelper.find.byId(chainId)?.chainName}
      </BridgeLabel>
    </AssetAmountWrapper>
  </AssetWrapper>
);

export default Asset;
