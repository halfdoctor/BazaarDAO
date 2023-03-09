import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { Range } from '@q-dev/q-ui-kit';
import { formatAsset, formatNumber, toBigNumber } from '@q-dev/utils';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input';

import { useQVault } from 'store/q-vault/hooks';
import { useTransaction } from 'store/transaction/hooks';
import { useUser } from 'store/user/hooks';

import { max, required } from 'utils/validators';

const StyledForm = styled.form`
  display: grid;
  gap: 16px;

  .lock-form-submit {
    margin-top: 16px;
    width: 100%;
  }
`;

function LockForm ({ onSubmit }: { onSubmit: () => void }) {
  const { t } = useTranslation();
  const { submitTransaction } = useTransaction();
  const { vaultBalance, votingWeight, lockAmount, unlockAmount } = useQVault();
  const user = useUser();

  const form = useForm({
    initialValues: { amount: votingWeight },
    validators: { amount: [required, max(vaultBalance)] },
    onSubmit: (form) => {
      submitTransaction({
        successMessage: t('UPDATE_LOCK_AMOUNT_TX'),
        onSuccess: () => onSubmit(),
        submitFn: () => {
          const delta = toBigNumber(form.amount).minus(toBigNumber(votingWeight));
          const opts = {
            address: user.address,
            amount: delta.abs().toString(),
          };

          return delta.gt(0) ? lockAmount(opts) : unlockAmount(opts);
        }
      });
    }
  });

  useEffect(() => {
    form.fields.amount.onChange(votingWeight);
  }, [votingWeight]);

  const handleRangeChange = (_: string, val: string) => {
    const weightToSet = toBigNumber(val).decimalPlaces(0).gte(toBigNumber(vaultBalance).decimalPlaces(0))
      ? vaultBalance
      : toBigNumber(val).decimalPlaces(0).toString();

    if (form.values.amount === weightToSet) return;
    form.fields.amount.onChange(weightToSet);
  };

  const percentValue = toBigNumber(form.values.amount || 0)
    .dividedBy(vaultBalance)
    .multipliedBy(100)
    .toString();

  return (
    <StyledForm noValidate onSubmit={form.submit}>
      <Input
        {...form.fields.amount}
        type="number"
        prefix="Q"
        label={t('LOCKED_AMOUNT')}
        placeholder="0.0"
        maxLength={10}
        max={vaultBalance}
        hint={`${t('CURRENT_LOCKED_AMOUNT')} ${formatNumber(votingWeight, 4)} Q`}
      />

      <Range
        hideInput
        value={Number(form.values.amount) ? percentValue : '0'}
        absoluteValue={form.values.amount}
        max={vaultBalance}
        formatter={(value) => formatAsset(value, 'Q')}
        onChange={handleRangeChange}
      />

      <Button
        type="submit"
        className="lock-form-submit"
        disabled={!form.isValid || form.values.amount === votingWeight}
      >
        {t('UPDATE_LOCK_AMOUNT')}
      </Button>
    </StyledForm>
  );
}

export default LockForm;
