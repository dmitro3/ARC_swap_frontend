import {
  MdAccountBalanceWallet,
  MdDashboard,
  MdOutlineSwapCalls,
  MdSync,
  MdPoll,
  MdSettings,
  MdBarChart,
} from 'react-icons/md';
import { FaSwimmingPool, FaTractor, FaUserFriends } from 'react-icons/fa';
import { AiOutlineAreaChart, AiOutlineSearch } from 'react-icons/ai';
import { IoMdWallet } from 'react-icons/io';
import { BsFillXDiamondFill } from 'react-icons/bs';

import { FiatOnRampIcon } from '../../../assets/icons';

export const DappItems = [
  {
    key: 1,
    title: 'Home',
    icon: MdDashboard,
    path: 'https://depo.io',
    protected: false,
  },
  {
    key: 2,
    title: 'Dashboard',
    icon: MdAccountBalanceWallet,
    path: '/dashboard',
    protected: true,
  },
  {
    key: 3,
    title: 'Market',
    icon: MdPoll,
    path: '/market',
    protected: false,
    children: [
      {
        title: 'Spot',
        key: 3.1,
        icon: MdPoll,
        path: '/market/spot',
        protected: false,
      },
      {
        title: 'Future',
        key: 3.2,
        icon: MdPoll,
        path: '/market/future',
        protected: false,
      },
    ],
  },
  {
    key: 4,
    title: 'Swap',
    icon: MdSync,
    path: '/swap',
    protected: false,
  },
  {
    key: 5,
    title: 'Pools',
    icon: FaSwimmingPool,
    path: '/pools',
    protected: false,
  },
  {
    key: 6,
    title: 'Farm',
    icon: FaTractor,
    path: '/farm',
    protected: false,
  },
  {
    key: 7,
    title: 'Fiat on-ramp',
    icon: FiatOnRampIcon,
    path: '/fiat-on-ramp',
    protected: false,
  },
  {
    key: 8,
    title: 'Bridge',
    icon: MdOutlineSwapCalls,
    path: '/bridge',
    protected: false,
  },
  {
    key: 9,
    title: 'Account',
    icon: MdSettings,
    path: '/account',
    protected: true,
  },
];

export const NFTItems = [
  {
    key: 1,
    title: 'DeFi',
    icon: MdBarChart,
    path: '/',
    protected: false,
  },
  {
    key: 2,
    title: 'Overview',
    icon: IoMdWallet,
    path: '/nft',
    protected: false,
  },
  {
    key: 3,
    title: 'Explore',
    icon: AiOutlineSearch,
    path: '/nft/explore',
    protected: false,
  },
  {
    key: 4,
    title: 'Collection',
    icon: BsFillXDiamondFill,
    path: '/nft/collections',
    protected: false,
  },
  {
    key: 5,
    title: 'Creators',
    icon: FaUserFriends,
    path: '/nft/creators',
    protected: false,
  },
  {
    key: 6,
    title: 'Stats',
    icon: AiOutlineAreaChart,
    path: '/nft/stats',
    protected: false,
    children: [
      {
        title: 'Rankings',
        key: 6.1,
        path: '/nft/stats/rankings',
        protected: false,
      },
      {
        title: 'Activity',
        key: 6.2,
        path: '/nft/stats/activity',
        protected: false,
      },
    ],
  },
];
