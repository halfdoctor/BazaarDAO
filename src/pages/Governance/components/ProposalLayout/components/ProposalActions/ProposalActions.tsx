import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DecodedData, DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { Modal, Tooltip } from '@q-dev/q-ui-kit';
import { ProposalBaseInfo } from 'typings/proposals';

import Button from 'components/Button';
import { ShareButton } from 'components/ShareButton';

import { useSignConstitution } from 'hooks';
import { useDaoProposals } from 'hooks/useDaoProposals';
import useProposalActionsInfo from 'hooks/useProposalActionsInfo';

import useEndTime from '../../hooks/useEndTime';

import VoteForm from './components/VoteForm';

import { useProviderStore } from 'store/provider/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { PROPOSAL_STATUS } from 'constants/statuses';
import { unixToDate } from 'utils/date';

interface Props {
  proposal: ProposalBaseInfo;
  title: string;
  decodedCallData: DecodedData | null;
}

function ProposalActions ({ proposal, title, decodedCallData }: Props) {
  const { t } = useTranslation();
  const { userAddress } = useProviderStore();
  const { submitTransaction } = useTransaction();
  const { voteForProposal, executeProposal } = useDaoProposals();
  const { checkIsUserCanVeto, checkIsUserCanVoting } = useProposalActionsInfo();
  const { isConstitutionSignNeeded, signConstitution, loadConstitutionData } = useSignConstitution();
  const [isUserCanVoting, setIsUserCanVoting] = useState(false);
  const [isUserCanVeto, setIsUserCanVeto] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const votingEndTime = useEndTime(unixToDate(proposal.params.votingEndTime.toString()));

  const loadPermissions = async () => {
    const [isCanVoting, isCanVeto] = await Promise.all([
      checkIsUserCanVoting(proposal.relatedExpertPanel, proposal.relatedVotingSituation),
      checkIsUserCanVeto(proposal.target)
    ]);
    setIsUserCanVoting(isCanVoting);
    setIsUserCanVeto(isCanVeto);
  };

  const isMembershipSituation = useMemo(() => {
    return proposal.relatedVotingSituation === DefaultVotingSituations.Membership;
  }, [proposal.relatedVotingSituation]);

  const isSignNeeded = useMemo(() => {
    return isMembershipSituation && isConstitutionSignNeeded;
  }, [isMembershipSituation, isConstitutionSignNeeded]);

  const canExecute = useMemo(() => {
    if (proposal.votingStatus !== PROPOSAL_STATUS.passed) return false;
    if (!decodedCallData || (isMembershipSituation && decodedCallData?.functionName !== 'addMember')) return true;

    return Boolean(userAddress) && decodedCallData.arguments?.member_ === userAddress;
  }, [proposal.votingStatus, userAddress, decodedCallData, isMembershipSituation]);

  const executeOrSignConstitution = () => {
    isSignNeeded
      ? signConstitution()
      : submitTransaction({
        successMessage: t('EXECUTE_TX'),
        submitFn: () => executeProposal(proposal)
      });
  };

  useEffect(() => {
    if (isMembershipSituation) {
      loadConstitutionData();
    }
  }, [isMembershipSituation]);

  useEffect(() => {
    loadPermissions();
  }, [proposal]);

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <ShareButton title={`#${proposal.id} ${title}`} url={window.location.href} />

      {proposal.votingStatus === PROPOSAL_STATUS.pending && isUserCanVoting && (
        <Button
          style={{ width: '160px' }}
          disabled={proposal.isUserVoted}
          onClick={() => setModalOpen(true)}
        >
          {proposal.isUserVoted ? t('YOU_VOTED') : t('VOTE')}
        </Button>
      )}

      {proposal.votingStatus === PROPOSAL_STATUS.accepted && isUserCanVeto && (
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

      {canExecute && (
        <Button
          onClick={executeOrSignConstitution}
        >
          {isSignNeeded ? t('SIGN_CONSTITUTION_TO_EXECUTE') : t('EXECUTE')}
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
