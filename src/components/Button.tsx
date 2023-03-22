import { HTMLAttributes, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button as UiButton } from '@q-dev/q-ui-kit';
import { ButtonLook } from '@q-dev/q-ui-kit/dist/components/Button/Button';
import { useWeb3Context } from 'context/Web3ContextProvider';

import { useDaoStore } from 'store/dao/hooks';
import { useTransaction } from 'store/transaction/hooks';

interface Props extends HTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset';
  look?: ButtonLook;
  disabled?: boolean;
  isCheckAllowance?: boolean;
  spendTokenAmount?: number;
  alwaysEnabled?: boolean;
  icon?: boolean;
  compact?: boolean;
  loading?: boolean;
  active?: boolean;
  block?: boolean;
}

function Button ({
  type,
  look,
  disabled,
  alwaysEnabled,
  isCheckAllowance,
  spendTokenAmount,
  icon,
  compact,
  loading,
  active,
  block,
  children,
  className,
  onClick,
  ...rest
}: Props) {
  const { isConnected, isRightNetwork } = useWeb3Context();
  const isDisabled = disabled ||
    (!alwaysEnabled && (!isConnected || !isRightNetwork));
  const { tokenInfo, approveToken, loadAllDaoInfo } = useDaoStore();
  const { submitTransaction } = useTransaction();
  const { t } = useTranslation();

  const isNeedApprove = useMemo(
    () => isCheckAllowance &&
      (Number(tokenInfo.allowance) <= 0 || Number(spendTokenAmount) > Number(tokenInfo.allowance)),
    [tokenInfo, isCheckAllowance]);

  const approveSpendToken = () => {
    submitTransaction({
      successMessage: t('APPROVE_SPENDING_TOKENS'),
      submitFn: () => approveToken(),
      onSuccess: () => loadAllDaoInfo()
    });
  };

  return (
    <UiButton
      className={className}
      type={type}
      block={block}
      disabled={isDisabled}
      look={look}
      icon={icon}
      compact={compact}
      loading={loading}
      active={active}
      onClick={isNeedApprove ? approveSpendToken : onClick}
      {...rest}
    >
      {children}
    </UiButton>
  );
}

export default Button;
