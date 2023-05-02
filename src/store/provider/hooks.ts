import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { UseProvider } from 'typings';

import { setProvider } from './reducer';

import { useAppSelector } from 'store';

import { chainIdToNetworkMap } from 'constants/config';
import { captureError } from 'utils/errors';

export function useProviderStore () {
  const dispatch = useDispatch();
  const currentProvider: UseProvider | null = useAppSelector(({ provider }) => provider.currentProvider);
  const isRightNetwork = useAppSelector(({ provider }) => Boolean(provider.currentProvider?.chainId &&
    chainIdToNetworkMap[provider.currentProvider?.chainId]));
  const userAddress = useAppSelector(({ provider }) => provider.currentProvider?.selectedAddress || '');

  async function setProviderValue (provider: UseProvider) {
    try {
      dispatch(setProvider(provider));
    } catch (error) {
      captureError(error);
    }
  }

  return {
    currentProvider,
    isRightNetwork,
    userAddress,

    setProviderValue: useCallback(setProviderValue, []),

  };
}
