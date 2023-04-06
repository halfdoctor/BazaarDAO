
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import useNetworkConfig from './useNetworkConfig';

import { getMasterDaoRegistryInstance } from 'contracts/contract-instance';

import { isAddress } from 'utils/web3';

function useDao () {
  const { pathname } = useLocation();
  const isDaoLoading = false;
  const pathDaoAddress = useMemo(() => pathname.split('/')[1] || '', [pathname]);
  const isDaoPage = isAddress(pathDaoAddress);
  const { masterDaoRegistryAddress } = useNetworkConfig();

  function composeDaoLink (path: string) {
    return `/${pathDaoAddress}${path}`;
  }

  const searchDaoAddress = async (address: string) => {
    const masterDaoRegistryInstance = getMasterDaoRegistryInstance(masterDaoRegistryAddress);
    return masterDaoRegistryInstance.instance.methods.containsPool('DAO_REGISTRY', address.toLowerCase()).call();
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
