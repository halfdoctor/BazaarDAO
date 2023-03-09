import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Icon, media } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

import Button from 'components/Button';
import PageLayout from 'components/PageLayout';

import DelegateVoting from './components/DelegateVoting';
import LockVoting from './components/LockVoting';
import VotingOverview from './components/VotingOverview';

import { useBaseVotingWeightInfo } from 'store/proposals/hooks';
import { useQVault } from 'store/q-vault/hooks';
import { useUser } from 'store/user/hooks';

import { RoutePaths } from 'constants/routes';

const StyledWrapper = styled.div`
  .voting-power-back {
    margin-bottom: 8px;
  }

  .voting-power-content {
    display: grid;
    gap: 24px;

    ${media.lessThan('medium')} {
      gap: 16px;
    }
  }

  .voting-power-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    ${media.lessThan('large')} {
      grid-template-columns: 1fr;
    }

    ${media.lessThan('medium')} {
      gap: 16px;
    }
  }
`;

function VotingPower () {
  const { t } = useTranslation();
  const user = useUser();
  const { getBaseVotingWeightInfo } = useBaseVotingWeightInfo();
  const { loadLockInfo, loadDelegationStakeInfo, loadQVBalanceDetails, loadDelegationInfo } = useQVault();

  useEffect(() => {
    getBaseVotingWeightInfo();
    loadLockInfo(user.address);
    loadDelegationInfo(user.address);
    loadDelegationStakeInfo();
    loadQVBalanceDetails();
  }, []);

  return (
    <StyledWrapper>
      <Link to={RoutePaths.governance}>
        <Button
          block
          compact
          alwaysEnabled
          className="voting-power-back"
          look="ghost"
        >
          <Icon name="arrow-left" />
          <span>{t('GOVERNANCE')}</span>
        </Button>
      </Link>

      <PageLayout title={t('VOTING_POWER')}>
        <div className="voting-power-content">
          <VotingOverview />
          <div className="voting-power-main">
            <LockVoting />
            <DelegateVoting />
          </div>
        </div>
      </PageLayout>
    </StyledWrapper>
  );
}

export default VotingPower;
