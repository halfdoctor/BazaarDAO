
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatNumberCompact } from '@q-dev/utils';
import styled from 'styled-components';

import { useDaoStore } from 'store/dao/hooks';

import { fromWeiWithDecimals } from 'utils/numbers';

interface Props {
  isCanMint: boolean;
  availableMintValue: string;
}
export const MintDetailsWrapper = styled.div`
  display: grid;
  gap: 12px;

  .mint-details__item,
  .mint-details__item-amount {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .mint-details__minted {
    display: flex;
    justify-content: center;
    color: ${({ theme }) => theme.colors.successMain};
  }
`;

function MintDetails ({ isCanMint, availableMintValue }: Props) {
  const { t } = useTranslation();
  const { tokenInfo } = useDaoStore();

  const mintDetailsList = useMemo(() => [
    {
      title: t('TOTAL_TOKEN_SUPPLY_CAP'),
      amountTitle: fromWeiWithDecimals(tokenInfo.totalSupplyCap, tokenInfo.decimals),
      amount: formatNumberCompact(fromWeiWithDecimals(tokenInfo.totalSupplyCap, tokenInfo.decimals))
    },
    {
      title: t('MINTED_TOKENS'),
      amountTitle: fromWeiWithDecimals(tokenInfo.totalSupply, tokenInfo.decimals),
      amount: formatNumberCompact(fromWeiWithDecimals(tokenInfo.totalSupply, tokenInfo.decimals))
    },
    {
      title: t('AVAILABLE_TOKENS_FOR_MINT'),
      amountTitle: availableMintValue,
      amount: formatNumberCompact(availableMintValue)
    },
  ], [availableMintValue, tokenInfo]);

  return (
    <MintDetailsWrapper>
      {
        mintDetailsList.map((item, index) => (
          <div key={index} className="mint-details__item">
            <p className="text-md color-secondary">
              {item.title}
            </p>
            <div className="mint-details__item-amount">
              <p className="text-lg font-semibold" title={item.amountTitle}>
                {item.amount}
              </p>
              <p className="text-lg font-semibold">{tokenInfo.symbol}</p>
            </div>
          </div>
        ))
      }

      {!isCanMint && (
        <p className="mint-details__minted text-lg font-bold">{t('MINTED_ALL_TOKEN')}</p>
      )}
    </MintDetailsWrapper>
  );
}

export default MintDetails;
