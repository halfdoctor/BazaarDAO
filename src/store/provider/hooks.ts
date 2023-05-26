import { UseProvider } from 'typings';
import { proxy, ref, useSnapshot } from 'valtio';

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

export const providerStore = state as Readonly<typeof state>;

export function useProviderStore () {
  return useSnapshot(state);
}

export function setProvider (provider: UseProvider) {
  state.currentProvider = ref(provider);
}
