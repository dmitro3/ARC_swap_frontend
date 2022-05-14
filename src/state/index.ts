import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import farmsReducer from './farms';
import jungleFarmsReducer from './jungleFarms';

const store = configureStore({
  reducer: {
    farms: farmsReducer,
    jungleFarms: jungleFarmsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
