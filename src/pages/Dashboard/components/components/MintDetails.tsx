
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

  return (
    <MintDetailsWrapper>
      <div className="mint-details__item">
        <p className="text-md color-secondary">
          {t('TOTAL_TOKEN_SUPPLY_CAP')}
        </p>
        <div className="mint-details__item-amount">
          <p className="text-lg font-semibold" title={fromWeiWithDecimals(tokenInfo.totalSupplyCap, tokenInfo.decimals)}>
            {formatNumberCompact(fromWeiWithDecimals(tokenInfo.totalSupplyCap, tokenInfo.decimals))}
          </p>
          <p className="text-lg font-semibold">{tokenInfo.symbol}</p>
        </div>
      </div>
      <div className="mint-details__item">
        <p className="text-md color-secondary">
          {t('MINTED_TOKENS')}
        </p>
        <div className="mint-details__item-amount">
          <p className="text-lg font-semibold" title={fromWeiWithDecimals(tokenInfo.totalSupply, tokenInfo.decimals)}>
            {formatNumberCompact(fromWeiWithDecimals(tokenInfo.totalSupply, tokenInfo.decimals))}
          </p>
          <p className="text-lg font-semibold">{tokenInfo.symbol}</p>
        </div>
      </div>
      <div className="mint-details__item">
        <p className="text-md color-secondary">
          {t('AVAILABLE_TOKENS_FOR_MINT')}
        </p>
        <div className="mint-details__item-amount">
          <p className="text-lg font-semibold" title={availableMintValue}>
            {formatNumberCompact(availableMintValue)}
          </p>
          <p className="text-lg font-semibold">{tokenInfo.symbol}</p>
        </div>
      </div>

      {!isCanMint && (
        <p className="mint-details__minted text-lg font-bold">{t('MINTED_ALL_TOKEN')}</p>
      )}
    </MintDetailsWrapper>
  );
}

export default MintDetails;
