import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ProposalStatus } from '@q-dev/q-js-sdk';
import { Modal, Tooltip } from '@q-dev/q-ui-kit';
import { Proposal } from 'typings/proposals';

import Button from 'components/Button';
import { ShareButton } from 'components/ShareButton';

import useEndTime from '../../hooks/useEndTime';

import VoteForm from './components/VoteForm';

import { useExperts } from 'store/experts/hooks';
import { useProposals } from 'store/proposals/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { CONTRACTS_NAMES } from 'constants/contracts';
import { unixToDate } from 'utils/date';

interface Props {
  proposal: Proposal;
  title: string;
}

function ProposalActions ({ proposal, title }: Props) {
  const { t } = useTranslation();

  const { submitTransaction } = useTransaction();
  const { voteForProposal, executeProposal } = useProposals();

  const { isEpdrMember, isEpqfiMember, isEprsMember } = useExperts();
  const isRootNode = false;
  const votingEndTime = useEndTime(unixToDate(proposal.votingEndTime));

  const [modalOpen, setModalOpen] = useState(false);

  const isContractWithoutVeto = [
    CONTRACTS_NAMES.emergencyUpdateVoting,
  ].includes(proposal.contract);

  const isMemberVoting = [
    CONTRACTS_NAMES.emergencyUpdateVoting,
    CONTRACTS_NAMES.ePQFIParametersVoting,
    CONTRACTS_NAMES.ePRSParametersVoting,
    CONTRACTS_NAMES.ePDRParametersVoting,
  ].includes(proposal.contract);

  const getVotingState = (): { tooltip: string; enabled: boolean } => {
    switch (true) {
      case isContractWithoutVeto:
        return { enabled: isRootNode, tooltip: t('ROOT_NODES_VOTE_TIP') };
      case proposal.contract === CONTRACTS_NAMES.ePRSParametersVoting:
        return { enabled: isEprsMember, tooltip: t('ROOT_NODE_SELECTION_EXPERTS_VOTE_TIP') };
      case proposal.contract === CONTRACTS_NAMES.ePDRParametersVoting:
        return { enabled: isEpdrMember, tooltip: t('DEFI_RISK_EXPERTS_VOTE_TIP') };
      case proposal.contract === CONTRACTS_NAMES.ePQFIParametersVoting:
        return { enabled: isEpqfiMember, tooltip: t('FEES_INCENTIVES_EXPERTS_VOTE_TIP') };
      default:
        return { enabled: true, tooltip: '' };
    }
  };

  const votingState = getVotingState();
  const isVetoShown = proposal.status === ProposalStatus.ACCEPTED && !isContractWithoutVeto;

  const voteText = t('VOTE');

  const handleVote = () => {
    setModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ShareButton title={`#${proposal.id} ${title}`} url={window.location.href} />

      {proposal.status === ProposalStatus.PENDING && (
        <Tooltip
          disabled={votingState.enabled}
          trigger={
            <Button
              style={{ width: '160px' }}
              disabled={proposal.userVoted || !votingState.enabled}
              onClick={handleVote}
            >
              {proposal.userVoted ? t('YOU_VOTED') : voteText}
            </Button>
          }
        >
          {votingState.tooltip}
        </Tooltip>
      )}

      {isVetoShown && (
        <Tooltip
          disabled={isRootNode}
          trigger={
            <Button
              look="danger"
              style={{ width: '160px' }}
              disabled={proposal.userVetoed || !isRootNode}
              onClick={() => submitTransaction({
                successMessage: t('VETO_TX'),
                submitFn: () => voteForProposal({ type: 'constitution', proposal })
              })}
            >
              {proposal.userVetoed ? t('YOU_VETOED') : t('VETO')}
            </Button>
          }
        >
          {t('ROOT_NODES_VETO_TIP')}
        </Tooltip>
      )}

      {proposal.status === ProposalStatus.PASSED && (
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
          isMemberVoting
            ? ''
            : t('VOTE_MODAL_TIP', { time: votingEndTime.formatted })
        }
        onClose={() => setModalOpen(false)}
      >
        <VoteForm
          proposal={proposal}
          isMemberVoting={isMemberVoting}
          onSubmit={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default ProposalActions;
