import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  Select,
  Row,
  Col,
  Input,
  Slider,
  Button as ButtonAnt,
  Radio,
  Form,
  RadioChangeEvent,
} from 'antd';
import { SelectValue } from 'antd/lib/select';
import sliderMarkOptions from '../../utility/slider-options';
import getTradingPair from '../../utility/getTradingPair';
import { AuthContext } from '../../contexts/AuthProvider';
import { PlaceOrderProps } from '../../interfaces/IPlaceOrder';
import Notification from '../Notification/Notification';

import BinanceLogo from '../../assets/binance.svg';
import FTXLogo from '../../assets/ftx.svg';
import HuobiLogo from '../../assets/huobi.svg';
import KucoinLogo from '../../assets/kucoin.svg';

import Loading from '../Loading/Loading';
import { DepoAPISevice } from '../../services/DepoAPIService';

import './styles.scss';
import { IOrder } from '../../interfaces/IOrder';
import { IUser } from '../../interfaces/IUser';
import removeScientificNotation from '../../utility/removeScientificNotation';

const { Group, Button } = Radio;
const { Option } = Select;

const allExchanges = [
  {
    id: 'binance',
    name: 'Binance',
  },
  {
    id: 'ftx',
    name: 'FTX',
  },
  {
    id: 'huobi',
    name: 'Huobi',
  },
  {
    id: 'kucoin',
    name: 'Kucoin',
  },
  {
    id: 'gate.io',
    name: 'Gate.io',
  },
];

const marketOrders = [
  {
    id: 1,
    order: 'Limit',
  },
  {
    id: 2,
    order: 'Market',
  },
  // {
  //   id: 3,
  //   order: 'Stop',
  // },
];

const OfferTypes = {
  BUY: 'Buy',
  SELL: 'Sell',
};

interface SelectProps {
  id: string;
  name: string;
}

interface FormValues {
  exchangeSelected: string;
  sizeBuy?: string;
  priceBuy?: number;
  sizeSell?: string;
  priceSell?: number;
}

interface Response {
  data?: any;
  status: string;
  'err-msg': string;
  error?: string;
  code?: any;
  msg: string;
}

const allTypes = [OfferTypes.BUY, OfferTypes.SELL];

