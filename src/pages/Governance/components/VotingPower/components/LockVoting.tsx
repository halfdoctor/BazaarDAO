import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { media, Modal } from '@q-dev/q-ui-kit';
import { useAnimateNumber } from '@q-dev/react-hooks';
import styled from 'styled-components';

import Button from 'components/Button';

import LockForm from './LockForm';

import { useQVault } from 'store/q-vault/hooks';

import { formatDate, formatDateRelative, unixToDate } from 'utils/date';

const StyledWrapper = styled.div`
  display: grid;
  gap: 24px;

  .lock-values {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    ${media.lessThan('medium')} {
      grid-template-columns: 1fr;
    }
  }

  .lock-action {
    margin-top: 8px;
    
    ${media.lessThan('medium')} {
      width: 100%;
    }
  }
`;

function LockVoting () {
  const { t, i18n } = useTranslation();
  const { votingWeight, votingLockingEnd } = useQVault();
  const userVotingWeightRef = useAnimateNumber(votingWeight);

  const [lockModalOpen, setLockModalOpen] = useState(false);

  return (
    <StyledWrapper className="block">
      <div>
        <h2 className="text-h2">
          {t('LOCK_YOUR_Q_TOKENS_FOR_VOTING')}
        </h2>

        <p className="text-md color-secondary">
          {t('PARTICIPATE_IN_Q_GOVERNANCE_WITH_YOUR_LOCKED_AMOUNT')}
        </p>
      </div>

      <div className="lock-values">
        <div>
          <p className="text-md color-secondary">{t('LOCKED_VOTING_WEIGHT')}</p>
          <p ref={userVotingWeightRef} className="text-xl font-semibold">0 Q</p>
        </div>

        <div>
          <p className="text-md color-secondary">{t('LOCKING_END_TIME')}</p>
          <p
            className="text-xl font-semibold"
            title={formatDate(unixToDate(votingLockingEnd), i18n.language)}
          >
            {formatDateRelative(unixToDate(votingLockingEnd), i18n.language)}
          </p>
        </div>
      </div>

      <Button
        className="lock-action"
        onClick={() => setLockModalOpen(true)}
      >
        {t('MANAGE_LOCKED_AMOUNT')}
      </Button>

      <Modal
        open={lockModalOpen}
        title={t('LOCK_YOUR_Q_TOKENS_FOR_VOTING')}
        onClose={() => setLockModalOpen(false)}
      >
        <LockForm onSubmit={() => setLockModalOpen(false)} />
      </Modal>
    </StyledWrapper>
  );
}

export default LockVoting;
