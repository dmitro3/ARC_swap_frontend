import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Grid, Input, Row, Select, Tooltip } from 'antd';
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import logoImg from '../../assets/icons/ARC_icon.svg';
import Loading from '../../components/Loading/Loading';
import ModalComponent from '../../components/Modal/Modal';
import Notification from '../../components/Notification/Notification';
import { AuthContext } from '../../contexts/AuthProvider';
import { IAPIKey, IExtraApiKeyFields } from '../../interfaces/IAPIKeys';
import { INewExchangeRequest } from '../../interfaces/INewExchangeRequest';
import { IUser } from '../../interfaces/IUser';
import { DepoAPISevice } from '../../services/DepoAPIService';
import PageChangeEvent from '../../utility/page-change-event';
import styles from './styles.module.scss';

const Wrapper = styled.div`
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  background: #111114;

  min-width: 216px;
  position: absolute;
  margin-left: 8px;
  left: 100%;
  border-radius: 10px;
  @media screen and (max-width: 1600px) {
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
  }
  @media screen and (max-width: 992px) {
    top: 100px;
    left: 0%;
    transform: translateX(-100%);
    margin: 0;
  }
  @media screen and (max-width: 576px) {
    transform: translateX(0%);
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    position: fixed;
    top: unset;
    background: #1f1f1f;
    padding: 1.5rem;
    z-index: 999;
  }
`;

const AccountSelector = styled(Select)`
  .ant-select-selector {
    @media screen and (max-width: 576px) {
      background: #2c2c2c !important;
      height: 48px !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
    }
  }
`;
const { Option } = Select;

const AllExchanges = [
  {
    id: 'gateio',
    name: 'Gate.io',
  },
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
];

const ExtraFields = [
  {
    id: 1,
    name: 'Subaccount',
  },
];

const TooltipMessage =
  'Some exchanges require you to add additional information, such as a sub account. Select below the extra field according to the exchange and your account';
