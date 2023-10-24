import { useWeb3Context } from 'context/Web3ContextProvider';

import { chainIdToNetworkMap, networkConfigsMap, ORIGIN_NETWORK_NAME } from 'constants/config';

function useNetworkConfig () {
  const { chainId } = useWeb3Context();
  const networkName = chainIdToNetworkMap[chainId] || ORIGIN_NETWORK_NAME;

  return networkConfigsMap[networkName || ORIGIN_NETWORK_NAME];
}

export default useNetworkConfig;
