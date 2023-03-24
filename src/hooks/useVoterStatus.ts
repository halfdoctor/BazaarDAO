import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDaoVault } from 'store/dao-vault/hooks';
import { useExperts } from 'store/experts/hooks';
import { useUser } from 'store/user/hooks';

function useVoterStatus () {
  const { t, i18n } = useTranslation();

  const { vaultBalance, loadVaultBalance } = useDaoVault();
  const {
    isEpdrMember,
    isEpqfiMember,
    isEprsMember,
    checkEpdrMembership,
    checkEpqfiMembership,
    checkEprsMembership,
  } = useExperts();
  const { address } = useUser();

  useEffect(() => {
    loadVaultBalance();
    checkEpdrMembership();
    checkEpqfiMembership();
    checkEprsMembership();
  }, [address]);

  const status = useMemo(() => {
    const status = [
      { title: t('Q_TOKEN_HOLDER'), isTrue: Number(vaultBalance) > 0 },
      { title: t('DEFI_RISK_EXPERT'), isTrue: isEpdrMember },
      { title: t('FEES_INCENTIVE_EXPERT'), isTrue: isEpqfiMember },
      { title: t('Q_ROOT_NODE_SELECTION_EXPERT'), isTrue: isEprsMember }
    ];
    const statuses = status.filter((value) => value.isTrue);
    if (!statuses.length) {
      return t('NONE');
    } else {
      return statuses.map((value) => value.title).join(', ');
    }
  }, [
    vaultBalance,
    isEpdrMember,
    isEpqfiMember,
    isEprsMember,
    i18n.language
  ]);

  return status;
}

export default useVoterStatus;
