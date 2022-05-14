/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Provider } from 'react-redux';
import { Redirect, Switch } from 'react-router-dom';

import DefaultLayout from '../components/Layout/DefaultLayout';
import Account from '../pages/Account/account';
import Dashboard from '../pages/Dashboard/dashboard';
import Farm from '../pages/Farm/farm';
import FiatOnRamp from '../pages/FiatOnRamp';
import Liquidity from '../pages/Liquidity/liquidity';
import MarketDetails from '../pages/MarketDetails/marketDetails';
import MarketOverview from '../pages/MarketOverview/marketOverview';
import Swap from '../pages/Swap/swap';
import Bridge from '../pages/Bridge';

import store from '../state';
import Route from './Route';

const Routes: React.FC = () => (
  <Provider store={store}>
    <DefaultLayout>
      <Switch>
        <Redirect from="/" to="/swap" exact />
        <Route path="/dashboard" component={Dashboard} isPrivate />
        <Route path="/market/:type" component={MarketOverview} />
        <Route
          path="/market-details/:routeInfos"
          exact
          component={MarketDetails}
        />
        <Route path="/fiat-on-ramp" component={FiatOnRamp} />
        <Route path="/swap" component={Swap} />
        <Route path="/farm" component={Farm} />
        <Route path="/pools" component={Liquidity} />
        <Route path="/bridge" component={Bridge} />
        <Route path="/account" component={Account} isPrivate />
        <Redirect from="/nft" to="/swap" exact />
      </Switch>
    </DefaultLayout>
  </Provider>
);

export default Routes;
