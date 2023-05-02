import { useTranslation } from 'react-i18next';

import { toBigNumber } from '@q-dev/utils';

import useLoadDao from './useLoadDao';

import { useDaoTokenStore } from 'store/dao-token/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { toWeiWithDecimals } from 'utils/numbers';

function useApproveToken () {
  const { submitTransaction } = useTransaction();
  const { t } = useTranslation();
  const { tokenInfo, approveToken } = useDaoTokenStore();
  const { loadAdditionalInfo } = useLoadDao();

  const checkIsApprovalNeeded = (spendTokenAmount: string | number) => {
    return !tokenInfo || (!tokenInfo.isNative && (toBigNumber(tokenInfo.allowance).isLessThanOrEqualTo(0) ||
        toBigNumber(toWeiWithDecimals(spendTokenAmount, tokenInfo.decimals)).isGreaterThan(tokenInfo.allowance)));
  };

  const approveSpendToken = () => {
    submitTransaction({
      successMessage: t('APPROVE_SPENDING_TOKENS'),
      submitFn: () => approveToken(),
      onSuccess: () => loadAdditionalInfo()
    });
  };

  return {
    approveSpendToken,
    checkIsApprovalNeeded,
  };
}

export default useApproveToken;
