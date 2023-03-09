import { useSelector } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import experts from './experts/reducer';
import parameters from './parameters/reducer';
import proposals from './proposals/reducer';
import qVault from './q-vault/reducer';
import transaction from './transaction/reducer';
import user from './user/reducer';

export const store = configureStore({
  reducer: {
    user,
    qVault,
    proposals,
    transaction,
    experts,
    parameters,
  },
});

export type AppState = ReturnType<typeof store.getState>;

export function useAppSelector<T> (selector: (state: AppState) => T) {
  return useSelector(selector);
}

export function getState () {
  return store.getState();
}

export function getUserAddress () {
  return getState().user.address;
}
