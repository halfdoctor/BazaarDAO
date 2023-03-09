import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { media, Modal } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

import Button from 'components/Button';

import AnnounceForm from './AnnounceForm';
import VotingAgent from './VotingAgent';

import { useQVault } from 'store/q-vault/hooks';

import { unixToDate } from 'utils/date';

const StyledWrapper = styled.div`
  display: grid;
  gap: 24px;
  
  .delegate-voting-action {
    margin-top: 8px;

    ${media.lessThan('medium')} {
      width: 100%;
    }
  }
`;

function DelegateVoting () {
  const { t } = useTranslation();
  const { votingLockingEnd } = useQVault();
  const isLockingEnded = new Date() > unixToDate(votingLockingEnd);

  const [announceModalOpen, setAnnounceModalOpen] = useState(false);

  return (
    <StyledWrapper className="block">
      <div>
        <h2 className="text-h2">
          {t('DELEGATE_VOTING_POWER')}
        </h2>
        <p className="text-md color-secondary">
          {t('DELEGATE_VOTING_DESCRIPTION')}
        </p>
      </div>

      <VotingAgent disabled={!isLockingEnded} />

      <Button
        className="delegate-voting-action"
        disabled={!isLockingEnded}
        onClick={() => setAnnounceModalOpen(true)}
      >
        {t('ANNOUNCE_NEW_AGENT')}
      </Button>

      <Modal
        open={announceModalOpen}
        title={t('ANNOUNCE_NEW_VOTING_AGENT')}
        tip={t('THIS_WILL_IMMEDIATELY_REDUCE_VOTING_WEIGHT')}
        onClose={() => setAnnounceModalOpen(false)}
      >
        <AnnounceForm onSubmit={() => setAnnounceModalOpen(false)} />
      </Modal>
    </StyledWrapper>
  );
}

export default DelegateVoting;
