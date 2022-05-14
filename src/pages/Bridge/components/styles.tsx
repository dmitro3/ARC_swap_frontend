import styled from 'styled-components';

export const BridgeContainer = styled.div`
  padding-top: 56px;
  padding-bottom: 24px;
  position: relative;
  display: flex;
`;

export const BridgeBody = styled.div`
  max-width: 468px;
  position: relative;
  background: #121212;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;

  &:after {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: 1px;
    background: linear-gradient(
      180deg,
      rgba(196, 196, 196, 1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    z-index: -1;
    border-radius: 10px;
  }
`;

export const BridgeLabel = styled.p<{
  fontWeight?: number;
  fontSize?: number;
  color?: string;
}>`
  color: ${(props) => props.color || '#fff'};
  font-weight: ${(props) => props.fontWeight || 400};
  font-size: ${(props) => props.fontSize || 16}px;
  line-height: 160%;
  margin: 0;
`;

export const BridgeInputWrapper = styled.div`
  padding: 16px;
  background: #1e1e1e;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.14), 0px 1px 18px rgba(0, 0, 0, 0.12),
    0px 3px 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    top: 4px;
    left: 1px;
    right: -4px;
    bottom: -4px;
    background: #007aff;
    z-index: -1;
    border-radius: 10px;
  }
`;

export const BridgeTokenWrapper = styled.div`
  display: flex;
`;

export const BridgeAmountInput = styled.input`
  flex: 1;
  background: none;
  outline: 0;
  border: none;
  border-bottom: 1px solid #353535;
  text-align: right;
`;

export const BridgeInfoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  color: #8d8d8d;
  padding-top: 16px;
`;

export const BridgeTransactions = styled.div`
  padding: 32px;
  position: relative;
  background: #121212;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  flex: 1;

  .ant-table-thead > tr > th {
    background: transparent !important;
    padding-bottom: 24px;
    border-bottom: none !important;
  }

  .ant-table-tbody > tr > td {
    border-bottom: none !important;
    border-top: 1px solid rgb(54, 54, 54) !important;
    padding: 20px 0;
  }

  .ant-pagination-item {
    background: transparent !important;
    border: 0 !important;
    a {
      color: #fff;
    }
  }
  .ant-pagination-item-active {
    a {
      color: #007aff !important;
    }
  }

  &:after {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: 1px;
    background: linear-gradient(
      180deg,
      rgba(196, 196, 196, 1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    z-index: -1;
    border-radius: 10px;
  }
`;
