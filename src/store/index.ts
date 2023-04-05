import { useSelector } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import constitution from './constitution/reducer';
import dao from './dao/reducer';
import qVault from './dao-vault/reducer';
import expertPanels from './expert-panels/reducer';
import experts from './experts/reducer';
import transaction from './transaction/reducer';
import user from './user/reducer';

export const store = configureStore({
  reducer: {
    user,
    qVault,
    transaction,
    experts,
    dao,
    expertPanels,
    constitution
  }
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
