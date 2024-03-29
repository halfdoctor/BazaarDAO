import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useWeb3Context } from 'context/Web3ContextProvider';

import { useConstitution } from 'store/constitution/hooks';
import { useDaoVault } from 'store/dao-vault/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { ZERO_HASH } from 'constants/boundaries';

export function useSignConstitution () {
  const { t } = useTranslation();

  const { constitutionHash } = useConstitution();
  const { signConstitution, loadConstitutionData, isConstitutionSigned } = useDaoVault();
  const { submitTransaction } = useTransaction();
  const { address: accountAddress } = useWeb3Context();

  const isConstitutionSignNeeded = useMemo(() => {
    return Boolean(accountAddress) && !isConstitutionSigned && constitutionHash !== ZERO_HASH;
  }, [isConstitutionSigned, constitutionHash]);

  const sendSignConstitution = () => {
    submitTransaction({
      successMessage: t('SIGN_CONSTITUTION_TX'),
      submitFn: signConstitution,
      onSuccess: () => {
        loadConstitutionData();
      },
    });
  };

  return {
    isConstitutionSignNeeded,
    loadConstitutionData,
    signConstitution: sendSignConstitution
  };
}
