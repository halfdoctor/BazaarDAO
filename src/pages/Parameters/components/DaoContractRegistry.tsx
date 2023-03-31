import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import ParametersBlock from './ParametersBlock';

import { useParameters } from 'store/parameters/hooks';

import { contractRegistryInstance } from 'contracts/contract-instance';

function DaoContractRegistry () {
  const { t } = useTranslation();
  const {
    contractRegistry,
    contractRegistryLoading,
    contractRegistryError,
    getContractRegistry
  } = useParameters();
  useEffect(() => {
    getContractRegistry();
  }, []);

  return (
    <ParametersBlock
      title={t('DAO_CONTRACT_REGISTRY')}
      subtitle={`(${contractRegistryInstance?.address ?? '0x00'})`}
      parameters={contractRegistry}
      loading={contractRegistryLoading}
      errorMsg={contractRegistryError}
      emptyMsg={t('DAO_CONTRACT_REGISTRY_EMPTY_MSG')}
    />
  );
}

export default DaoContractRegistry;
