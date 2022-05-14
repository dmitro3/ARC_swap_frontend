/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import { Slider, Button } from 'antd';
import sliderMarkOptions from '../../../utility/slider-options';
import { PoolToken, SubgraphPair } from '../../../interfaces/Subgraphs';
import AllowTokenButton from './AllowTokenButton';

const AddLiquidityHandler: React.FC<{
  content: SubgraphPair;
  onConfirm?: (amount0: string, amount1: string) => void;
  onRequestAllowance?: (token: PoolToken) => void;
  variant?: 'success' | 'danger';
  balance0?: string;
  balance1: string;
  token0Allowance?: string;
  token1Allowance?: string;
  token0Loading?: boolean;
  token1Loading?: boolean;
}> = ({
  content,
  onConfirm,
  variant = 'success',
  balance0 = '0',
  balance1 = '0',
  token0Allowance = '0',
  token1Allowance = '0',
  onRequestAllowance,
  // Trust me, this is being used
  token0Loading = false,
  token1Loading = false,
}) => {
  const [amount0, setAmount0] = useState('0');
  const [amount1, setAmount1] = useState('0');

  // const [maxAmount0, setMaxAmount0] = useState(+balance0);
  // const [maxAmount1, setMaxAmount1] = useState(+balance1);

  const price0 = +content.token1Price;
  const price1 = +content.token0Price;

  const minAmount = 0;

  /**
   * Configure max amount of tokens the user will be able to share with the pool
   * based on his set o balances.
   */
  // const setMaxAmounts = () => {
  //   // Get which balance is greater in fiat value
  //   const balanceWorth0 = +balance0 * price0;
  //   const balanceWorth1 = +balance1 * price1;
  //   // Then we calculate the diff factor between prices
  //   const priceFactor = price1 > price0 ? price0 / price1 : price1 / price0;
  //   // If balance0 has more fiat value, then
  //   if (balanceWorth0 > balanceWorth1) {
  //     // Divide balance1 by the price factor, to get the amount of tokens
  //     const maxAmountOfToken0 = (+balance0 / priceFactor) * price1;
  //     setMaxAmount0(maxAmountOfToken0);
  //     setMaxAmount1(+balance1);
  //   } else {
  //     // If balance1 has more fiat value, then
  //     // divide balance 0 by the price factor, to get the amount of tokens
  //     const maxAmountOfToken1 = (+balance1 / priceFactor) * price0;
  //     setMaxAmount0(+balance0);
  //     setMaxAmount1(maxAmountOfToken1);
  //   }
  // };

  // useEffect(() => {
  //   setMaxAmounts();
  // }, [balance0, balance1]);

  const setToken0Amount = (amount: string) => {
    setAmount0(amount);
    setAmount1((+amount * price0).toFixed(6));
  };

  const setToken1Amount = (amount: string) => {
    setAmount1(amount);
    setAmount0((+amount * price1).toFixed(6));
  };

  const isButtonEnabled = () =>
    +amount0 > minAmount &&
    +amount0 <= +balance0 &&
    +amount1 > minAmount &&
    +amount1 <= +balance1;

  const requestAllowance = (token: PoolToken) => {
    if (onRequestAllowance) {
      onRequestAllowance(token);
    }
  };

  return (
    <div className="bg-light-alpha-10 rounded-bottom rounded-top-right p-3">
      <div className="depo__token-balance w-100 ">
        <div className="d-flex justify-between available-liquidity">
          <div>
            <p className="m-0">{content.token0.symbol} balance:</p>
            <p className="m-0">{(+balance0).toFixed(2)}</p>
          </div>
          <div className="depo__input input-dark input-add d-flex justify-between align-center rounded">
            <input
              type="number"
              value={amount0}
              onChange={($e) => setToken0Amount($e.target.value)}
            />
            {content.token0.symbol}
          </div>
        </div>
      </div>
      <div className="depo__token-balance w-100 pt-3">
        <div className="d-flex justify-between available-liquidity">
          <div>
            <p className="m-0">{content.token1.symbol} balance:</p>
            <p className="m-0">{(+balance1).toFixed(2)}</p>
          </div>
          <div className="depo__input input-dark input-add d-flex justify-between align-center rounded">
            <input
              type="number"
              value={amount1}
              onChange={($e) => setToken1Amount($e.target.value)}
            />
            {content.token1.symbol}
          </div>
        </div>
        <div className="px-5 pt-4 pb-1">
          <Slider
            marks={sliderMarkOptions(99.8)}
            className={
              variant === 'success'
                ? 'depo__slider'
                : 'depo__slider-props--Sell'
            }
            onChange={($e) => {
              const amount0 = (+balance0 * ($e / 100)).toFixed(6);
              setToken0Amount(amount0);
            }}
          />
        </div>
      </div>
      <div className="text-center w-100 mt-2">
        {+token0Allowance <= +amount0 && (
          <AllowTokenButton
            loading={token0Loading}
            token={content['token0']}
            onClick={() => requestAllowance(content['token0'])}
          />
        )}
        {+token1Allowance <= +amount1 && (
          <AllowTokenButton
            loading={token1Loading}
            token={content['token1']}
            onClick={() => requestAllowance(content['token1'])}
          />
        )}
        {+token0Allowance > +amount0 && +token1Allowance > +amount1 && (
          <Button
            className={`btn-depo ${
              isButtonEnabled() ? 'bg-success' : 'bg-secondary'
            } mx-1`}
            disabled={!isButtonEnabled()}
            onClick={() => {
              if (onConfirm) onConfirm(amount0, amount1);
            }}
          >
            {(+amount0 === 0 || +amount1 === 0) && 'Enter amount'
              ? 'Enter amount'
              : +amount0 > +balance0
              ? `Insufficient ${content['token0'].symbol} balance`
              : +amount1 > +balance1
              ? `Insufficient ${content['token1'].symbol} balance`
              : 'Add Liquidity'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddLiquidityHandler;
