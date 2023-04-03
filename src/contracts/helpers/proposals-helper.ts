import {
  CreateVotingParameters,
  DefaultVotingSituations,
  getEncodedData,
  getParameter,
  ParameterType
} from '@q-dev/gdk-sdk';
import { ProposalStatus } from '@q-dev/q-js-sdk';
import { TagState } from '@q-dev/q-ui-kit/dist/components/Tag';
import { NewProposalForm } from 'typings/forms';

import { daoInstance } from 'contracts/contract-instance';

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
    case ProposalStatus.PENDING:
      return 'pending';
    case ProposalStatus.REJECTED:
    case ProposalStatus.EXPIRED:
      return 'rejected';
    default:
      return 'approved';
  }
};

export const statusMap: Record<ProposalStatus, string> = {
  [ProposalStatus.ACCEPTED]: 'STATUS_ACCEPTED',
  [ProposalStatus.EXECUTED]: 'STATUS_EXECUTED',
  [ProposalStatus.EXPIRED]: 'STATUS_EXPIRED',
  [ProposalStatus.NONE]: 'STATUS_NONE',
  [ProposalStatus.PASSED]: 'STATUS_PASSED',
  [ProposalStatus.PENDING]: 'STATUS_PENDING',
  [ProposalStatus.REJECTED]: 'STATUS_REJECTED',
  [ProposalStatus.OBSOLETE]: 'STATUS_OBSOLETE'
};
