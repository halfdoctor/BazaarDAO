import { useTranslation } from 'react-i18next';

import { formatAsset } from '@q-dev/utils';
import styled from 'styled-components';

import ExplorerAddress from 'components/Custom/ExplorerAddress';

import { useDaoStore } from 'store/dao/hooks';

import { fromDecimals } from 'utils/numbers';

const StyledWrapper = styled.div`
  padding: 24px 16px 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .dao-token-supply__val {
    margin-top: 4px;
  }

  .dao-token-supply__inactive {
    margin-top: 16px;
    display: flex;
    gap: 4px;
  }
`;

function DaoTokenSupply () {
  const { t } = useTranslation();
  const { tokenInfo } = useDaoStore();

  return (
    <StyledWrapper className="block">
      <div>
        <h2 className="text-lg">{t('DAO_TOKEN_SUPPLY')}</h2>
        <p className="dao-token-supply__val text-xl font-semibold">
          {formatAsset(fromDecimals(tokenInfo.totalSupply, tokenInfo.decimals), tokenInfo.symbol)}
        </p>
        <div className="dao-token-supply__inactive text-sm">
          <span className="font-light">{t('CONTRACT')}</span>
          <ExplorerAddress short address={tokenInfo.address} />
        </div>
      </div>
    </StyledWrapper>
  );
}

export default DaoTokenSupply;
