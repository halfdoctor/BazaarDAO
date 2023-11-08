import {
  CreateVotingParameters,
  DefaultVotingSituations,
  getEncodedData,
  getParameter,
  ParameterType,
} from '@q-dev/gdk-sdk';
import { TagState } from '@q-dev/q-ui-kit/dist/components/Tag';
import { NewProposalForm } from 'typings/forms';

import { daoInstance } from 'contracts/contract-instance';

import { PROPOSAL_STATUS } from 'constants/statuses';

export async function createMembershipSituationProposal (form: NewProposalForm) {
  if (!daoInstance) return;
  const votingInstance = await daoInstance.getDAOVotingInstance(form.panel);
  const votingParams: CreateVotingParameters = {
    remark: form.remark,
    situation: DefaultVotingSituations.Membership,
    callData: getEncodedData(
      'DAOMemberStorage',
      form.membershipSituationType === 'add-member' ? 'addMember' : 'removeMember',
      form.candidateAddress
    )
  };
  return daoInstance.createVoting(votingInstance, votingParams);
}

export async function createGeneralSituationProposal (form: NewProposalForm) {
  if (!daoInstance) return;

  const votingInstance = await daoInstance.getDAOVotingInstance(form.panel);
  const votingParams: CreateVotingParameters = {
    remark: form.remark,
    situation: DefaultVotingSituations.General,
    callData: '0x'
  };
  return daoInstance.createVoting(votingInstance, votingParams);
}

export async function createConstitutionProposal (form: NewProposalForm) {
  if (!daoInstance) return;
  const votingInstance = await daoInstance.getDAOVotingInstance(form.panel);

  const votingParams: CreateVotingParameters = {
    remark: form.remark,
    situation: DefaultVotingSituations.Constitution,
    callData: getEncodedData('DAOParameterStorage', 'setDAOParameters', [
      getParameter('constitution.hash', form.hash, ParameterType.BYTES),
      ...form.params.map((item) => {
        return getParameter(item.key, item.value, item.type);
      })
    ])
  };
  return daoInstance.createVoting(votingInstance, votingParams);
}

export async function createParameterSituationProposal (
  form: NewProposalForm,
  situation: DefaultVotingSituations.ConfigurationParameter |
  DefaultVotingSituations.RegularParameter
) {
  if (!daoInstance) return;
  const votingInstance = await daoInstance.getDAOVotingInstance(form.panel);

  const votingParams: CreateVotingParameters = {
    remark: form.remark,
    situation: situation,
    callData: getEncodedData(
      'DAOParameterStorage',
      'setDAOParameters',
      form.params.map((item) => {
        return getParameter(item.key, item.value, item.type);
      })
    )
  };
  return daoInstance.createVoting(votingInstance, votingParams);
}

export async function createMultiCallProposal (form: NewProposalForm, abiName: string) {
  if (!daoInstance) return;
  const votingInstance = await daoInstance.getDAOVotingInstance(form.panel);

  const votingParams: CreateVotingParameters = {
    remark: form.remark,
    situation: form.type,
    callData: getEncodedData(
      abiName,
      'multicall',
      form.callData
    )
  };

  return daoInstance.createVoting(votingInstance, votingParams);
}

export async function createExternalProposal (form: NewProposalForm) {
  const callData = form.callData[0];
  if (!daoInstance || !callData) return;
  const votingInstance = await daoInstance.getDAOVotingInstance(form.panel);

  const votingParams: CreateVotingParameters = {
    callData,
    remark: form.remark,
    situation: form.type,
  };

  return daoInstance.createVoting(votingInstance, votingParams);
}

export const getStatusState = (status: PROPOSAL_STATUS): TagState => {
  switch (status) {
    case PROPOSAL_STATUS.pending:
    case PROPOSAL_STATUS.underReview:
    case PROPOSAL_STATUS.underEvaluation:
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
  [PROPOSAL_STATUS.underReview]: 'STATUS_UNDER_REVIEW',
  [PROPOSAL_STATUS.underEvaluation]: 'STATUS_UNDER_EVALUATION',
};
