import { useLocation } from 'react-router';

import useNetworkConfig from './useNetworkConfig';

import { getMasterDaoRegistryInstance } from 'contracts/contract-instance';

function useDao () {
  const { pathname } = useLocation();
  const isDaoLoading = false;
  const daoAddress = pathname.split('/')[1] || '';
  const isDaoPage = /\/0x[a-fA-F0-9]{40}\.*/.test(pathname);
  const { masterDaoRegistryAddress } = useNetworkConfig();
  const masterDaoRegistryInstance = getMasterDaoRegistryInstance(masterDaoRegistryAddress);

  function composeDaoLink (path: string) {
    return `/${daoAddress}${path}`;
  }

  const searchDaoAddress = async (address: string) => {
    return await masterDaoRegistryInstance.instance.methods.containsPool('DAO_REGISTRY', address.toLowerCase()).call();
  };

  return {
    daoAddress,
    isDaoLoading,
    isDaoPage,
    composeDaoLink,
    searchDaoAddress
  };
}

export default useDao;
