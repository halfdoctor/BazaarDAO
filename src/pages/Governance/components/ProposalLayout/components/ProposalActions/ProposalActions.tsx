import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal, Tooltip } from '@q-dev/q-ui-kit';
import { ProposalBaseInfo } from 'typings/proposals';

import Button from 'components/Button';
import { ShareButton } from 'components/ShareButton';

import { useDaoProposals } from 'hooks/useDaoProposals';

import useEndTime from '../../hooks/useEndTime';

import VoteForm from './components/VoteForm';

import { useTransaction } from 'store/transaction/hooks';

import { ProposalStatus } from 'constants/statuses';
import { unixToDate } from 'utils/date';

interface Props {
  proposal: ProposalBaseInfo;
  title: string;
}

function ProposalActions ({ proposal, title }: Props) {
  const { t } = useTranslation();
  const { submitTransaction } = useTransaction();
  const { voteForProposal, executeProposal } = useDaoProposals();
  const [modalOpen, setModalOpen] = useState(false);
  const votingEndTime = useEndTime(unixToDate(proposal.params.votingEndTime));

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ShareButton title={`#${proposal.id} ${title}`} url={window.location.href} />

      {proposal.votingStatus === ProposalStatus.PENDING && (
        <Button
          style={{ width: '160px' }}
          disabled={proposal.isUserVoted}
          onClick={() => setModalOpen(true)}
        >
          {proposal.isUserVoted ? t('YOU_VOTED') : t('VOTE')}
        </Button>
      )}

      {proposal.votingStatus === ProposalStatus.ACCEPTED && (
        <Tooltip
          trigger={
            <Button
              look="danger"
              style={{ width: '160px' }}
              disabled={proposal.isUserVetoed}
              onClick={() => submitTransaction({
                successMessage: t('VETO_TX'),
                submitFn: () => voteForProposal({ type: 'veto', proposal })
              })}
            >
              {proposal.isUserVetoed ? t('YOU_VETOED') : t('VETO')}
            </Button>
          }
        >
          {t('ROOT_NODES_VETO_TIP')}
        </Tooltip>
      )}

      {proposal.votingStatus === ProposalStatus.PASSED && (
        <Button
          onClick={() => submitTransaction({
            successMessage: t('EXECUTE_TX'),
            submitFn: () => executeProposal(proposal)
          })}
        >
          {t('EXECUTE')}
        </Button>
      )}

      <Modal
        open={modalOpen}
        title={t('VOTE')}
        tip={
          t('VOTE_MODAL_TIP', { time: votingEndTime.formatted })
        }
        onClose={() => setModalOpen(false)}
      >
        <VoteForm
          proposal={proposal}
          onSubmit={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default ProposalActions;
