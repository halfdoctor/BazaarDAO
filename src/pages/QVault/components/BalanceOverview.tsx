import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { media } from '@q-dev/q-ui-kit';
import { useAnimateNumber, useInterval } from '@q-dev/react-hooks';
import styled from 'styled-components';

import { useQVault } from 'store/q-vault/hooks';
import { useUser } from 'store/user/hooks';

const StyledWrapper = styled.div`
  display: grid;
  gap: 24px;

  ${media.lessThan('medium')} {
    gap: 16px;
  }

  .balance-values {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;

    ${media.lessThan('medium')} {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
`;

function BalanceOverview () {
  const { t } = useTranslation();
  const {
    vaultBalance,
    walletBalance,
    qVaultMinimumTimeLock,
    loadWalletBalance,
    loadVaultBalance,
    loadMinimumQVaultTimeLock
  } = useQVault();
  const user = useUser();

  const userQVBalanceRef = useAnimateNumber(vaultBalance);
  const userAccountBalanceRef = useAnimateNumber(walletBalance);
  const qVaultLockedAmountRef = useAnimateNumber(qVaultMinimumTimeLock);

  useEffect(() => {
    loadWalletBalance();
    loadVaultBalance();
    loadMinimumQVaultTimeLock(user.address);
  }, []);

  useInterval(() => {
    loadMinimumQVaultTimeLock(user.address);
  }, 5000);

  return (
    <StyledWrapper className="block">
      <h2 className="text-h2">{t('OVERVIEW')}</h2>
      <div className="balance-values">
        <div>
          <p className="text-md color-secondary">{t('Q_VAULT_BALANCE')}</p>
          <p ref={userQVBalanceRef} className="text-xl font-semibold">0 Q</p>
        </div>

        <div>
          <p className="text-md color-secondary">{t('Q_ADDRESS_BALANCE')}</p>
          <p ref={userAccountBalanceRef} className="text-xl font-semibold">0 Q</p>
        </div>

        <div>
          <p className="text-md color-secondary">{t('TIME_LOCKED_AMOUNT')}</p>
          <p ref={qVaultLockedAmountRef} className="text-xl font-semibold">0 Q</p>
        </div>
      </div>
    </StyledWrapper>
  );
}

export default BalanceOverview;
