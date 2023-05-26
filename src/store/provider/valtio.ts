
import { UseProvider } from 'typings';
import { proxy, useSnapshot } from 'valtio';

import { chainIdToNetworkMap } from 'constants/config';

const state = proxy({
  currentProvider: null as UseProvider | null,
  get isRightNetwork () {
    const chainId = state.currentProvider?.chainId;
    return Boolean(chainId && chainIdToNetworkMap[chainId]);
  },
  get userAddress () {
    return state.currentProvider?.selectedAddress || '';
  },
});

export function useProviderStore () {
  return useSnapshot(state);
}
