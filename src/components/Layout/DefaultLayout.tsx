import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Layout, Grid } from 'antd';

import PageTransition from '../Transition/PageTransition';
import NavbarLeft from '../Navbar/NavbarLeft';
import DefaultHeader from '../Header/DefaultHeader';

const { Header, Content } = Layout;

const DefaultLayout: React.FC = ({ children }) => {
  const breakpoints = Grid.useBreakpoint();
  const history = useHistory();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    const unlisten = history.listen(() =>
      setIsCollapsed(breakpoints.xl !== true),
    );

    return () => unlisten();
  }, [history, breakpoints]);

  useEffect(() => {
    setIsCollapsed(breakpoints.xl !== true);
  }, [breakpoints]);

  return (
    <Layout className="layout">
      <NavbarLeft collapsed={isCollapsed} onClose={toggleNavbar} />
      <div className="page-wrapper">
        <Header className="header">
          <DefaultHeader onMenuClick={toggleNavbar} />
        </Header>
        <PageTransition type="fade">
          <Content className="container-xl content-wrapper">{children}</Content>
        </PageTransition>
      </div>
    </Layout>
  );
};

export default DefaultLayout;
