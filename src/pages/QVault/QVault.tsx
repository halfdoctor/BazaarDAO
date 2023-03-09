import { useTranslation } from 'react-i18next';

import { media } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

import PageLayout from 'components/PageLayout';

import BalanceOverview from './components/BalanceOverview';
import TransferForm from './components/TransferForm';
import WithdrawForm from './components/WithdrawForm';

const StyledWrapper = styled.div`
  display: grid;
  gap: 24px;

  ${media.lessThan('medium')} {
    gap: 16px;
  }

  .q-vault-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    ${media.lessThan('medium')} {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
`;

function QVault () {
  const { t } = useTranslation();

  return (
    <PageLayout title={t('Q_VAULT')}>
      <StyledWrapper>
        <BalanceOverview />
        <div className="q-vault-main">
          <TransferForm />
          <WithdrawForm />
        </div>
      </StyledWrapper>
    </PageLayout>
  );
}

export default QVault;
