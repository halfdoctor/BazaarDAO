import { useSelector } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import constitution from './constitution/reducer';
import dao from './dao/reducer';
import daoToken from './dao-token/reducer';
import qVault from './dao-vault/reducer';
import expertPanels from './expert-panels/reducer';
import transaction from './transaction/reducer';

export const store = configureStore({
  reducer: {
    qVault,
    transaction,
    dao,
    expertPanels,
    constitution,
    daoToken
  },
});

export type AppState = ReturnType<typeof store.getState>;

export function useAppSelector<T> (selector: (state: AppState) => T) {
  return useSelector(selector);
}

export function getState () {
  return store.getState();
}
