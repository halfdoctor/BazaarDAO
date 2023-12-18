
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { toBigNumber } from '@q-dev/utils';
import { mintToErc721, mintToErc5484 } from 'helpers';
import { mintToErc20 } from 'helpers/erc-20';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input';

import useLoadDao from 'hooks/useLoadDao';

import MintDetails from './MintDetails';

import { useDaoTokenStore } from 'store/dao-token/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { fromWeiWithDecimals, toWeiWithDecimals } from 'utils/numbers';
import { amount, number, required } from 'utils/validators';

const StyledMintForm = styled.form`
  display: grid;
  gap: 16px;

  .mint-form__uri-tooltip {
    display: flex;
    margin-bottom: 12px;
  }
`;

interface Props {
  onSubmit: () => void;
}

function MintForm ({ onSubmit }: Props) {
  const { t } = useTranslation();
  const { submitTransaction } = useTransaction();
  const { tokenInfo } = useDaoTokenStore();
  const { loadAdditionalInfo } = useLoadDao();

  const maxMintValue = useMemo(() => {
    if (!tokenInfo?.totalSupplyCap) return '0';
    const mintValue = toBigNumber(tokenInfo.totalSupplyCap).minus(tokenInfo.totalSupply);
    return mintValue.isGreaterThan(0)
      ? fromWeiWithDecimals(mintValue.toString(), tokenInfo.decimals)
      : '0';
  }, [tokenInfo]);

  const isCanMint = !tokenInfo?.totalSupplyCap || Boolean(+maxMintValue);
  const isNftLike = tokenInfo?.type === 'erc5484' || tokenInfo?.type === 'erc721';

  const form = useForm({
    initialValues: {
      recipient: tokenInfo?.owner || '',
      amount: '',
    },
    validators: {
      recipient: [required],
      amount: isNftLike
        ? []
        : [required, number, ...(tokenInfo?.totalSupplyCap && maxMintValue ? [amount(maxMintValue)] : [])],
    },
    onSubmit: (form) => {
      submitTransaction({
        successMessage: t('MINT_TX'),
        onConfirm: () => onSubmit(),
        submitFn: () => {
          if (isNftLike) {
            const tokenId = tokenInfo.totalSupply && toBigNumber(tokenInfo.totalSupply).isGreaterThan(0)
              ? tokenInfo.totalSupply
              : '0';
            const tokenURI = tokenInfo?.baseURI || '';
            return tokenInfo?.type === 'erc721'
              ? mintToErc721(form.recipient, tokenId, tokenURI)
              : mintToErc5484(form.recipient, tokenId, tokenURI);
          }
          return mintToErc20(form.recipient, toWeiWithDecimals(form.amount, tokenInfo?.decimals));
        },
        onSuccess: () => loadAdditionalInfo(),
      });
    }
  });

  const isSubmitDisabled = useMemo(() => {
    return !form.isValid || !isCanMint;
  }, [form.isValid, isCanMint]);

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
      {!isNftLike && (
        <Input
          {...form.fields.amount}
          type="number"
          label={t('AMOUNT')}
          max={tokenInfo?.totalSupplyCap ? maxMintValue : undefined}
          prefix={tokenInfo?.symbol}
          disabled={!isCanMint}
          placeholder="0.0"
        />
      )}

      <Button
        type="submit"
        style={{ width: '100%' }}
        disabled={isSubmitDisabled}
      >
        {t('MINT')}
      </Button>
    </StyledMintForm>
  );
}

export default MintForm;
