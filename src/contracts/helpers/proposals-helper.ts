import {
  CreateVotingParameters,
  DefaultVotingSituations,
  getEncodedData,
  getParameter,
  ParameterType
} from '@q-dev/gdk-sdk';
import { TagState } from '@q-dev/q-ui-kit/dist/components/Tag';
import { NewProposalForm } from 'typings/forms';

import { daoInstance } from 'contracts/contract-instance';

import { PROPOSAL_STATUS } from 'constants/statuses';

export async function createMembershipSituationProposal (form: NewProposalForm) {
  if (!daoInstance) return;
  const votingParams: CreateVotingParameters = {
    remark: form.externalLink,
    situation: DefaultVotingSituations.MembershipSituation,
    callData: getEncodedData(
      'DAOMemberStorage',
      form.membershipSituationType === 'add-member' ? 'addMember' : 'removeMember',
      form.candidateAddress
    )
  };
  return daoInstance.createVoting(form.panel, votingParams);
}

export async function createGeneralSituationProposal (form: NewProposalForm) {
  if (!daoInstance) return;

  const votingParams: CreateVotingParameters = {
    remark: form.externalLink,
    situation: DefaultVotingSituations.GeneralSituation,
    callData: '0x'
  };
  return daoInstance.createVoting(form.panel, votingParams);
}

export async function createConstitutionProposal (form: NewProposalForm) {
  if (!daoInstance) return;

  const votingParams: CreateVotingParameters = {
    remark: form.externalLink,
    situation: DefaultVotingSituations.ConstitutionSituation,
    callData: getEncodedData('DAOParameterStorage', 'setDAOParameters', [
      getParameter('constitution.hash', form.hash, ParameterType.BYTES),
      ...form.params.map((item) => {
        return getParameter(item.key, item.value, item.type);
      })
    ])
  };
  return daoInstance.createVoting(form.panel, votingParams);
}

export async function createParameterSituationProposal (form: NewProposalForm) {
  if (!daoInstance) return;

  const votingParams: CreateVotingParameters = {
    remark: form.externalLink,
    situation: DefaultVotingSituations.ParameterSituation,
    callData: getEncodedData(
      'DAOParameterStorage',
      'setDAOParameters',
      form.params.map((item) => {
        return getParameter(item.key, item.value, item.type);
      })
    )
  };
  return daoInstance.createVoting(form.panel, votingParams);
}

export const getStatusState = (status: string): TagState => {
  switch (status) {
    case PROPOSAL_STATUS.pending:
      return 'pending';
    case PROPOSAL_STATUS.rejected:
    case PROPOSAL_STATUS.expired:
      return 'rejected';
    default:
      return 'approved';
  }
};

export const statusMap: Record<PROPOSAL_STATUS, string> = {
  [PROPOSAL_STATUS.accepted]: 'STATUS_ACCEPTED',
  [PROPOSAL_STATUS.executed]: 'STATUS_EXECUTED',
  [PROPOSAL_STATUS.expired]: 'STATUS_EXPIRED',
  [PROPOSAL_STATUS.none]: 'STATUS_NONE',
  [PROPOSAL_STATUS.passed]: 'STATUS_PASSED',
  [PROPOSAL_STATUS.pending]: 'STATUS_PENDING',
  [PROPOSAL_STATUS.rejected]: 'STATUS_REJECTED',
  [PROPOSAL_STATUS.obsolete]: 'STATUS_OBSOLETE'
};
