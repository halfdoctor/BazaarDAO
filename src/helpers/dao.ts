
import { DAO_REGISTRY_NAME, MasterDAORegistryInstance } from '@q-dev/gdk-sdk';
import { providers } from 'ethers';
import { ErrorHandler, isAddress } from 'helpers';

import { chainIdToNetworkMap, networkConfigsMap, NetworkName } from 'constants/config';

export const getDaoSupportedNetworks = async (address: string) => {
  try {
    if (!isAddress(address)) { return []; }
    const availableNetworks = Object.keys(networkConfigsMap) as NetworkName[];
    const daoInfo = await Promise.all(
      availableNetworks.map(async (name) => {
        const currentNetworkConfig = networkConfigsMap[name];
        try {
          const currentProvider = new providers.JsonRpcProvider(currentNetworkConfig.rpcUrl);
          const masterDaoRegistry = new MasterDAORegistryInstance(
            currentProvider, currentNetworkConfig.masterDaoRegistryAddress
          );
          const check = await masterDaoRegistry.instance
            .containsPool(DAO_REGISTRY_NAME, address.toLowerCase());
          return { isDaoExist: check, chainId: currentNetworkConfig.chainId };
        } catch (_) {
          return { isDaoExist: false, chainId: currentNetworkConfig.chainId };
        }
      })
    );
    return daoInfo;
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error);
    return [];
  }
};

export const checkDaoInRegistry = async (
  address: string,
  chainId: number,
  provider?: providers.Web3Provider | providers.JsonRpcProvider,
) => {
  try {
    if (!provider) return false;
    const { masterDaoRegistryAddress } = networkConfigsMap[chainIdToNetworkMap[chainId]];
    const masterDaoRegistry = new MasterDAORegistryInstance(provider, masterDaoRegistryAddress);
    const check = await masterDaoRegistry.instance.containsPool(DAO_REGISTRY_NAME, address);
    return check;
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error);
    return false;
  }
};
