import { useWeb3Context } from 'context/Web3ContextProvider';

import { chainIdToNetworkMap, networkConfigsMap, ORIGIN_NETWORK_NAME } from 'constants/config';

function useNetworkConfig () {
  const { currentProvider } = useWeb3Context();

  const network = chainIdToNetworkMap[currentProvider?.chainId] || ORIGIN_NETWORK_NAME;
  return networkConfigsMap[network];
}

export default useNetworkConfig;
