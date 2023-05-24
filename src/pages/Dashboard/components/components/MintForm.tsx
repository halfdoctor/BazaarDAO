
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { toBigNumber } from '@q-dev/utils';
import { mintToErc5484 } from 'helpers';
import { mintToErc20 } from 'helpers/erc-20';
import { mintToErc721 } from 'helpers/erc-721';
import styled from 'styled-components';

import Button from 'components/Button';
import InfoTooltip from 'components/InfoTooltip';
import Input from 'components/Input';

import useLoadDao from 'hooks/useLoadDao';

import MintDetails from './MintDetails';

import { useDaoTokenStore } from 'store/dao-token/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { fromWeiWithDecimals, toWeiWithDecimals } from 'utils/numbers';
import { amount, number, required, url } from 'utils/validators';

export const StyledMintForm = styled.form`
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
    if (!tokenInfo) return '0';
    const mintValue = toBigNumber(tokenInfo.totalSupplyCap).minus(tokenInfo.totalSupply);
    return mintValue.isGreaterThan(0)
      ? fromWeiWithDecimals(mintValue.toString(), tokenInfo.decimals)
      : '0';
  }, [tokenInfo]);

  const isCanMint = useMemo(() => {
    return !!tokenInfo?.totalSupplyCap && Boolean(+maxMintValue);
  }, [maxMintValue]);

  const isNftLike = useMemo(() => {
    return tokenInfo?.type === 'erc5484' || tokenInfo?.type === 'erc721';
  }, [tokenInfo]);

  const form = useForm({
    initialValues: {
      recipient: tokenInfo?.owner || '',
      amount: '',
      tokenURI: tokenInfo?.baseURI || '',
    },
    validators: {
      recipient: [required],
      amount: isNftLike ? [] : [required, number, ...maxMintValue ? [amount(maxMintValue)] : []],
      tokenURI: isNftLike ? [required, url] : [],
    },
    onSubmit: (form) => {
      submitTransaction({
        successMessage: t('MINT_TX'),
        onConfirm: () => onSubmit(),
        submitFn: () => {
          if (isNftLike) {
            const tokenURI = tokenInfo?.baseURI ? form.tokenURI.replace(tokenInfo.baseURI, '') : form.tokenURI;
            return tokenInfo?.type === 'erc721'
              ? mintToErc721(form.recipient, Date.now(), tokenURI)
              : mintToErc5484(form.recipient, Date.now(), tokenURI);
          }
          return mintToErc20(form.recipient, toWeiWithDecimals(form.amount, tokenInfo?.decimals));
        },
        onSuccess: () => loadAdditionalInfo(),
      });
    }
  });

  const handleTokenUriChange = (value: string) => {
    if (!tokenInfo?.baseURI) {
      form.fields.tokenURI.onChange(value);
      return;
    }

    form.fields.tokenURI.onChange(value.startsWith(tokenInfo?.baseURI) ? value : tokenInfo.baseURI);
  };

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
      {tokenInfo?.type === 'erc5484' || tokenInfo?.type === 'erc721'
        ? <div className="mint-form__uri">
          <div className="mint-form__uri-tooltip">
            <p className="text-md">
              {t('TOKEN_URI')}
            </p>
            <InfoTooltip description={t('TOKEN_URI_TOOLTIP')} />
          </div>
          <Input
            {...form.fields.tokenURI}
            placeholder={t('TOKEN_URI_PLACEHOLDER')}
            disabled={!isCanMint}
            onChange={handleTokenUriChange}
          />
        </div>
        : <Input
          {...form.fields.amount}
          type="number"
          label={t('AMOUNT')}
          max={tokenInfo?.totalSupplyCap ? maxMintValue : undefined}
          prefix={tokenInfo?.symbol}
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
