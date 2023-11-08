import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DecodedData, DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { Modal, Tooltip } from '@q-dev/q-ui-kit';
import { useWeb3Context } from 'context/Web3ContextProvider';
import { ProposalBaseInfo } from 'typings/proposals';

import Button from 'components/Button';
import { ShareButton } from 'components/ShareButton';

import { useSignConstitution } from 'hooks';
import { useDaoProposals } from 'hooks/useDaoProposals';
import useProposalActionsInfo from 'hooks/useProposalActionsInfo';

import useEndTime from '../../hooks/useEndTime';

import VoteForm from './components/VoteForm';

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
  const { address: accountAddress } = useWeb3Context();
  const { submitTransaction } = useTransaction();
  const { voteForProposal, executeProposal, appealProposal } = useDaoProposals();
  const { getVotingPermissions } = useProposalActionsInfo();
  const { isConstitutionSignNeeded, signConstitution, loadConstitutionData } = useSignConstitution();
  const [userVotingPermission, setUserVotingPermission] = useState({
    isUserMember: false,
    isUserTokenHolder: false,
    isCanVeto: false,
    isCanVoting: false,
    isCanExpertVoting: false,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const votingEndTime = useEndTime(unixToDate(proposal.params.votingEndTime.toString()));

  const loadPermissions = async () => {
    const votingPermissions = await getVotingPermissions(
      proposal.relatedExpertPanel,
      proposal.relatedVotingSituation,
      proposal.target,
    );
    setUserVotingPermission(votingPermissions);
  };

  const isMembershipSituation = useMemo(() => {
    return proposal.relatedVotingSituation === DefaultVotingSituations.Membership;
  }, [proposal.relatedVotingSituation]);

  const isSignNeeded = useMemo(() => {
    return isMembershipSituation && isConstitutionSignNeeded;
  }, [isMembershipSituation, isConstitutionSignNeeded]);

  const canExecute = useMemo(() => {
    if (proposal.votingStatus !== PROPOSAL_STATUS.passed) return false;
    if (decodedCallData && isMembershipSituation && decodedCallData?.functionName === 'addMember') {
      return Boolean(accountAddress) && decodedCallData.arguments?.member_ === accountAddress;
    }
    return true;
  }, [proposal.votingStatus, accountAddress, decodedCallData, isMembershipSituation]);

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

      {proposal.votingStatus === PROPOSAL_STATUS.pending && userVotingPermission.isCanVoting && (
        <Button
          style={{ width: '160px' }}
          disabled={proposal.isUserVoted}
          onClick={() => setModalOpen(true)}
        >
          {proposal.isUserVoted ? t('YOU_VOTED') : t('VOTE')}
        </Button>
      )}

      {proposal.votingStatus === PROPOSAL_STATUS.underEvaluation && userVotingPermission.isCanExpertVoting && (
        <Button
          style={{ width: '160px' }}
          disabled={proposal.isUserExpertVoted}
          onClick={() => setModalOpen(true)}
        >
          {proposal.isUserExpertVoted ? t('YOU_VOTED') : t('VOTE')}
        </Button>
      )}

      {proposal.votingStatus === PROPOSAL_STATUS.underReview && userVotingPermission.isUserTokenHolder && (
        <Button
          look="danger"
          style={{ width: '160px' }}
          onClick={() => submitTransaction({
            successMessage: t('APPEAL_TX'),
            submitFn: () => appealProposal(proposal)
          })}
        >
          {t('APPEAL')}
        </Button>
      )}

      {proposal.votingStatus === PROPOSAL_STATUS.accepted && userVotingPermission.isCanVeto && (
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
        tip={proposal.votingStatus === PROPOSAL_STATUS.pending
          ? t('VOTE_MODAL_TIP', { time: votingEndTime.formatted })
          : ''
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
