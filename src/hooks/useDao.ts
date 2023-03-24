
import { useLocation } from 'react-router-dom';

import { isAddress } from 'web3-utils';

import useNetworkConfig from './useNetworkConfig';

import { getMasterDaoRegistryInstance } from 'contracts/contract-instance';

function useDao () {
  const { pathname } = useLocation();
  const isDaoLoading = false;
  const pathDaoAddress = pathname.split('/')[1] || '';
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