const PlaceOrderFuture: React.FC<PlaceOrderProps> = ({
  symbolSelected,
  handleCompareExchanges,
  handleNewOrder,
  marketType,
  cancelOrdersLoading,
}: PlaceOrderProps) => {
  const {
    user,
    setSymbols,
    symbols,
    setUniqueSymbols,
    setWalletAvailableValue,
    exchangesAvaiableBalance,
  } = useContext(AuthContext);

  const [sliderBuyPercent, setSliderBuyPercent] = useState(0);
  const [sliderSellPercent, setSliderSellPercent] = useState(0);
  const [selectedMarketOrder, setSelectedMarketOrder] = useState<string>(
    marketOrders[0].order,
  );
  const [baseResult, setBaseResult] = useState<string>();
  const [quoteResult, setQuoteResult] = useState<string>();
  const [selectValues, setSelectValues] = useState<SelectProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockContent, setBlockContent] = useState(false);
  const [amountQuote, setAmountQuote] = useState(0);
  const [amountBase, setAmountBase] = useState(0);
  const [exchangesWithSymbol, setExchangesWithSymbol] = useState<any[]>([]);
  const [allSymbolValue, setAllSymbolValue] = useState<any[]>([]);
  const [marketLimits, setMarketLimits] = useState<any[]>([]);
  const [marketSelected, setMarketSelected] = useState<any>({});
  const [priceValue, setPriceValue] = useState(0);
  const [minimumSize, setMinimumSize] = useState(0);
  const [totalBuy, setTotalBuy] = useState<string | number>(0);
  const [totalSell, setTotalSell] = useState<string | number>(0);
  const [form] = Form.useForm();

  const handleAllSymbolValue = async () => {
    setLoading(true);
    try {
      const type = marketType;
      const response = await DepoAPISevice.getSymbolAllExchanges(
        type,
        symbolSelected,
      );
      setAllSymbolValue(response);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const checkCompareIsDisable = (offerType: string) => {
    const buySide = form.getFieldsValue(['sizeBuy', 'priceBuy']);
    const sellSide = form.getFieldsValue(['sizeSell', 'priceSell']);

    if (offerType === 'Buy') {
      return !(buySide.sizeBuy && buySide.priceBuy);
    }

    return !(sellSide.sizeSell && sellSide.priceSell);
  };

  const handleCompareCexButton = (offerType: string) => {
    // maker = buy / taker = sell
    const symbolToCompare = symbolSelected.replace('/', '-');
    const type = offerType === 'Buy' ? 'maker' : 'taker';
    const orderInfo =
      offerType === 'Buy'
        ? form.getFieldsValue(['sizeBuy', 'priceBuy'])
        : form.getFieldsValue(['sizeSell', 'priceSell']);
    const userPriceUnit =
      offerType === 'Buy' ? orderInfo.priceBuy : orderInfo.priceSell;
    const userSize =
      offerType === 'Buy' ? orderInfo.sizeBuy : orderInfo.sizeSell;

    return handleCompareExchanges(
      symbolToCompare,
      type,
      userPriceUnit,
      userSize,
    );
  };

  const getMarketsInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await DepoAPISevice.getAllMarketsBySymbol(
        symbolSelected,
        marketType,
      );
      setMarketLimits(response.allExchangesMarkets);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }, [symbols]);

  const userCexBalance = useCallback(async () => {
    setLoading(true);
    try {
      if (user && user.settings?.defaultWallet) {
        const response = await DepoAPISevice.getUserCEXBalance(
          user.settings.defaultWallet,
          marketType,
        );

        if (
          response &&
          response.symbols &&
          response.uniqueSymbols &&
          response.walletValue
        ) {
          setSymbols(response.symbols);
          setUniqueSymbols(response.uniqueSymbols);
          setWalletAvailableValue(response.walletValue.toFixed(2));
        }
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }, [symbols, user]);

  useEffect(() => {
    handleAllSymbolValue();
    getMarketsInfo();
  }, [symbols]);

  useEffect(() => {
    userCexBalance();
  }, [user]);

  useEffect(() => {
    const { base, quote } = getTradingPair(symbolSelected);
    setBaseResult(base);
    setQuoteResult(quote);

    // const symbolWithAmount = symbols.filter(
    //   (e) =>
    //     (e.symbol === quote && e.availableValue > 0) ||
    //     (e.symbol === base && e.availableValue > 0),
    // );

    // if (symbolWithAmount.length) {
    //   const exchangesWithAmount = allExchanges.filter((item: any) =>
    //     symbolWithAmount.some((e) => e.exchange === item.id),
    //   );

    const auxExchanges: any[] = [];
    Object.keys(exchangesAvaiableBalance).forEach(
      // eslint-disable-next-line consistent-return
      (exchange) => {
        if (exchange === 'ftx' && exchangesAvaiableBalance[exchange] > 0)
          return auxExchanges.push({
            id: exchange,
            name: exchange.toUpperCase(),
            balance: exchangesAvaiableBalance[exchange],
          });
      },
    );
    setExchangesWithSymbol(auxExchanges);
    setSelectValues(auxExchanges);
    // if (exchangesWithAmount.length) {
    // }
    // }
  }, [symbols, exchangesAvaiableBalance]);

  const handlePriceExchange = (exchangeName: SelectValue) => {
    setLoading(true);

    if (allSymbolValue) {
      const selectedExchange = allSymbolValue.find(
        (e) => e.exchange === exchangeName,
      );

      if (selectedExchange) {
        setPriceValue(selectedExchange.price);
        form.setFieldsValue({
          priceSell: selectedExchange.price,
          priceBuy: selectedExchange.price,
        });

        if (marketLimits) {
          const marketLimitSelected = marketLimits.find(
            (e) => e.exchange === exchangeName,
          );

          if (marketLimitSelected) {
            setMarketSelected(marketLimitSelected.market);
            setMinimumSize(marketLimitSelected.market.limits.amount.min);
          }
        }
        setBlockContent(false);
      } else {
        setBlockContent(true);

        Notification({
          type: 'warning',
          message: `${exchangeName} doesn't have symbol ${symbolSelected}`,
        });
      }
    }

    if (exchangesWithSymbol) {
      const resultQuote = exchangesWithSymbol.find(
        (item) =>
          item.symbol === quoteResult &&
          item.exchange.toLowerCase() ===
            exchangeName?.toString().toLowerCase(),
      );

      if (resultQuote) {
        setAmountQuote(
          Number(removeScientificNotation(resultQuote.availableValue)),
        );
      } else {
        setAmountQuote(0);
      }

      const resultBase = exchangesWithSymbol.find(
        (item) =>
          item.symbol === baseResult &&
          item.exchange.toLowerCase() ===
            exchangeName?.toString().toLowerCase(),
      );
      if (resultBase) {
        setAmountBase(
          Number(removeScientificNotation(resultBase.availableValue)),
        );
      } else {
        setAmountBase(0);
      }
    }

    form.setFieldsValue({
      sizeBuy: 0,
      sizeSell: 0,
    });

    setSliderBuyPercent(0);
    setSliderSellPercent(0);
    setTotalBuy(0);
    setTotalSell(0);
    setLoading(false);
  };

  const handleTotal = (offerType: string) => {
    let formValues;

    if (offerType === 'Buy') {
      formValues = form.getFieldsValue(['sizeBuy', 'priceBuy']);
      const totalResult = removeScientificNotation(
        formValues.priceBuy * formValues.sizeBuy,
      );
      setTotalBuy(totalResult);
    }
    if (offerType === 'Sell') {
      formValues = form.getFieldsValue(['sizeSell', 'priceSell']);
      const totalResult = removeScientificNotation(
        formValues.priceSell * formValues.sizeSell,
      );
      setTotalSell(totalResult);
    }
  };

  const handleSliderBuy = (amountValue: number, availableValue: number) => {
    const formValues = form.getFieldsValue(['priceBuy']);
    const newSize =
      (availableValue * (amountValue / 100)) / formValues.priceBuy;

    form.setFieldsValue({
      sizeBuy: newSize.toFixed(8),
    });

    handleTotal('Buy');
  };

  const handleSliderSell = (amountValue: number, availableValue: number) => {
    const newSize = (amountValue / 100) * availableValue;

    form.setFieldsValue({
      sizeSell: newSize.toFixed(8),
    });

    handleTotal('Sell');
  };

  const createOrder = async (formValues: FormValues, offerType: string) => {
    setLoading(true);
    const { exchangeSelected, sizeBuy, sizeSell, priceBuy, priceSell } =
      formValues;
    let amount = '';
    let price = 0;
    if (offerType === 'Buy') {
      amount = sizeBuy as string;
      price = priceBuy as number;
    }

    if (offerType === 'Sell') {
      amount = sizeSell as string;
      price = priceSell as number;
    }

    const userDetails = user as IUser;

    const order: IOrder = {
      amount,
      exchangeName: exchangeSelected,
      orderType: selectedMarketOrder,
      offerType,
      price,
      symbolPair: symbolSelected,
      user: userDetails,
    };
    try {
      const response = await DepoAPISevice.sendOrder(
        exchangeSelected,
        marketType,
        order,
      );
      const isString = typeof response === 'string';

      if (
        exchangeSelected === 'kucoin' &&
        response === 'kucoin Order size below the minimum requirement.'
      ) {
        Notification({
          type: 'error',
          message:
            'Your order was denied. Kucoin Order size below the minimum requirement.',
        });
        setLoading(false);
        return;
      }
      if (isString) {
        const errorResult = response.split(exchangeSelected)[1] ?? null;
        const res: Response = JSON.parse(errorResult);

        if (res.code && exchangeSelected === 'binance') {
          if (res.msg.includes('MIN_NOTIONAL') && res.code === -1013) {
            Notification({
              type: 'error',
              message:
                'Your order was denied. The price and size chosen did not cover the exchange fee.',
            });
          } else {
            Notification({
              type: 'error',
              message: res.msg,
            });
          }
        }
        if (res.status === 'error') {
          Notification({
            type: 'error',
            message: res['err-msg'],
          });
        }

        if (res.error) {
          Notification({
            type: 'error',
            message: res.error,
          });
        }
      } else {
        const type = selectedMarketOrder;
        handleNewOrder(response, exchangeSelected, type);
        Notification({
          type: 'success',
          message: 'Order created successfully',
        });

        setSliderBuyPercent(0);
        setSliderSellPercent(0);
        setTotalBuy(0);
        setTotalSell(0);

        form.setFieldsValue({
          sizeBuy: 0,
          sizeSell: 0,
        });

        const newValuesResponse = await DepoAPISevice.getUserCEXBalance(
          user?.wallets?.[0].address as string,
          marketType,
        );

        if (
          newValuesResponse &&
          newValuesResponse.symbols &&
          newValuesResponse.uniqueSymbols &&
          newValuesResponse.walletValue
        ) {
          setSymbols(newValuesResponse.symbols);
          setUniqueSymbols(newValuesResponse.uniqueSymbols);
          setWalletAvailableValue(newValuesResponse.walletValue.toFixed(2));

          const { base, quote } = getTradingPair(symbolSelected);

          // const symbolWithAmount = newValuesResponse.symbols.filter(
          //   (e: any) =>
          //     (e.symbol === quote && e.availableValue > 0) ||
          //     (e.symbol === base && e.availableValue > 0),
          // );

          // if (symbolWithAmount.length) {
          const auxExchanges: any[] = [];
          Object.keys(exchangesAvaiableBalance).forEach(
            // eslint-disable-next-line consistent-return
            (exchange) => {
              if (exchange === 'ftx' && exchangesAvaiableBalance[exchange] > 0)
                return auxExchanges.push(exchange);
            },
          );
          setExchangesWithSymbol(auxExchanges);
          // if (exchangesWithAmount.length) {
          // setExchangesWithSymbol(symbolWithAmount);

          // const resultQuote = symbolWithAmount.find(
          // (item: any) =>
          // item.symbol === quoteResult &&
          // item.exchange.toLowerCase() ===
          // exchangeSelected.toString().toLowerCase(),
          // );

          // if (resultQuote) {
          // setAmountQuote(
          // Number(removeScientificNotation(resultQuote.availableValue)),
          // );
          // } else {
          // setAmountQuote(0);
          // }

          // const resultBase = symbolWithAmount.find(
          // (item: any) =>
          // item.symbol === baseResult &&
          // item.exchange.toLowerCase() ===
          // exchangeSelected.toString().toLowerCase(),
          // );
          // if (resultBase) {
          // setAmountBase(
          // Number(removeScientificNotation(resultBase.availableValue)),
          // );
          // } else {
          // setAmountBase(0);
          // }
          // }
          // }
        }
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const handlePlaceOrder = async (offerType: string) => {
    let formValues;
    if (offerType === 'Buy') {
      await form.validateFields(['sizeBuy', 'priceBuy', 'exchangeSelected']);
      formValues = form.getFieldsValue([
        'exchangeSelected',
        'sizeBuy',
        'priceBuy',
      ]);
    }
    if (offerType === 'Sell') {
      await form.validateFields(['sizeSell', 'priceSell', 'exchangeSelected']);
      formValues = form.getFieldsValue([
        'exchangeSelected',
        'sizeSell',
        'priceSell',
      ]);
    }

    createOrder(formValues, offerType);
  };

  const changeOrderType = async (e: RadioChangeEvent) => {
    setLoading(true);
    setSelectedMarketOrder(e.target.value);
    const exchangeValueName = form.getFieldsValue([
      'exchangeSelected',
    ]).exchangeSelected;

    try {
      const response = await DepoAPISevice.getSymbolAllExchanges(
        'spot',
        symbolSelected,
      );

      setAllSymbolValue(response);

      const selectedExchange = response.find(
        (value: any) => value.exchange === exchangeValueName,
      );

      if (selectedExchange) {
        setPriceValue(selectedExchange.price);
        form.setFieldsValue({
          priceSell: selectedExchange.price,
          priceBuy: selectedExchange.price,
        });
      }
    } catch (err) {
      console.log(err);
    }

    const formValues = form.getFieldsValue([
      'sizeBuy',
      'priceBuy',
      'sizeSell',
      'priceSell',
    ]);
    const totalResultBuy = formValues.priceBuy * formValues.sizeBuy;
    const totalResultSell = formValues.priceSell * formValues.sizeSell;

    setTotalBuy(totalResultBuy);
    setTotalSell(totalResultSell);

    setLoading(false);
  };

  const handleInputSize = (
    offerType: string,
    value: string,
    availableValue: number,
  ) => {
    if (offerType === 'Buy') {
      const formValues = form.getFieldsValue(['priceBuy', 'sizeBuy']);
      const total = formValues.priceBuy * formValues.sizeBuy;
      const newSize = (total / availableValue) * 100;
      setSliderBuyPercent(Number(Number(newSize).toFixed(2)));
    }

    if (offerType === 'Sell') {
      const formValues = form.getFieldsValue(['sizeSell']);
      const newSize = (formValues.sizeSell / availableValue) * 100;
      setSliderSellPercent(Number(Number(newSize).toFixed(2)));
    }

    handleTotal(offerType);
  };

  return (
    <div className="place-order">
      <p className="title">Compare Order</p>
      <Loading show={loading} />
      <Form form={form}>
        <div className="selector">
          {/* <>
            <p className="exchange">Select Exchange:</p>

            <Form.Item
              name="exchangeSelected"
              rules={[
                {
                  required: true,
                  message: 'Exchange is required',
                },
              ]}
            >
              <Select
                loading={loading}
                disabled={loading}
                notFoundContent={
                  <p style={{ color: '#fff', fontSize: 12 }}>
                    You do not have exchanges with amount
                  </p>
                }
                className="select"
                onChange={(e) => handlePriceExchange(e)}
                dropdownStyle={{
                  background: '#070708',
                  color: '#fff',
                  borderRadius: 10,
                }}
              >
                {selectValues.map((teste: any) => console.log(teste))}
                {selectValues.map((option: any) => (
                  <Option
                    key={option.name}
                    value={option.id}
                    className="selectOptions"
                  >
                    <img
                      style={{ marginRight: 10, width: '16px' }}
                      src={
                        (option.name === 'binance' && BinanceLogo) ||
                        (option.name === 'ftx' && FTXLogo) ||
                        (option.name === 'huobi' && HuobiLogo) ||
                        KucoinLogo
                      }
                      alt="cex"
                    />
                    {option.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </> */}
        </div>
        {allTypes.map((offerType, index) => (
          <div key={offerType[index]}>
            <Row className="order">
              <Col className="order-type">
                {offerType} {baseResult}
              </Col>
              {/* <button
                disabled={loading}
                type="button"
                className="available"
                onClick={() => {
                  if (offerType === 'Buy') {
                    if (sliderBuyPercent === 100) {
                      handleSliderBuy(0, 0);
                      setSliderBuyPercent(0);
                    } else {
                      setSliderBuyPercent(100);
                      handleSliderBuy(100, amountQuote);
                    }
                  } else if (sliderSellPercent === 100) {
                    handleSliderSell(0, 0);
                    setSliderSellPercent(0);
                  } else {
                    setSliderSellPercent(100);
                    handleSliderSell(100, amountBase);
                  }
                }}
              >
                Available{' '}
                {offerType === 'Buy'
                  ? `${quoteResult}: ${amountQuote.toFixed(4)} `
                  : `${baseResult} ${amountBase.toFixed(4)}`}
              </button> */}
            </Row>
            <Form.Item
              name={offerType === 'Buy' ? 'priceBuy' : 'priceSell'}
              rules={[
                {
                  required: true,
                  message: 'Price is required',
                },
              ]}
            >
              <Input
                disabled={selectedMarketOrder === 'Market'}
                onChange={() => {
                  handleTotal(offerType);
                }}
                prefix="Price"
                suffix={
                  selectedMarketOrder === 'Market'
                    ? `MARKET  ${quoteResult}`
                    : quoteResult
                }
                className="input"
                type={selectedMarketOrder === 'Market' ? 'hidden' : 'number'}
              />
            </Form.Item>
            <Form.Item
              name={offerType === 'Buy' ? 'sizeBuy' : 'sizeSell'}
              rules={[
                {
                  required: true,
                  message: 'Size is required',
                },
                () => ({
                  validator(_, value) {
                    if (minimumSize <= value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(`Minimum size is ${minimumSize}`),
                    );
                  },
                }),
              ]}
            >
              <Input
                disabled={loading}
                onChange={(e) => {
                  if (offerType === 'Buy') {
                    handleInputSize(offerType, e.target.value, amountQuote);
                  }

                  if (offerType === 'Sell') {
                    handleInputSize(offerType, e.target.value, amountBase);
                  }
                }}
                prefix="Size"
                suffix={baseResult}
                className="input"
                type="number"
              />
            </Form.Item>
            {/* <Row>
              <Col xs={24} className="col-size">
                <p>Minimum size: {minimumSize}</p>
              </Col>
            </Row> */}
            {/* <Row>
              <Col xs={24}>
                <Slider
                  disabled={loading}
                  marks={sliderMarkOptions(100)}
                  value={
                    offerType === 'Buy' ? sliderBuyPercent : sliderSellPercent
                  }
                  className={`depo__slider-props--${offerType}`}
                  onChange={(value) => {
                    if (offerType === 'Buy') {
                      setSliderBuyPercent(value);
                      handleSliderBuy(value, amountQuote);
                    } else {
                      setSliderSellPercent(value);
                      handleSliderSell(value, amountBase);
                    }
                  }}
                />
              </Col>
            </Row> */}
            <Row className="total">
              <Col xs={12}>
                <p>Total</p>
              </Col>
              <Col xs={12} style={{ textAlign: 'right' }}>
                {offerType === 'Buy' ? (
                  <p>
                    {Number(totalBuy || 0).toFixed(8)} {quoteResult}
                  </p>
                ) : (
                  <p>
                    {Number(totalSell || 0).toFixed(8)} {quoteResult}
                  </p>
                )}
              </Col>
            </Row>
            <Row className="exchange-trading">
              <Col xs={12}>
                <p>Exchange Trading Fee</p>
              </Col>
              <Col xs={12}>
                <p style={{ textAlign: 'right' }}>
                  ~ {marketSelected.maker * 1000 || 0}% /{' '}
                  {marketSelected.taker * 1000 || 0} %
                </p>
              </Col>
            </Row>
            <Row className="d-flex justify-center flex-column align-center">
              <Col xs={24}>
                {/* <Form.Item noStyle>
                  <Button
                    disabled={
                      (offerType === 'Buy' && amountQuote === 0 && true) ||
                      (offerType === 'Sell' && amountBase === 0 && true) ||
                      blockContent
                    }
                    onClick={() => handlePlaceOrder(offerType)}
                    className={`depo__place-order-btn rounded mr-1 bg-success text-uppercase ${
                      offerType === 'Buy' ? 'bg-success' : 'bg-danger'
                    }`}
                  >
                    {offerType}
                  </Button>
                </Form.Item> */}
                <Button
                  disabled={checkCompareIsDisable(offerType)}
                  onClick={() => handleCompareCexButton(offerType)}
                  // className="depo__place-order-btn rounded "
                  className={`depo__place-order-btn rounded mr-1 bg-success text-uppercase ${
                    offerType === 'Buy' ? 'bg-success' : 'bg-danger'
                  }`}
                >
                  COMPARE {offerType}
                </Button>
              </Col>
            </Row>
          </div>
        ))}
        <Row style={{ justifyContent: 'center' }}>
          {/* <Col>
            <Group buttonStyle="outline" defaultValue={selectedMarketOrder}>
              {marketOrders.map((item) => (
                <Button
                  disabled={
                    form.getFieldsValue(['exchangeSelected'])
                      .exchangeSelected === undefined
                  }
                  key={item.id}
                  className="button-radio-group"
                  value={item.order}
                  defaultChecked
                  onChange={(e) => changeOrderType(e)}
                >
                  {item.order}
                </Button>
              ))}
            </Group>
          </Col> */}
        </Row>
      </Form>
    </div>
  );
};

export default PlaceOrderFuture;
