import { LeftOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Grid } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// import logoImg from '../../assets/logo.svg';
import logoImg from '../../assets/icons/ARC_icon.svg';
import { AuthContext } from '../../contexts/AuthProvider';
import { DappItems, NFTItems } from './util/menu-items';

const { Sider } = Layout;

const NavbarLeft: React.FC<{ collapsed: boolean; onClose: () => void }> = ({
  collapsed,
  onClose,
}) => {
  const { pathname } = useLocation();
  const breakpoints = Grid.useBreakpoint();
  const { isAuthenticated } = useContext(AuthContext);
  const [selectedPageKey, setSelectedPageKey] = useState('');
  const [openKey, setOpenKey] = useState('');
  const isNFTRoute = pathname.startsWith('/nft');
  const menuItems = isNFTRoute ? NFTItems : DappItems;

  useEffect(() => {
    const menuItem = menuItems.find((item) => item.path.includes(pathname));
    if (menuItem) {
      setSelectedPageKey(menuItem.key.toString());
      setOpenKey('');
    } else if (pathname.includes('market')) {
      setOpenKey('3');
      setSelectedPageKey(pathname.includes('spot') ? '3.1' : '3.2');
    } else if (pathname.includes('/nft/stats')) {
      setOpenKey('6');
      setSelectedPageKey(pathname.includes('rankings') ? '6.1' : '6.2');
    }
  }, [pathname]);

  return (
    <Sider
      breakpoint="xl"
      collapsedWidth={0}
      collapsible
      collapsed={collapsed}
      className="sider"
    >
      {!breakpoints.xl && (
        <div className="mt-2 d-flex align-items-center justify-content-center">
          <Button
            className="bg-dark"
            icon={<LeftOutlined />}
            onClick={onClose}
          />
        </div>
      )}

      <Menu
        mode="inline"
        selectedKeys={[selectedPageKey]}
        openKeys={openKey ? [openKey] : undefined}
        className="menu"
      >
        {menuItems.map(
          (item) =>
            (isAuthenticated === item.protected || !item.protected) &&
            (item.children ? (
              <Menu.SubMenu
                key={item.key}
                icon={<item.icon size={24} />}
                title={item.title}
              >
                {item.children.map((subItem) => (
                  <Menu.Item
                    className="depo_subMenu_item"
                    key={subItem.key}
                    style={{ marginLeft: '20px', marginTop: '-10px' }}
                  >
                    <Link to={subItem.path}>{subItem.title}</Link>
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            ) : (
              item.title && (
                <Menu.Item key={item.key} icon={<item.icon size={24} />}>
                  {item.key === 1 && !isNFTRoute ? (
                    <a href={item.path} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  ) : (
                    <Link to={item.path}>{item.title}</Link>
                  )}
                </Menu.Item>
              )
            )),
        )}
      </Menu>
      <div className="logoContent">
        <img
          style={{ marginBottom: 10, width: '60px' }}
          src={logoImg}
          className="normalLogo"
          alt="ARC"
        />
        <p>Alpha v0.4.1</p>
      </div>
    </Sider>
  );
};

export default NavbarLeft;
