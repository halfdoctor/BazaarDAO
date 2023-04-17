import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { media, Select } from '@q-dev/q-ui-kit';
import { formatAsset } from '@q-dev/utils';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input';

import { useDaoStore } from 'store/dao/hooks';
import { useDaoVault } from 'store/dao-vault/hooks';
import { useTransaction } from 'store/transaction/hooks';
import { useUser } from 'store/user/hooks';

import { amount, required } from 'utils/validators';

const StyledForm = styled.form`
  .withdraw-form-main {
    margin-top: 16px;
    display: grid;
    gap: 16px;
  }

  .withdraw-form-action {
    margin-top: 8px;

    ${media.lessThan('medium')} {
      width: 100%;
    }
  }
`;

function WithdrawForm () {
  const { t } = useTranslation();
  const { submitTransaction } = useTransaction();
  const { withdrawFromVault, withdrawalBalance, loadAllBalances, withdrawalNftsList } = useDaoVault();
  const { address } = useUser();
  const { tokenInfo } = useDaoStore();

  const form = useForm({
    initialValues: {
      amount: '',
      id: ''
    },
    validators: {
      amount: tokenInfo.isErc721 ? [] : [required, amount(withdrawalBalance)],
      id: tokenInfo.isErc721 ? [required] : []
    },
    onSubmit: ({ amount, id }) => {
      submitTransaction({
        successMessage: t('WITHDRAW_FROM_VAULT_TX'),
        submitFn: async () => withdrawFromVault({ amount, address, erc721Id: id }),
        onSuccess: async () => {
          form.reset();
          await loadAllBalances();
        },
      });
    }
  });

  return (
    <StyledForm
      noValidate
      className="block"
    >
      <h2 className="text-h2">{t('WITHDRAW')}</h2>
      <p className="text-md color-secondary">{t('FROM_VAULT_TO_WALLET')}</p>

      <div className="withdraw-form-main">
        {tokenInfo.isErc721
          ? <Select
            {...form.fields.id}
            label={t('NFT_ID')}
            options={withdrawalNftsList.map(item => ({ value: item, label: item }))}
            hint={t('AVAILABLE_TO_WITHDRAW', { amount: withdrawalNftsList.length })}
            placeholder={t('NFT_ID')}
          />
          : <Input
            {...form.fields.amount}
            type="number"
            label={t('AMOUNT')}
            prefix={tokenInfo.symbol}
            max={String(withdrawalBalance)}
            placeholder="0.0"
            hint={t('AVAILABLE_TO_WITHDRAW', { amount: formatAsset(withdrawalBalance, tokenInfo.symbol) })}
          />
        }
        <Button
          type="submit"
          className="withdraw-form-action"
          disabled={!form.isValid}
          onClick={form.submit}
        >
          {t('WITHDRAW')}
        </Button>
      </div>
    </StyledForm>
  );
}

export default WithdrawForm;
