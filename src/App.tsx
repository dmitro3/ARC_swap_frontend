import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Routes from './routes';

import './App.scss';

import './styles/global.scss';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes />
  </BrowserRouter>
);
export default App;
