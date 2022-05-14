/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable arrow-body-style */
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IToken } from '../interfaces/IToken';
import './TokenSelector.scss';
import { IProtocol } from '../interfaces/IProtocol';

import ChevronDownIcon from '../assets/chevron-down.svg';

const TokenSelector: React.FC<{
  onClick: Function;
  token?: IToken | IProtocol;
  type?: 'token' | 'protocol';
}> = ({ children, onClick, token, type = 'token' }) => {
  /**
   * Checks if the selector is for the token or protocol types and return a null option text.
   * @returns the preferred text to show on nulls
   */
  const selectorText = () => {
    switch (type) {
      case 'token':
        return token?.symbol ?? 'Select a token';
      case 'protocol':
        return token?.title ?? 'Best trade';
      default:
        return 'Invalid type';
    }
  };

  const getTokenLogo = () => {
    if (token) {
      return token.logoURI;
    }

    return '';
  };

  return (
    <div
      style={{ flex: 'none' }}
      className={`depo__${type}-selector d-flex align-items-center pointer position-relative`}
      onClick={() => onClick()}
    >
      {type === 'token' && token && (
        <div className="mr-2">
          <img
            src={getTokenLogo()}
            width={24}
            height={24}
            style={{
              border: '1px solid transparent',
              borderRadius: '100%',
            }}
          />
        </div>
      )}
      <div className="d-flex align-items-center position-relative w-100">
        <span className="depo__selector-text">{selectorText()}</span>
        <img src={ChevronDownIcon} alt="down" />
      </div>
      {children}
    </div>
  );
};
export default TokenSelector;
