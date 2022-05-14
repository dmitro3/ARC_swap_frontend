/* eslint-disable */
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Button, Typography, Input, Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import DepoModal from 'components/DepoModal/DepoModal';

import leftArrowImg from 'assets/arrow-left.svg';
import closeImg from 'assets/close.svg';
import trashImg from 'assets/trash.svg';
import openLinkImg from 'assets/openlink.svg';
import redInfoImg from 'assets/redinfo.svg';

import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import standardAbiEth from 'utility/abi/standard-abi.eth';
import { AuthContext } from '../../../contexts/AuthProvider';
import { __debounce } from '../../../utility/debounce';
import CoingeckoService from '../../../services/CoingeckoService';
import { DepoAPISevice } from '../../../services/DepoAPIService';
import { IToken } from '../../../interfaces/IToken';
import ConfirmModal from './ConfirmModal';

const SelectTokenModal: React.FC<{
  onSelect: Function;
  selected?: IToken | null;
  visible: boolean;
  onClose: () => void;
}> = ({ onSelect, selected, visible, onClose }) => {
  const {
    erc20TokensForStaticList,
    tokens,
    chainId,
    setTokens,
    balances,
    provider,
  } = useContext(AuthContext);
  let _tokens = useRef<IToken[]>([]);
  let balancesInUSDT = useRef<any>({});

  const sortTokenFn = (a: any, b: any) => {
    if (!(a.address in balancesInUSDT.current)) return 1;
    if (!(b.address in balancesInUSDT.current)) return -1;
    if (balancesInUSDT.current[a.address] > balancesInUSDT.current[b.address])
      return -1;
    if (balancesInUSDT.current[a.address] < balancesInUSDT.current[b.address])
      return 1;
    return 0;
  };

  const [modalIndex, setModalIndex] = useState(0);
  const [searchStr, setSearchStr] = useState('' as string);
  const [importSearchStr, setImportSearchStr] = useState('' as string);
  const [filteredItems, setFilteredItems] = useState(_tokens.current);
  const [itemsShown, setItemsShown] = useState([] as Array<IToken>);
  const [filteredRemoteItems, setFilteredRemoteItems] = useState(
    [] as Array<IToken>,
  );
  const [remoteItemsShown, setRemoteItemsShown] = useState([] as Array<IToken>);
  const [selectedTokenToImport, setTokenToImport] = useState<IToken>();
  const [isRemoteToken, setIsRemoteToken] = useState(false);
  const [importedTokenList, setImportedTokenList] = useState(
    [] as Array<IToken>,
  );
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const handleEtherScan = () => {
    window.open('https://etherscan.io/token/' + selectedTokenToImport?.address);
  };

  const onCloseHandler = () => {
    setModalIndex(0);
    setSearchStr('');
    setImportSearchStr('');
    onClose();
  };

  const search = ($e: any) => {
    __debounce(
      () => {
        const str = $e.target.value.replace(/\W/gim, '');
        setSearchStr(str);
      },
      250,
      'set-search-str',
    );
  };

  const searchImportToken = ($e: any) => {
    console.log($e)
    __debounce(
      () => {
        const str = $e.target.value.replace(/\W/gim, '');
        setImportSearchStr(str);
      },
      250,
      'set-import-search-str',
    );
  };

  const filterTokens = async (contractAddr: string) => {
    setIsRemoteToken(false);
    if (!contractAddr.length) {
      setFilteredItems(_tokens.current);
    } else if (contractAddr.length) {
      // Try to search for the token in the loaded list
      const rgx = new RegExp(contractAddr.toLowerCase(), 'igm');
      const filtered = _tokens.current.filter(
        (a) =>
          a.symbol.toLowerCase().match(rgx) ||
          a.name.toLowerCase().match(rgx) ||
          a.address.toLowerCase().match(rgx),
      );
      // If the token is found, then load the tokens.
      if (filtered.length) {
        setFilteredItems(filtered);
        // If it is not, try Verify if it is a token address and search
        // in the Coingecko Database.
      } else if (/(0x)?[0-9a-f]{40}$/gi.test(contractAddr) && chainId) {
        try {
          let tokenContract;
          let decimals: number = 18;
          if (window.ethereum || provider) {
            const web3 = new Web3(provider || (window.ethereum as any));
            tokenContract = new web3.eth.Contract(
              standardAbiEth as AbiItem[],
              contractAddr,
            );
            decimals = +(await tokenContract.methods.decimals().call());
          }

          const tokenExists = await CoingeckoService.search(
            chainId,
            contractAddr,
            decimals,
          );
          if (tokenExists) {
            setFilteredItems([tokenExists]);
            setIsRemoteToken(true);
          }
        } catch (error) {
          console.log(error);
          setFilteredItems([]);
        }
      } else if (!filtered.length) {
        setFilteredItems([]);
      }
    }
  };

  const filterImportTokens = async (contractAddr: string) => {
    setIsRemoteToken(false);
    if (!contractAddr.length) {
      setFilteredRemoteItems([]);
    } else {
      // Try to search for the token in the loaded list
      const rgx = new RegExp(contractAddr.toLowerCase(), 'igm');
      const filtered = _tokens.current.filter(
        (a: any) =>
          a.symbol.toLowerCase().match(rgx) ||
          a.name.toLowerCase().match(rgx) ||
          a.address.toLowerCase().match(rgx),
      );
      // If token is not found, try to verify that it is a token address and search in the Coingecko Database.
      if (
        !filtered.length &&
        /(0x)?[0-9a-f]{40}$/gi.test(contractAddr) &&
        chainId
      ) {
        try {
          let tokenContract;
          let decimals: number = 18;
          if (window.ethereum || provider) {
            const web3 = new Web3(provider || (window.ethereum as any));
            tokenContract = new web3.eth.Contract(
              standardAbiEth as AbiItem[],
              contractAddr,
            );
            decimals = +(await tokenContract.methods.decimals().call());
          }

          const tokenExists = await CoingeckoService.search(
            chainId,
            contractAddr,
            decimals,
          );
          if (tokenExists) {
            setFilteredRemoteItems([tokenExists]);
            setIsRemoteToken(true);
          }
        } catch (error) {
          setFilteredRemoteItems([]);
        }
      } else if (filtered.length) {
        setFilteredRemoteItems([]);
      }
    }
  };

  const markup = (str: string) => {
    if (searchStr.length) {
      const rgx = new RegExp(`(${searchStr.toLowerCase()})`, 'igm');
      return str.replace(rgx, `<mark>$1</mark>`);
    } else return str;
  };

  const importToken = (token: IToken) => {
    const currentTokens = [..._tokens.current];
    currentTokens.unshift(token);
    token.imported = true;
    const hasImportedTokens = localStorage.getItem('@app:imported-tokens');
    let importedTokens: IToken[] = [];
    if (hasImportedTokens) {
      importedTokens = JSON.parse(hasImportedTokens);
    }
    importedTokens.push(token);
    localStorage.setItem(
      '@app:imported-tokens',
      JSON.stringify(importedTokens),
    );
    setIsRemoteToken(false);
    setTokens(currentTokens);
  };

  const getImportedTokenList = () => {
    const hasImportedTokens = localStorage.getItem('@app:imported-tokens');
    let importedTokens: IToken[] = [];
    if (hasImportedTokens) {
      importedTokens = JSON.parse(hasImportedTokens);
    }
    setImportedTokenList(importedTokens);
  };

  const handleClearAll = () => {
    localStorage.clear();
    getImportedTokenList();
    setRemoteItemsShown([]);
  };

  const handleClearItem = (item: IToken) => {
    const hasImportedTokens = localStorage.getItem('@app:imported-tokens');
    let importedTokens: IToken[] = [];
    if (hasImportedTokens) {
      importedTokens = JSON.parse(hasImportedTokens);
      const indexOfSelectedItem = importedTokens.findIndex(
        (itoken: IToken) => itoken.address === item.address,
      );
      importedTokens.splice(indexOfSelectedItem, 1);
      localStorage.setItem(
        '@app:imported-tokens',
        JSON.stringify(importedTokens),
      );
      getImportedTokenList();
    }

    const currentTokens = [..._tokens.current];
    const indexOfSelectedItemInTokens = currentTokens.findIndex(
      (itemIndex: IToken) => itemIndex.address === item.address,
    );
    currentTokens.splice(indexOfSelectedItemInTokens, 1);
    setTokens(currentTokens);
  };

  const toMiddleEllipsis = (str: string): string => {
    return str.substr(0, 12) + '...' + str.substr(str.length - 12, str.length);
  };
  useEffect(() => {
    if (modalIndex === 1) {
      getImportedTokenList();
    }
  }, [modalIndex]);

  useEffect(() => {
    if (visible) {
      setFilteredItems(_tokens.current);
      setIsRemoteToken(false);
    }
  }, [visible]);

  useEffect(() => {
    if (tokens.length > 0 && Object.keys(balances).length > 0) {
      (async () => {
        _tokens.current = JSON.parse(JSON.stringify(tokens));
        await Promise.all(
          _tokens.current.map(async (token: any) => {
            if (+balances[token.address] > 0) {
              balancesInUSDT.current = Object.assign(balancesInUSDT.current, {
                [token.address]:
                  parseFloat(
                    await DepoAPISevice.getPriceUSDTWithAddress(
                      token.symbol,
                      token.address,
                    ),
                  ) * balances[token.address],
              });
            }
          }),
        ).then(() => {
          _tokens.current.sort(sortTokenFn);
          setFilteredItems(_tokens.current);
          setIsRemoteToken(false);
        });
      })();
    } else if (tokens.length > 0) {
      _tokens.current = JSON.parse(JSON.stringify(tokens));
      setFilteredItems(_tokens.current);
      setIsRemoteToken(false);
    }
  }, [tokens, balances]);

  useEffect(() => {
    setItemsShown(filteredItems);
  }, [filteredItems]);

  useEffect(() => {
    setRemoteItemsShown(filteredRemoteItems);
  }, [filteredRemoteItems]);

  useEffect(() => {
    filterTokens(searchStr);
  }, [searchStr]);

  useEffect(() => {
    filterImportTokens(importSearchStr);
  }, [importSearchStr]);

  return (
    <>
      <DepoModal open={visible} onClose={onClose}>
        <div
          className="depo__fulfill-modal bg-lightgrey rounded"
          id="selectTokenModal"
        >
          <Button
            type="link"
            className="btn-close mt-4 mr-4"
            onClick={onCloseHandler}
          >
            <img src={closeImg} alt="down-arrow" />
          </Button>
          {modalIndex === 0 && (
            <div className="depo__token-select-tab">
              <div className="depo__token-select-mainpanel">
                <div className="p-4">
                  <Typography className="title">Select a token</Typography>
                  <div className="depo__token-search">
                    <Input
                      prefix={<SearchOutlined style={{ color: 'white' }} />}
                      className="w-100"
                      placeholder="Search or paste token address"
                      id="form-search-token"
                      onChange={(e) => search(e)}
                    />
                  </div>
                  <div className="depo__token-static-list">
                    <div className="d-flex justify-start flex-row flex-wrap">
                      {erc20TokensForStaticList.map(
                        (assetItem: IToken, index) => (
                          <div
                            key={index}
                            className="d-flex justify-space-around pointer"
                            style={{
                              border: '1px solid #2C2C2C',
                              borderRadius: '6px',
                              padding: '6px',
                              marginRight: '8px',
                              marginBottom: '8px',
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              onSelect(assetItem);
                            }}
                          >
                            <Image
                              src={assetItem.logoURI}
                              preview={false}
                              width="20px"
                              height="20px"
                              style={{ verticalAlign: 'middle' }}
                            />
                            <span
                              className="text-white"
                              style={{ paddingLeft: '8px' }}
                            >
                              {assetItem.symbol}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="depo__token-list">
                    {itemsShown.length ? (
                      itemsShown.map((item, index) => (
                        <div
                          className="depo__token-list-item px-3 py-2 d-flex justify-between"
                          key={item.address}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!isRemoteToken) {
                              onSelect(item);
                            }
                          }}
                        >
                          <div className="depo__token-namebar">
                            <div className="depo__token-image mr-2">
                              <img
                                src={item.logoURI}
                                width={40}
                                height={40}
                                style={{
                                  border: '1px solid transparent',
                                  borderRadius: '100%',
                                }}
                              />
                            </div>
                            <div>
                              <span
                                className="depo__token-title"
                                dangerouslySetInnerHTML={{
                                  __html: `${markup(item.symbol)}${
                                    selected?.address === item.address
                                      ? ' <small>(current)</small>'
                                      : ''
                                  }`,
                                }}
                              />
                              <br />
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 'lighter',
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: `${markup(item.name)}${
                                    selected?.address === item.address
                                      ? ' <small>(current)</small>'
                                      : ''
                                  }`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="depo__token-price text-right">
                            <div>
                              {balances[item.address] < 1e-6
                                ? '0'
                                : balances[item.address]}
                            </div>
                            {balancesInUSDT.current &&
                              balancesInUSDT.current[item.address] && (
                                <div>
                                  $
                                  {balancesInUSDT.current[item.address].toFixed(
                                    2,
                                  )}
                                </div>
                              )}
                          </div>
                          {!item.imported && isRemoteToken && (
                            <Button
                              className="bg-success"
                              onClick={() => {
                                setTokenToImport(item);
                                setModalIndex(2);
                                // setOpenWarningModal(true);
                              }}
                            >
                              Import
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <h5 className="text-center text-secondary">
                        Token not found.
                      </h5>
                    )}
                  </div>
                </div>
                <div className="depo__token-to-mng-list">
                  <Button
                    className="text-swap-success toMngList"
                    type="link"
                    onClick={() => {
                      setModalIndex(1);
                    }}
                  >
                    Import Token
                  </Button>
                </div>
              </div>
            </div>
          )}
          {modalIndex === 1 && (
            <div className="depo__token-mng-tab p-4">
              <Button
                className="left-arrow"
                type="link"
                onClick={() => {
                  setModalIndex(0);
                }}
              >
                <img src={leftArrowImg} alt="left-arrow" />
              </Button>
              <Typography className="title">Import Token</Typography>
              <div className="depo__token-mng-mainpanel">
                <div className="depo__token-import-input">
                  <Input
                    className="w-100"
                    placeholder="Paste contract address"
                    id="form-search-token"
                    onChange={(e) => searchImportToken(e)}
                  />
                </div>
                <div className="depo__token-list">
                  {remoteItemsShown.length ? (
                    remoteItemsShown.map((item) => (
                      <div
                        className="depo__token-list-item px-3 py-2 d-flex justify-between"
                        key={item.address}
                      >
                        <div className="depo__token-namebar">
                          <div className="depo__token-image mr-2">
                            <img
                              src={item.logoURI}
                              width={40}
                              height={40}
                              style={{
                                border: '1px solid transparent',
                                borderRadius: '100%',
                              }}
                            />
                          </div>
                          <div>
                            <span
                              className="depo__token-title"
                              dangerouslySetInnerHTML={{
                                __html: `${markup(item.symbol)}${
                                  selected?.address === item.address
                                    ? ' <small>(current)</small>'
                                    : ''
                                }`,
                              }}
                            />
                            <br />
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 'lighter',
                              }}
                              dangerouslySetInnerHTML={{
                                __html: `${markup(item.name)}${
                                  selected?.address === item.address
                                    ? ' <small>(current)</small>'
                                    : ''
                                }`,
                              }}
                            />
                          </div>
                        </div>
                        {!item.imported && (
                          <Button
                            className="bg-swap-success"
                            onClick={() => {
                              setTokenToImport(item);
                              setModalIndex(2);
                              // setOpenWarningModal(true);
                            }}
                          >
                            Import
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <h5 className="text-center text-secondary">
                      Token not found.
                    </h5>
                  )}
                </div>
                <div className="depo__token-imported-list">
                  <div className="depo__token-imported-list-header">
                    <div className="title">
                      {importedTokenList.length} custom token
                    </div>
                    <Button
                      type="link"
                      className="clearBtn text-swap-success"
                      onClick={handleClearAll}
                    >
                      Clear all
                    </Button>
                  </div>
                  <div className="depo__token-IMlist">
                    {importedTokenList.map((item: IToken) => (
                      <div
                        className="depo__token-list-item py-2 d-flex justify-between"
                        key={item.address}
                      >
                        <div className="depo__token-namebar">
                          <div className="depo__token-image mr-2">
                            <img
                              src={item.logoURI}
                              width={40}
                              height={40}
                              style={{
                                border: '1px solid transparent',
                                borderRadius: '100%',
                              }}
                            />
                          </div>
                          <div style={{ alignSelf: 'center' }}>
                            <span
                              className="depo__token-title"
                              dangerouslySetInnerHTML={{
                                __html: `${markup(item.symbol)}${
                                  selected?.address === item.address
                                    ? ' <small>(current)</small>'
                                    : ''
                                }`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="depo__token-imported-token-buttons">
                          <Button
                            type="link"
                            onClick={() => {
                              handleClearItem(item);
                            }}
                          >
                            <img src={trashImg} alt="Trash Item" />
                          </Button>
                          <Button type="link" onClick={handleEtherScan}>
                            <img src={openLinkImg} alt="Open Link Item" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="footer-tooltip">
                Custom tokens are stored locallly on your browser
              </div>
            </div>
          )}
          {modalIndex === 2 && (
            <div className="depo__token-import-tab p-4">
              <Button
                className="left-arrow"
                type="link"
                onClick={() => {
                  setModalIndex(1);
                }}
              >
                <img src={leftArrowImg} alt="left-arrow" />
              </Button>
              <Typography className="title">Import a token</Typography>
              <div className="depo__token-import-mainpanel">
                <div className="depo__token-namebar">
                  <div className="depo__token-image mr-2">
                    <img
                      src={selectedTokenToImport?.logoURI}
                      width={40}
                      height={40}
                      style={{
                        border: '1px solid transparent',
                        borderRadius: '100%',
                      }}
                    />
                  </div>
                  <div>
                    <span
                      className="depo__token-title"
                      dangerouslySetInnerHTML={{
                        __html: `${markup(
                          toMiddleEllipsis(
                            selectedTokenToImport?.address as string,
                          ),
                        )}${
                          selected?.address === selectedTokenToImport?.address
                            ? ' <small>(current)</small>'
                            : ''
                        }`,
                      }}
                    />
                    <br />
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 'lighter',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: `${markup(
                          selectedTokenToImport?.name as string,
                        )}${
                          selected?.address === selectedTokenToImport?.address
                            ? ' <small>(current)</small>'
                            : ''
                        }`,
                      }}
                    />
                  </div>
                </div>
                <div className="p-4 depo__token-import-tooltip">
                  <img src={redInfoImg} alt="Info Icon" />
                  <div className="infoRightTooltip">
                    This token doesn't appear on the active token list(s).
                    Anyone can create fake tokens - are you sure you want to
                    import?
                  </div>
                </div>
                <div className="depo__token-import-button">
                  <Button
                    className="btn-depo bg-swap-success btn-md rounded-sm"
                    block
                    onClick={() => {
                      if (selectedTokenToImport) {
                        importToken(selectedTokenToImport);
                        setConfirmModalVisible(true);
                        onCloseHandler();
                      }
                    }}
                  >
                    Import
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DepoModal>
      <ConfirmModal
        visible={confirmModalVisible}
        onClose={() => {
          setConfirmModalVisible(false);
        }}
        toEtherscan={handleEtherScan}
        symbol={selectedTokenToImport?.symbol || ''}
      />
    </>
  );
};

export default SelectTokenModal;
