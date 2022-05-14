import styled from 'styled-components';

export const SwapContainer = styled.div`
  padding-bottom: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
`;

export const SwapBody = styled.div`
  max-width: 468px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px 8px;
  position: relative;
  background: rgb(18, 18, 18);
`;

export const SwapSettingIcons = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SwapGroup = styled.div`
  display: flex;
  justify-content: flex-end;

  .ant-radio-group {
    background-color: transparent !important;
    justify-content: flex-start !important;
    height: auto !important;

    .ant-radio-button-wrapper {
      background-color: #1a1a1a !important;
      border: none !important;
      border-radius: 0 !important;
      font-size: 12px !important;
      font-weight: 400 !important;
      padding: 12px 30px !important;
      height: unset !important;

      &:first-child {
        border-top-left-radius: 6px !important;
        border-bottom-left-radius: 6px !important;
      }
      &:last-child {
        border-top-right-radius: 6px !important;
        border-bottom-right-radius: 6px !important;
      }
      &.ant-radio-button-wrapper-checked {
        background: #007aff !important;
        font-weight: 600 !important;
        border-radius: 6px !important;
      }
      &:before {
        display: none !important;
      }
    }
  }
`;

export default { SwapContainer, SwapBody, SwapSettingIcons, SwapGroup };
