import { useUser } from 'store/user/hooks';

import { chainIdToNetworkMap, networkConfigsMap, ORIGIN_NETWORK_NAME } from 'constants/config';

function useNetworkConfig () {
  const { chainId } = useUser();
  const network = chainIdToNetworkMap[chainId] || ORIGIN_NETWORK_NAME;
  return networkConfigsMap[network];
}

export default useNetworkConfig;
