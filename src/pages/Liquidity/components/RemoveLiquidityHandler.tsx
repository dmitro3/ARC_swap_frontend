/* eslint-disable no-eval */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import { Slider, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import BigNumber from 'bignumber.js';
import sliderMarkOptions from '../../../utility/slider-options';
import { PoolToken, SubgraphPair } from '../../../interfaces/Subgraphs';
import { IPoolDetails } from '../../../interfaces/IPoolDetails';
import tokenFactory from '../../../utility/token-factory';

const RemoveLiquidityHandler: React.FC<{
  content: SubgraphPair;
  onConfirm?: (amount0: string, amount1: string, tokenAmount: string) => void;
  onRequestAllowance?: (token: PoolToken) => void;
  variant?: 'success' | 'danger';
  poolTokenAllowance: string;
  poolTokenLoading?: boolean;
  poolDetails: IPoolDetails;
}> = ({
  content,
  onConfirm,
  variant = 'success',
  poolTokenAllowance = '0',
  poolTokenLoading,
  poolDetails,
  onRequestAllowance,
}) => {
  const [amount0, setAmount0] = useState('0');
  const [amount1, setAmount1] = useState('0');

  const [maxAmount0, setMaxAmount0] = useState(+poolDetails?.token0Balance);
  const [maxAmount1, setMaxAmount1] = useState(+poolDetails.token1Balance);

  const [tokenAmount, setTokenAmount] = useState('0');

  const price0 = +content.token1Price;
  const price1 = +content.token0Price;

  const minAmount = 0.006;

  const isButtonEnabled = () => +amount0 > minAmount && +amount1 > minAmount;

  const requestAllowance = (token: PoolToken) => {
    if (onRequestAllowance) {
      onRequestAllowance(token);
    }
  };

  const getPoolShare = (amountToRemove: string) => {
    const ratio = new BigNumber(amountToRemove).dividedBy(
      poolDetails.poolTokenBalance,
    );
    const token0Amount = ratio.times(poolDetails.token0Balance);
    const token1Amount = ratio.times(poolDetails.token1Balance);
    setAmount0(token0Amount.toFixed(8));
    setAmount1(token1Amount.toFixed(8));
  };

  useEffect(() => {
    getPoolShare(tokenAmount);
  }, [tokenAmount]);

  /**
   * Renders the allowance buttons to add liquidity
   */
  const renderAllowanceButtons = (
    <>
      {+poolTokenAllowance < +tokenAmount && (
        <Button
          disabled={poolTokenLoading}
          onClick={() => {
            requestAllowance(tokenFactory(content.id));
          }}
          className={`btn-depo ${
            !poolTokenLoading ? 'bg-success' : 'bg-secondary'
          } mx-1`}
        >
          {poolTokenLoading ? (
            <>
              <LoadingOutlined /> Waiting Allowance
            </>
          ) : (
            <>Allow LP Token</>
          )}
        </Button>
      )}
    </>
  );

  return (
    <div className="bg-light-alpha-10 rounded-bottom rounded-top-right p-3">
      <div className="depo__token-balance w-100 ">
        <div className="d-flex justify-between available-liquidity">
          <div>
            <p className="m-0">{content.token0.symbol} balance:</p>
            <p className="m-0">{poolDetails.token0Balance}</p>
          </div>
          <div className="depo__input input-dark input-remove d-flex justify-between align-center rounded">
            <input
              className="rounded-lg depo__text-input"
              type="number"
              step="0.001"
              min={minAmount * 2}
              // max={maxAmount0}
              value={amount0}
              readOnly
            />
            {content.token0.symbol}
          </div>
        </div>
      </div>
      <div className="depo__token-balance w-100 pt-3">
        <div className="d-flex justify-between available-liquidity">
          <div>
            <p className="m-0">{content.token1.symbol} balance:</p>
            <p className="m-0">{poolDetails.token1Balance}</p>
          </div>
          <div className="depo__input input-dark input-remove d-flex justify-between align-center rounded">
            <input
              className="rounded-lg depo__text-input"
              type="number"
              step="0.001"
              min={minAmount * 2}
              // max={maxAmount1}
              value={amount1}
              readOnly
            />
            {content.token1.symbol}
          </div>
        </div>
        <div className="px-5 pt-4">
          <Slider
            marks={sliderMarkOptions(99.8)}
            className={
              variant === 'success'
                ? 'depo__slider'
                : 'depo__slider-props--Sell'
            }
            onChange={($e) => {
              const poolTokens = ($e / 100) * +poolDetails.poolTokenBalance;
              setTokenAmount(new BigNumber(poolTokens).toFixed(18));
            }}
          />
        </div>
      </div>
      <div className="text-center w-100 mt-4">
        {renderAllowanceButtons}
        {+poolTokenAllowance >= +tokenAmount && (
          <Button
            className={`btn-depo ${
              isButtonEnabled() ? 'bg-danger' : 'bg-pool-secondary'
            } mx-1`}
            disabled={!isButtonEnabled()}
            onClick={() => {
              if (onConfirm) onConfirm(amount0, amount1, tokenAmount);
            }}
          >
            Remove Liquidity
          </Button>
        )}
      </div>
    </div>
  );
};

export default RemoveLiquidityHandler;
