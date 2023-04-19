
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { useWeb3Context } from 'context/Web3ContextProvider';
import { isAddress } from 'helpers';

import useNetworkConfig from './useNetworkConfig';

import { getMasterDaoRegistryInstance } from 'contracts/contract-instance';

function useDao () {
  const { pathname } = useLocation();
  const { masterDaoRegistryAddress } = useNetworkConfig();
  const { currentProvider } = useWeb3Context();
  const isDaoLoading = false;
  const pathDaoAddress = useMemo(() => pathname.split('/')[1] || '', [pathname]);
  const isDaoPage = isAddress(pathDaoAddress);

  function composeDaoLink (path: string) {
    return `/${pathDaoAddress}${path}`;
  }

  const searchDaoAddress = async (address: string) => {
    if (!currentProvider.currentProvider) return;
    const masterDaoRegistryInstance = getMasterDaoRegistryInstance(
      masterDaoRegistryAddress, currentProvider.currentProvider
    );

    return masterDaoRegistryInstance.instance.containsPool('DAO_REGISTRY', address.toLowerCase());
  };

  return {
    pathDaoAddress,
    isDaoLoading,
    isDaoPage,
    composeDaoLink,
    searchDaoAddress
  };
}

export default useDao;
