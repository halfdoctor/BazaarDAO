import { useTranslation } from 'react-i18next';

import { toBigNumber } from '@q-dev/utils';

import useDao from './useDao';

import { useDaoStore } from 'store/dao/hooks';
import { useTransaction } from 'store/transaction/hooks';

function useApproveToken () {
  const { submitTransaction } = useTransaction();
  const { t } = useTranslation();
  const { tokenInfo, approveToken, loadAllDaoInfo } = useDaoStore();
  const { pathDaoAddress } = useDao();

  const checkIsApprovalNeeded = (spendTokenAmount: string | number) => {
    return !tokenInfo.isNative && (toBigNumber(tokenInfo.allowance).isLessThanOrEqualTo(0) ||
        toBigNumber(spendTokenAmount).isGreaterThanOrEqualTo(tokenInfo.allowance));
  };

  const approveSpendToken = () => {
    submitTransaction({
      successMessage: t('APPROVE_SPENDING_TOKENS'),
      submitFn: () => approveToken(),
      onSuccess: () => loadAllDaoInfo(pathDaoAddress)
    });
  };

  return {
    approveSpendToken,
    checkIsApprovalNeeded,
  };
}

export default useApproveToken;
