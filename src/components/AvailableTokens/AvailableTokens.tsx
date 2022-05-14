import { Button, Input, Pagination } from 'antd';
/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';
import { useRef } from 'react';

import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import standardAbiEth from 'utility/abi/standard-abi.eth';
import { AuthContext } from '../../contexts/AuthProvider';
import useOnClickOutside from '../../hooks/useClickOutside';
import { IToken } from '../../interfaces/IToken';
import CoingeckoService from '../../services/CoingeckoService';
import { DepoAPISevice } from '../../services/DepoAPIService';
import { __debounce } from '../../utility/debounce';
import DepoModal from '../DepoModal/DepoModal';

import './style.scss';
import 'react-perfect-scrollbar/dist/css/styles.css';

export const AvailableTokens: React.FC<{
  onSelect: Function;
  selected?: IToken | null;
  visible: boolean;
  setVisibility: (visible: boolean) => void;
}> = ({ onSelect, selected, visible, setVisibility }) => {
  const { tokens, chainId, setTokens, balances, provider } =
    useContext(AuthContext);

  let _tokens = useRef<IToken[]>([]);
  let balancesInUSDT = useRef<any>({});

  const [itemsShown, setItemsShown] = useState([] as Array<IToken>);
  const [itemsPerPage, setItemsPerPage] = useState(400);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchStr, setSearchStr] = useState('' as string);
  const [filteredItems, setFilteredItems] = useState(_tokens.current);
  const [totalPages, setTotalPages] = useState(0);
  const [isRemoteToken, setIsRemoteToken] = useState(false);
  const [openWarningModal, setOpenWarningModal] = useState(false);
  const [selectedTokenToImport, setTokenToImport] = useState<IToken>();

  const sortTokenFn = (a: any, b: any) => {
    if (!(a.address in balancesInUSDT.current)) return 1;
    if (!(b.address in balancesInUSDT.current)) return -1;
    if (balancesInUSDT.current[a.address] > balancesInUSDT.current[b.address])
      return -1;
    if (balancesInUSDT.current[a.address] < balancesInUSDT.current[b.address])
      return 1;
    return 0;
  };

  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => {
    if (!openWarningModal) setVisibility(false);
    setItemsPerPage(400);
  });

  const search = ($e: any) => {
    __debounce(
      () => {
        const str = $e.target.value.replace(/\W/gim, '');
        setSearchStr(str);
        setCurrentPage(0);
      },
      250,
      'set-search-str',
    );
  };

  useEffect(() => {
    if (filteredItems.length >= itemsPerPage) {
      setItemsShown(filteredItems.slice(0, itemsPerPage));
    } else {
      setItemsShown(filteredItems);
    }
    setTotalPages(Math.ceil(filteredItems.length / itemsPerPage));
  }, [filteredItems]);

  const filterTokens = async (contractAddr: string) => {
    setIsRemoteToken(false);
    if (!searchStr.length) {
      setFilteredItems(_tokens.current);
    } else if (searchStr.length) {
      // Try to search for the token in the loaded list
      const rgx = new RegExp(searchStr.toLowerCase(), 'igm');
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

  useEffect(() => {
    filterTokens(searchStr);
    setCurrentPage(0);
  }, [searchStr]);

  const setPage = (page: number) => {
    if (page <= totalPages && page >= 0) {
      const startIndex = page * itemsPerPage;
      if (filteredItems.length >= startIndex) {
        const array = filteredItems.slice(
          startIndex,
          startIndex + itemsPerPage,
        );
        setItemsShown(array);
        setCurrentPage(page);
      }
    }
  };

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
          setOpenWarningModal(false);
        });
      })();
    } else if (tokens.length > 0) {
      _tokens.current = JSON.parse(JSON.stringify(tokens));
      setFilteredItems(_tokens.current);
      setIsRemoteToken(false);
      setOpenWarningModal(false);
    }
  }, [tokens, balances]);

  useEffect(() => {
    if (visible) {
      setFilteredItems(_tokens.current);
      setIsRemoteToken(false);
      setOpenWarningModal(false);
    }
  }, [visible]);

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

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  return (
    <>
      {visible && (
        <>
          <div
            ref={ref}
            tabIndex={1}
            className="depo__token-list-wrapper flex-column bg-lightgrey position-absolute rounded"
            style={{
              left: '-16px',
              top: '-13px',
            }}
          >
            <div className="depo__token-list-item">
              <Input
                className="w-100"
                placeholder="Search a Coin"
                id="form-search-token"
                onChange={(e) => search(e)}
              />
            </div>
            <div className="depo__token-list">
              {itemsShown.length ? (
                itemsShown.map((item, index) => (
                  <div
                    className="depo__token-list-item px-3 py-2 d-flex justify-between"
                    key={index}
                  >
                    <div
                      key={index}
                      className="d-flex align-center"
                      style={{ width: '100%' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!isRemoteToken) {
                          onSelect(item);
                        }
                      }}
                    >
                      <div className="depo__token-image mr-2">
                        <img
                          src={item.logoURI}
                          width={30}
                          height={30}
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
                      </div>
                    </div>
                    {isRemoteToken && (
                      <Button
                        className="bg-success"
                        onClick={() => {
                          setTokenToImport(item);
                          setOpenWarningModal(true);
                        }}
                      >
                        Import
                      </Button>
                    )}
                    {item.imported && <Button disabled>Added</Button>}
                  </div>
                ))
              ) : (
                <h5 className="text-center text-secondary">Token not found.</h5>
              )}
            </div>
            <div className="depo__token-list-footer">
              <Pagination
                size="small"
                total={filteredItems.length}
                showSizeChanger={false}
                pageSize={400}
                onChange={(index) => setPage(index - 1)}
              />
            </div>
          </div>
          <DepoModal open={openWarningModal}>
            <div className="bg-lightgrey rounded px-3 py-4">
              <h4 className="text-danger">Warning!</h4>
              <p className="text-secondary">
                Remember that anyone can create a token or a fake version of a
                token and <span className="text-success">DePo</span> will not be
                responsible for any damage to your assets.
              </p>
              <div className="d-flex justify-right">
                <Button
                  className="bg-danger"
                  onClick={() => {
                    setOpenWarningModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-success ml-3"
                  onClick={() => {
                    if (selectedTokenToImport)
                      importToken(selectedTokenToImport);
                    setOpenWarningModal(false);
                  }}
                >
                  I'm aware
                </Button>
              </div>
            </div>
          </DepoModal>
        </>
      )}
    </>
  );
};
