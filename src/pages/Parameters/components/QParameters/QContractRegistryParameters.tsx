import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useQuery } from '@apollo/client';
import { ParameterValue } from 'typings/parameters';

import { GET_VERIFIED_CONTRACTS_QUERY, GetVerifiedContractsData } from 'pages/Parameters/queries/verified-contracts';

import ParametersBlock from '../ParametersBlock';

import { useParameters } from 'store/parameters/hooks';

import { contractRegistryInstance } from 'contracts/contract-instance';
import { getContractOwner } from 'contracts/helpers/parameters-helper';

function QContractRegistryParameters () {
  const { t } = useTranslation();
  const {
    contractRegistry,
    contractRegistryLoading,
    contractRegistryError,
    getContractRegistry
  } = useParameters();

  const { data } = useQuery<GetVerifiedContractsData>(GET_VERIFIED_CONTRACTS_QUERY, {
    variables: { addresses: contractRegistry.map(item => item.value) },
    skip: !contractRegistry.length,
  });

  const [upgradeVoting, setUpgradeVoting] = useState('');

  useEffect(() => {
    getContractRegistry();
    getContractOwner('upgradeVoting').then(setUpgradeVoting);
    return () => setUpgradeVoting('');
  }, []);

  const contractRegistryList: ParameterValue[] = contractRegistry.map(item => ({
    ...item,
    verifiedName: data?.addresses?.find(a => a.hash.toLowerCase() === item.value.toLowerCase())?.smartContract?.name
  }));

  return (
    <ParametersBlock
      title={t('Q_CONTRACT_REGISTRY')}
      subtitle={`(${contractRegistryInstance?.address ?? '0x00'})`}
      parameters={contractRegistryList}
      gnosisSafeAddress={upgradeVoting}
      loading={contractRegistryLoading}
      errorMsg={contractRegistryError}
      emptyMsg={t('Q_CONTRACT_REGISTRY_EMPTY_MSG')}
    />
  );
}

export default QContractRegistryParameters;
