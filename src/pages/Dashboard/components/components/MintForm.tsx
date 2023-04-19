
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { toBigNumber } from '@q-dev/utils';
import { mintToErc20 } from 'helpers/erc-20';
import { mintToErc721 } from 'helpers/erc-721';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input';

import useLoadDao from 'hooks/useLoadDao';

import MintDetails from './MintDetails';

import { useDaoStore } from 'store/dao/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { fromWeiWithDecimals, toWeiWithDecimals } from 'utils/numbers';
import { amount, integer, min, number, required, url } from 'utils/validators';

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
  const { tokenInfo } = useDaoStore();
  const { loadAdditionalInfo } = useLoadDao();

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
      tokenURI: '',
      erc721Id: '',
    },
    validators: {
      recipient: [required],
      amount: tokenInfo.isErc721 ? [] : [required, number, amount(maxMintValue)],
      tokenURI: tokenInfo.isErc721 ? [required, url] : [],
      erc721Id: tokenInfo.isErc721 ? [required, number, min(0), integer] : [],
    },
    onSubmit: (form) => {
      submitTransaction({
        successMessage: t('MINT_TX'),
        onConfirm: () => onSubmit(),
        submitFn: () => tokenInfo.isErc721
          ? mintToErc721(form.recipient, form.erc721Id, form.tokenURI)
          : mintToErc20(form.recipient, toWeiWithDecimals(form.amount, tokenInfo.decimals)),
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
      {tokenInfo.isErc721
        ? <>
          <Input
            {...form.fields.tokenURI}
            label={t('TOKEN_URI')}
            placeholder={t('TOKEN_URI_PLACEHOLDER')}
            disabled={!isCanMint}
          />
          <Input
            {...form.fields.erc721Id}
            label={t('NEW_NFT_ID')}
            placeholder={t('NEW_NFT_ID_PLACEHOLDER')}
            disabled={!isCanMint}
          />
        </>
        : <Input
          {...form.fields.amount}
          type="number"
          label={t('AMOUNT')}
          max={maxMintValue}
          prefix={tokenInfo.symbol}
          disabled={!isCanMint}
          placeholder="0.0"
        />}

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
