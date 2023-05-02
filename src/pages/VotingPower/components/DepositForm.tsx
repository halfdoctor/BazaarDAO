import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { media, Select } from '@q-dev/q-ui-kit';
import { formatAsset } from '@q-dev/utils';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input';

import useApproveToken from 'hooks/useApproveToken';

import { useDaoTokenStore } from 'store/dao-token/hooks';
import { useDaoVault } from 'store/dao-vault/hooks';
import { useProviderStore } from 'store/provider/hooks';
import { useTransaction } from 'store/transaction/hooks';

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
  const { walletBalance, depositToVault, loadAllBalances, walletNftsList, chainBalance } = useDaoVault();
  const { submitTransaction } = useTransaction();
  const { currentProvider } = useProviderStore();
  const { tokenInfo } = useDaoTokenStore();
  const { checkIsApprovalNeeded, approveSpendToken } = useApproveToken();

  const [maxAmount, setMaxAmount] = useState('0');
  const [canDeposit, setCanDeposit] = useState(false);

  const form = useForm({
    initialValues: {
      amount: '',
      id: ''
    },
    validators: {
      amount: tokenInfo?.isErc721 ? [] : [required, amount(maxAmount)],
      id: tokenInfo?.isErc721 ? [required] : []
    },
    onSubmit: ({ amount, id }) => {
      isDepositApprovalNeeded
        ? approveSpendToken()
        : submitTransaction({
          successMessage: t('DEPOSIT_INTO_VAULT_TX'),
          submitFn: () => depositToVault({ address: currentProvider?.selectedAddress, amount, erc721Id: id }),
          onSuccess: () => {
            form.reset();
            loadAllBalances();
          },
        });
    }
  });

  const updateMaxAmount = async () => {
    const depositAmount = await getDAOVaultDepositAmount(form.values.amount, walletBalance, chainBalance, tokenInfo);
    setCanDeposit(depositAmount.canDeposit);
    setMaxAmount(depositAmount.balance);
  };

  useEffect(() => {
    updateMaxAmount();
  }, [form.values.amount, tokenInfo, walletBalance]);

  const isDepositApprovalNeeded = useMemo(() => {
    return tokenInfo?.isErc721 ? !tokenInfo?.isErc721Approved : checkIsApprovalNeeded(form.values.amount);
  }, [form.values.amount, tokenInfo]);

  return (
    <StyledForm
      noValidate
      className="block"
    >
      <h2 className="text-h2">{t('DEPOSIT')}</h2>
      <p className="text-md color-secondary">{t('FROM_WALLET_TO_VAULT')}</p>

      <div className="transfer-form-main">
        {
          tokenInfo?.isErc721
            ? <Select
              {...form.fields.id}
              label={t('NFT_ID')}
              options={walletNftsList.map((item: string) => ({ value: item, label: item }))}
              hint={t('AVAILABLE_TO_TRANSFER', { amount: formatAsset(maxAmount, tokenInfo.symbol) })}
              placeholder={t('NFT_ID')}
            />
            : <Input
              {...form.fields.amount}
              type="number"
              label={t('AMOUNT')}
              prefix={tokenInfo?.symbol}
              hint={Number(maxAmount) > 0 && form.values.amount === maxAmount && !canDeposit
                ? t('WARNING_NO_Q_LEFT')
                : t('AVAILABLE_TO_TRANSFER', { amount: formatAsset(maxAmount, tokenInfo?.symbol) })
              }
              max={maxAmount}
              placeholder="0.0"
            />}

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
