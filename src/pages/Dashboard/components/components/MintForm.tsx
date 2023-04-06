
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { toBigNumber } from '@q-dev/utils';
import { useWeb3Context } from 'context/Web3ContextProvider';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input';

import MintDetails from './MintDetails';

import { useDaoStore } from 'store/dao/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { fromWeiWithDecimals, toWeiWithDecimals } from 'utils/numbers';
import { amount, number, required } from 'utils/validators';

export const StyledMintForm = styled.form`
  display: grid;
  gap: 16px;
  
  .mint-form__details {
    display: grid;
    gap: 12px;
  }
  .mint-form__details-item,
  .mint-form__details-item-amount {
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

interface Props {
  onSubmit: () => void;
}

function MintForm ({ onSubmit }: Props) {
  const { t } = useTranslation();
  const { submitTransaction } = useTransaction();
  const { tokenInfo, mintToken } = useDaoStore();
  const { loadAdditionalInfo } = useWeb3Context();

  const maxMintValue = useMemo(() => {
    const mintValue = toBigNumber(tokenInfo.totalSupplyCap).minus(tokenInfo.totalSupply);
    return mintValue.isGreaterThan(0)
      ? fromWeiWithDecimals(mintValue.toString(), tokenInfo.decimals)
      : '0';
  }, [tokenInfo]);

  const isCanMint = useMemo(() => {
    return Boolean(+maxMintValue);
  }, [maxMintValue]);

  const form = useForm({
    initialValues: {
      recipient: tokenInfo.owner,
      amount: '',
    },
    validators: {
      recipient: [required],
      amount: [required, number, amount(maxMintValue)],
    },
    onSubmit: (form) => {
      submitTransaction({
        successMessage: t('MINT_TX'),
        onConfirm: () => onSubmit(),
        submitFn: () => mintToken(form.recipient, toWeiWithDecimals(form.amount, tokenInfo.decimals)),
        onSuccess: () => loadAdditionalInfo(),
      });
    }
  });

  return (
    <StyledMintForm
      noValidate
      onSubmit={form.submit}
    >
      <MintDetails isCanMint={isCanMint} availableMintValue={maxMintValue} />

      <Input
        {...form.fields.recipient}
        disabled={!isCanMint}
        label={t('ADDRESS')}
        placeholder={t('ADDRESS_PLACEHOLDER')}
      />
      <Input
        {...form.fields.amount}
        type="number"
        label={t('AMOUNT')}
        max={maxMintValue}
        prefix={tokenInfo.symbol}
        disabled={!isCanMint}
        placeholder="0.0"
      />

      <Button
        type="submit"
        style={{ width: '100%' }}
        disabled={!form.isValid || !isCanMint}
      >
        {t('MINT')}
      </Button>
    </StyledMintForm>
  );
}

export default MintForm;
