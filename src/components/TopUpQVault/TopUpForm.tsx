import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { Tip } from '@q-dev/q-ui-kit';
import { formatAsset } from '@q-dev/utils';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input';

import { useQVault } from 'store/q-vault/hooks';
import { useTransaction } from 'store/transaction/hooks';
import { useUser } from 'store/user/hooks';

import { getQVaultDepositAmount } from 'contracts/helpers/q-vault-helper';

import { amount, required } from 'utils/validators';

const StyledForm = styled.form`
  display: grid;
  gap: 16px;

  .top-up-form-btn {
    width: 100%;
  }
`;

function TopUpForm ({ onSubmit }: { onSubmit: () => void }) {
  const { t } = useTranslation();
  const { walletBalance, depositToVault } = useQVault();
  const { submitTransaction } = useTransaction();
  const user = useUser();

  const [maxAmount, setMaxAmount] = useState('0');

  const form = useForm({
    initialValues: { amount: '' },
    validators: {
      amount: [required, amount(maxAmount)],
    },
    onSubmit: (form) => {
      submitTransaction({
        successMessage: t('TRANSFER_INTO_Q_VAULT_TX'),
        submitFn: () => depositToVault({ address: user.address, amount: form.amount }),
        onSuccess: () => onSubmit()
      });
    }
  });

  const updateMaxAmount = async () => {
    const depositAmount = await getQVaultDepositAmount(user.address);
    setMaxAmount(Number(depositAmount) < 0 ? '0' : String(depositAmount));
  };

  useEffect(() => {
    updateMaxAmount();
  }, [walletBalance]);

  return (
    <StyledForm
      noValidate
      className="top-up-form"
      onSubmit={form.submit}
    >
      {Number(maxAmount) > 0 && form.values.amount === maxAmount && (
        <Tip compact type="warning">
          {t('MAX_TRANSFER_AMOUNT_WARNING')}
        </Tip>
      )}

      <Input
        {...form.fields.amount}
        label={t('AMOUNT')}
        max={maxAmount}
        placeholder={t('AMOUNT_TO_TRANSFER')}
        hint={t('AVAILABLE_AMOUNT', { amount: formatAsset(maxAmount, 'Q') })}
      />

      <Button
        type="submit"
        className="top-up-form-btn"
        disabled={!form.isValid}
      >
        {t('TRANSFER')}
      </Button>
    </StyledForm>
  );
}

export default TopUpForm;
