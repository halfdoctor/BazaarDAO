import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { media } from '@q-dev/q-ui-kit';
import { formatAsset } from '@q-dev/utils';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input';

import useApproveToken from 'hooks/useApproveToken';

import { useDaoStore } from 'store/dao/hooks';
import { useDaoVault } from 'store/dao-vault/hooks';
import { useTransaction } from 'store/transaction/hooks';
import { useUser } from 'store/user/hooks';

import { getDAOVaultDepositAmount } from 'contracts/helpers/dao-vault-helper';

import { amount, required } from 'utils/validators';

const StyledForm = styled.form`
  .transfer-form-main {
    margin-top: 16px;
    display: grid;
    gap: 16px;
  }

  .transfer-form-action {
    margin-top: 8px;

    ${media.lessThan('medium')} {
      width: 100%;
    }
  }
`;

function DepositForm () {
  const { t } = useTranslation();
  const { walletBalance, depositToVault, loadAllBalances } = useDaoVault();
  const { submitTransaction } = useTransaction();
  const { address } = useUser();
  const { tokenInfo } = useDaoStore();
  const { checkIsApprovalNeeded, approveSpendToken } = useApproveToken();

  const [maxAmount, setMaxAmount] = useState('0');
  const [canDeposit, setCanDeposit] = useState(false);

  const form = useForm({
    initialValues: { amount: '' },
    validators: { amount: [required, amount(maxAmount)] },
    onSubmit: ({ amount }) => {
      isDepositApprovalNeeded
        ? approveSpendToken()
        : submitTransaction({
          successMessage: t('DEPOSIT_INTO_VAULT_TX'),
          submitFn: () => depositToVault({ address: address, amount }),
          onSuccess: () => {
            form.reset();
            loadAllBalances();
          },
        });
    }
  });

  const updateMaxAmount = async () => {
    const depositAmount = await getDAOVaultDepositAmount(form.values.amount, walletBalance, tokenInfo);
    setCanDeposit(depositAmount.canDeposit);
    setMaxAmount(depositAmount.balance);
  };

  useEffect(() => {
    updateMaxAmount();
  }, [form.values.amount]);

  const isDepositApprovalNeeded = useMemo(() => {
    return checkIsApprovalNeeded(form.values.amount);
  }, [form.values.amount]);

  return (
    <StyledForm
      noValidate
      className="block"
    >
      <h2 className="text-h2">{t('DEPOSIT')}</h2>
      <p className="text-md color-secondary">{t('FROM_WALLET_TO_VAULT')}</p>

      <div className="transfer-form-main">
        <Input
          {...form.fields.amount}
          type="number"
          label={t('AMOUNT')}
          prefix={tokenInfo.symbol}
          hint={Number(maxAmount) > 0 && form.values.amount === maxAmount && !canDeposit
            ? t('WARNING_NO_Q_LEFT')
            : t('AVAILABLE_TO_TRANSFER', { amount: formatAsset(maxAmount, tokenInfo.symbol) })
          }
          max={maxAmount}
          placeholder="0.0"
        />

        <Button
          className="transfer-form-action"
          disabled={!form.isValid || !canDeposit}
          onClick={form.submit}
        >
          {isDepositApprovalNeeded ? t('APPROVE') : t('DEPOSIT')}
        </Button>
      </div>
    </StyledForm>
  );
}

export default DepositForm;
