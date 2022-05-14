/* eslint-disable */
import React, { useState, useEffect, useContext } from 'react';
import { Pagination } from 'antd';

import { IProtocol } from '../../interfaces/IProtocol';

import { __debounce } from '../../utility/debounce';

import { AuthContext } from '../../contexts/AuthProvider';
import { Input } from 'antd';
import ScrollBar from 'react-perfect-scrollbar';

import './ListProtocol.scss';
import 'react-perfect-scrollbar/dist/css/styles.css';

export const ListProtocol: React.FC<{
  onSelect: Function;
  selected?: IProtocol | null;
}> = ({ onSelect, selected }) => {
  const { protocols } = useContext(AuthContext);

  const [itemsShown, setItemsShown] = useState([] as Array<IProtocol>);
  const [itemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchStr, setSearchStr] = useState('' as string);
  const [filteredItems, setFilteredItems] = useState(protocols);
  const [totalPages, setTotalPages] = useState(0);

  const search = ($e: any) => {
    __debounce(
      () => {
        const str = $e.target.value
          .replace(/(\[^a-zA-Z _\-0-9])/gim, '')
          .replace(/\s+/gim, ' ');
        setSearchStr(str.trim());
        setCurrentPage(0);
      },
      250,
      'set-search-str',
    );
  };

  useEffect(() => {
    if (filteredItems.length >= itemsPerPage) {
      const array = filteredItems.slice(0, itemsPerPage);
      setItemsShown(array.map((item) => item));
    } else {
      setItemsShown(filteredItems);
    }
    setTotalPages(Math.ceil(filteredItems.length / itemsPerPage));
  }, [filteredItems]);

  useEffect(() => {
    if (searchStr.length) {
      const rgx = new RegExp(searchStr.toLowerCase(), 'igm');
      const filtered = protocols.filter((a) =>
        a.title.toLowerCase().match(rgx),
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(protocols);
    }
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
    setPage(0);
  }, [itemsPerPage]);

  const markup = (str: string) => {
    if (searchStr.length) {
      const rgx = new RegExp(`(${searchStr.toLowerCase()})`, 'igm');
      return str.replace(rgx, `<mark>$1</mark>`);
    } else return str;
  };

  return (
    <>
      <div className="depo__protocol-list-wrapper flex-column wrap-content rounded">
        <div className="depo__protocol-list">
          <div className="depo__protocol-list-item search-input mt-0">
            <Input
              placeholder="Search a protocol"
              id="form-search-token"
              onChange={(e) => search(e)}
            />
          </div>
          <ScrollBar>
            <div
              className="depo__protocol-list-item"
              onClick={() => {
                onSelect(null);
              }}
            >
              <div className="depo__protocol-image">
                {/* <img src={item.img} height={30} /> */}
              </div>
              <span className="depo__protocol-title">Auto (best trade)</span>
            </div>
            {itemsShown.map((item, index) => {
              return (
                <div
                  className="depo__protocol-list-item"
                  onClick={() => {
                    onSelect(item);
                  }}
                  key={index}
                >
                  <div className="depo__protocol-image">
                    <img src={item.img} height={30} />
                  </div>
                  <span
                    className="depo__protocol-title"
                    dangerouslySetInnerHTML={{
                      __html:
                        markup(item.title) +
                        `${
                          selected?.id === item.id
                            ? ' <small>(current)</small>'
                            : ''
                        }`,
                    }}
                  ></span>
                </div>
              );
            })}
            <div className="depo__protocol-list-item rounded-bottom mt-0 py-4 no-hover">
              {/* PETEQUINHA BRASILEIRA */}
            </div>
          </ScrollBar>
        </div>
        <div className="depo__protocol-list-footer">
          <Pagination
            size="small"
            total={filteredItems.length}
            showSizeChanger={false}
            pageSize={25}
            onChange={(index) => setPage(index - 1)}
          />
        </div>
      </div>
    </>
  );
};
