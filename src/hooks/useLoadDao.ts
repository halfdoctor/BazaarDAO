
import { useCallback } from 'react';

import { useWeb3Context } from 'context/Web3ContextProvider';

import { useDaoStore } from 'store/dao/hooks';
import { useDaoVault } from 'store/dao-vault/hooks';
import { useExpertPanels } from 'store/expert-panels/hooks';

function useLoadDao () {
  const { currentProvider } = useWeb3Context();

  const { loadAllDaoInfo } = useDaoStore();
  const { loadAllBalances } = useDaoVault();
  const { loadExpertPanels } = useExpertPanels();

  const loadAdditionalInfo = async () => {
    await loadAllDaoInfo();
    await Promise.allSettled([
      loadAllBalances(),
      loadExpertPanels()
    ]);
  };

  return {
    loadAdditionalInfo: useCallback(loadAdditionalInfo, [currentProvider])
  };
}

export default useLoadDao;