const Account: React.FC = () => {
  const {
    user,
    setUser,
    setUserBalances,
    setWalletAvailableValue,
    isAuthenticated,
    setIsAuthenticated,
    setUniqueSymbols,
    setSymbols,
    setAllOpenOrders,
  } = useContext(AuthContext);
  const [form] = Form.useForm();
  // let userExchanges: any = [];
  const [accountExchanges, setAccountExchanges] = useState<any>([]);
  const [updateExchanges, setUpdateExchanges] = useState<any[]>([]);
  const userExchangesLength =
    accountExchanges?.exchanges?.length === undefined
      ? 0
      : accountExchanges?.exchanges.length;
  const logout = () => {
    try {
      localStorage.clear();
      setUser({});
      setUserBalances({});
      setWalletAvailableValue(0);
      setUniqueSymbols([]);
      setSymbols([]);
      setAllOpenOrders([]);
      setIsAuthenticated(false);
    } catch (error) {
      const err = error as Error;
      Notification({
        type: 'error',
        title: 'Error',
        message: err.message,
      });
    }
    PageChangeEvent.prepareAndDispatch('/market/spot');
  };

  const userNotExchanges = AllExchanges.filter((el) => {
    if (accountExchanges?.exchanges) {
      return accountExchanges?.exchanges.every(
        (f: any) => f.id.toString() !== el.id.toString(),
      );
    }
    return [];
  });

  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteExchange, setIsDeleteExchange] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [userSelectedExchange, setUserSelectedExchangeId] = useState<
    IAPIKey | undefined
  >();
  const [extraValue, setExtraValue] = useState<string>();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isDeleteExchange && isOpenPopover) {
      form.resetFields();
    }
  }, [isDeleteExchange, isOpenPopover]);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  // eslint-disable-next-line
  const getUserCex = async () => {
    if (user?.settings?.defaultWallet) {
      const wallet: any = user?.settings?.defaultWallet;
      const result: any = await DepoAPISevice.getUser(wallet);
      // await getUserCexBalance(user?.settings?.defaultWallet);
      return setAccountExchanges(result);
    }
  };

  const addExchange = async ({
    exchangeId,
    apiKey,
    passphrase,
    apiSecret,
    subAccount,
    subAccountValue,
  }: INewExchangeRequest) => {
    const exchange = AllExchanges.find((e) => e.name === exchangeId);
    const extraFields: IExtraApiKeyFields[] = [];
    if (exchange?.name === 'FTX') {
      extraFields.push({
        fieldName: subAccount as string,
        value: extraValue as string,
      });
    }
    const exchangeForm: IUser = {
      exchanges: [
        {
          id: exchange!.id,
          passphrase,
          apiKey,
          apiSecret,
          extraFields,
        },
      ],
    };
    if (user?.settings?.defaultWallet) {
      setIsLoading(true);
      const result = await DepoAPISevice.updateUser(
        exchangeForm,
        user.settings.defaultWallet,
      );
      setIsLoading(false);
      setIsOpenPopover(!isOpenPopover);
      getUserCex();
      form.resetFields();
      if (result !== false) {
        setUser(result);
        Notification({
          type: 'success',
          message: 'Exchange added successfully',
        });
      } else {
        Notification({
          type: 'error',
          title: 'Error',
          message: 'Incorrect Access key',
        });
      }
    } else {
      Notification({
        type: 'error',
        title: 'Error',
        message: 'Something bad happened. Please try again later',
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useEffect(() => {}, [user]);

  useEffect(() => {
    getUserCex();
  }, [isAuthenticated]);

  const handleExchange = (values: any) => {
    setIsOpenPopover(!isOpenPopover);
    setIsDeleteExchange(!isDeleteExchange);

    const selectedExchange = accountExchanges?.exchanges.find(
      (exchange: any) => exchange.id.toString() === values.id,
    );

    const exchangeName = accountExchanges?.exchanges.find(
      (e: any) => e.id.toString() === values.id.toString(),
    );

    setUserSelectedExchangeId(selectedExchange);
    form.setFieldsValue({
      exchangeId:
        exchangeName?.id.charAt(0).toUpperCase() + exchangeName?.id.slice(1),
      apiKey: selectedExchange?.apiKey,
      apiSecret: selectedExchange?.apiSecret || '11111111111111',
    });
  };
  const handlePopOver = () => {
    setIsOpenPopover(!isOpenPopover);
    setIsDeleteExchange(false);
  };

  const useOutsideClick = (ref: any, callback: any) => {
    useEffect(() => {
      const handleClickOutside = (evt: any) => {
        if (ref.current && !ref.current.contains(evt.target)) {
          let count = 0;
          if (evt.target.className !== 'ant-select-item-option-content') {
            count += 1;
          }
          if (evt.target.type === 'button' && evt.target.value === 'add') {
            count += 1;
          }
          if (count > 0) {
            callback();
          }
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    });
  };
  const wrapperRef = useRef<HTMLDivElement>(null);
  useOutsideClick(wrapperRef, handlePopOver);
  const breakpoints = Grid.useBreakpoint();
  const removeExchange = async () => {
    setIsOpenModal(false);
    setIsLoading(!isLoading);
    if (user?.settings?.defaultWallet) {
      setIsLoading(true);
      const result = await DepoAPISevice.removeApiKey(
        user.settings.defaultWallet,
        userSelectedExchange!.id,
        userSelectedExchange!.apiKey,
      );
      setUser(result);
      getUserCex();
      setIsLoading(false);
      if (result !== false) {
        Notification({
          type: 'success',
          message: 'Exchange removed successfully',
        });
      } else {
        Notification({
          type: 'error',
          title: 'Error',
          message: 'Something bad happened',
        });
      }
    } else {
      Notification({
        type: 'error',
        title: 'Error',
        message: 'Something bad happened. Please try again later',
      });
    }
  };
  useEffect(() => {
    if (accountExchanges?.exchanges) {
      const userExchange = AllExchanges.filter((el) => {
        if (accountExchanges?.exchanges) {
          return accountExchanges?.exchanges.some(
            (f: any) => f.id.toString() === el.id.toString(),
          );
        }
        return [];
      });
      setUpdateExchanges(userExchange);
    }
  }, [accountExchanges, accountExchanges.exchanges]);
  const isopen = true;

  const closeModal = () => {
    setIsOpenModal(!isOpenModal);
  };

  return (
    <div className={styles.account}>
      <Row className={styles.logout}>
        <Loading show={isLoading} />
        <ModalComponent
          showModal={isOpenModal}
          message="Are you sure you want to disconnect this exchange?"
          cancelText="MAINTAIN EXCHANGE"
          okText="DISCONNECT"
          closeModal={closeModal}
          handleConfirm={removeExchange}
        />
        <Col>
          {isAuthenticated && (
            <div
              className={`${styles['depo__logout-icon']} pointer`}
              onClick={() => {
                logout();
              }}
            >
              Logout
            </div>
          )}
        </Col>
      </Row>
      <div className={styles.content}>
        <div className={styles.cardContainer}>
          <Col md={12} lg={12} sm={16} xs={24}>
            <div className={styles.card}>
              <div className={styles.cardRow}>
                <Col>
                  <img src={logoImg} alt="avatar" />
                </Col>
                <Col>
                  <span className={`${styles['depo__account-address']}`}>
                    {user?.settings?.defaultWallet}
                  </span>
                </Col>
              </div>
            </div>
          </Col>
        </div>
        <div className={styles.cardContainer}>
          <Col md={12} lg={12} sm={16} xs={24}>
            <div className={styles.cardExchange}>
              <Row className={styles.buttonPlus}>
                <Col style={{ paddingTop: 10, paddingBottom: 0 }}>
                  <p>Exchanges</p>
                </Col>
                <Col style={{ paddingTop: 0 }}>
                  {isOpenPopover && (
                    <Wrapper ref={wrapperRef}>
                      {' '}
                      <Form
                        form={form}
                        onFinish={addExchange}
                        initialValues={{
                          exchangeId:
                            userNotExchanges.length > 0
                              ? userNotExchanges[0].name
                              : '',
                        }}
                        className={styles.popOverContent}
                      >
                        <Form.Item
                          name="exchangeId"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                        >
                          <AccountSelector
                            className={styles.select}
                            dropdownStyle={{
                              background: '#070708',
                              color: '#fff',
                              borderRadius: 10,
                            }}
                            disabled={isDeleteExchange}
                          >
                            {userNotExchanges.map((option) => (
                              <Option
                                key={option.id}
                                value={option.name}
                                className={styles.selectOptions}
                              >
                                {option.name}
                              </Option>
                            ))}
                          </AccountSelector>
                        </Form.Item>

                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) =>
                            prevValues.exchangeId !== currentValues.exchangeId
                          }
                        >
                          {({ getFieldValue }) => (
                            <>
                              <Form.Item
                                name="apiKey"
                                rules={[
                                  {
                                    required: true,
                                    message: 'API Key is required',
                                  },
                                ]}
                              >
                                <Input
                                  placeholder={
                                    getFieldValue('exchangeId') === 'Gate.io'
                                      ? 'Enter Gate.io V4 API Key'
                                      : 'Enter API Key'
                                  }
                                  className={styles.input}
                                  disabled={isDeleteExchange}
                                />
                              </Form.Item>

                              <Form.Item
                                name="apiSecret"
                                rules={[
                                  {
                                    required: true,
                                    message: 'API Secret is required',
                                  },
                                ]}
                              >
                                <Input
                                  type="password"
                                  placeholder={
                                    getFieldValue('exchangeId') === 'Gate.io'
                                      ? 'Enter Gate.io V4 API Secret Key'
                                      : 'Enter API Secret Key'
                                  }
                                  className={styles.input}
                                  disabled={isDeleteExchange}
                                />
                              </Form.Item>
                            </>
                          )}
                        </Form.Item>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) =>
                            prevValues.subAccount !== currentValues.subAccount
                          }
                        >
                          {({ getFieldValue }) =>
                            getFieldValue('subAccount') === 'Subaccount' ? (
                              <>
                                <Form.Item
                                  name={getFieldValue('subAccount')}
                                  rules={[{ required: true }]}
                                >
                                  <Input
                                    placeholder={`Enter ${getFieldValue(
                                      'subAccount',
                                    )}`}
                                    className={styles.input}
                                    disabled={isDeleteExchange}
                                    onChange={(e: any) =>
                                      setExtraValue(e.target.value)
                                    }
                                  />
                                </Form.Item>
                              </>
                            ) : null
                          }
                        </Form.Item>

                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) =>
                            prevValues.exchangeId !== currentValues.exchangeId
                          }
                        >
                          {({ getFieldValue }) =>
                            getFieldValue('exchangeId') === 'FTX' ? (
                              <>
                                <div className={styles.rowTooltip}>
                                  <p className={styles.extraField}>
                                    Add extra field
                                  </p>
                                  <Tooltip
                                    placement="rightBottom"
                                    title={TooltipMessage}
                                    style={{ borderRadius: '10px' }}
                                    className={styles.tooltip}
                                  >
                                    <QuestionCircleOutlined
                                      style={{ color: 'white' }}
                                    />
                                  </Tooltip>
                                </div>

                                <Form.Item name="subAccount">
                                  <AccountSelector
                                    allowClear
                                    placeholder="Select an option"
                                    className={styles.select}
                                    dropdownStyle={{
                                      background: '#070708',
                                      color: '#fff',
                                      borderRadius: 10,
                                    }}
                                    disabled={isDeleteExchange}
                                  >
                                    {ExtraFields.map((option) => (
                                      <Option
                                        key={option.id}
                                        value={option.name}
                                        className={styles.selectOptions}
                                      >
                                        {option.name}
                                      </Option>
                                    ))}
                                  </AccountSelector>
                                </Form.Item>
                              </>
                            ) : null
                          }
                        </Form.Item>

                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) =>
                            prevValues.exchangeId !== currentValues.exchangeId
                          }
                        >
                          {({ getFieldValue }) =>
                            getFieldValue('exchangeId') === 'Kucoin' ? (
                              <>
                                <Form.Item
                                  name="passphrase"
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Passphrase is required',
                                    },
                                  ]}
                                >
                                  <Input
                                    type=""
                                    placeholder="Enter Passphrase"
                                    className={styles.input}
                                    disabled={isDeleteExchange}
                                  />
                                </Form.Item>
                              </>
                            ) : null
                          }
                        </Form.Item>

                        <Form.Item className={styles.button}>
                          {isDeleteExchange ? (
                            <Button
                              onClick={() => setIsOpenModal(!isOpenModal)}
                              className={styles.depo__btnDanger}
                              style={{ border: 'none' }}
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button
                              htmlType="submit"
                              className={styles.depo__btn}
                              style={{ border: 'none' }}
                            >
                              Connect
                            </Button>
                          )}
                        </Form.Item>
                      </Form>
                    </Wrapper>
                  )}
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => setIsOpenPopover(!isOpenPopover)}
                    value="add"
                  >
                    +
                  </button>
                </Col>
              </Row>
              <Row style={{ padding: 0 }}>
                {updateExchanges?.map((exchange: any) => (
                  <React.Fragment key={exchange.id}>
                    <Col style={{ paddingTop: 0 }}>
                      {exchange !== undefined && exchange && (
                        <Button
                          className="btn-depo-text bg-dark-alpha"
                          onClick={() => handleExchange(exchange)}
                        >
                          {exchange.name}
                        </Button>
                      )}
                    </Col>
                  </React.Fragment>
                ))}
              </Row>
            </div>
          </Col>
        </div>
      </div>
    </div>
  );
};

export default Account;
