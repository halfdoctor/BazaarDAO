import {
  CreateVotingParameters,
  DefaultVotingSituations,
  getEncodedData,
  getParameter,
  IDAOVoting,
  ParameterType
} from '@q-dev/gdk-sdk';
import { TagState } from '@q-dev/q-ui-kit/dist/components/Tag';
import { errors } from 'errors';
import { NewProposalForm } from 'typings/forms';
import { ProposalBaseInfo } from 'typings/proposals';

import { TokenInfo } from 'store/dao-token/reducer';

import { daoInstance } from 'contracts/contract-instance';

import { PROPOSAL_STATUS } from 'constants/statuses';
import { toWeiWithDecimals } from 'utils/numbers';

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

export async function createGeneralSituationProposal (
  form: NewProposalForm,
  tokenInfo: TokenInfo | null,
  canDAOSupportExternalLinks: boolean
) {
  if (!daoInstance) return;

  let callData = '0x';

  if (form.generalSituationType === 'create-voting') {
    if (!form.newVotingSituation || !tokenInfo) throw new errors.RuntimeError();

    const { newVotingSituation } = form;

    const votingMinAmount = tokenInfo.type === 'native' || tokenInfo.type === 'erc20'
      ? toWeiWithDecimals(newVotingSituation.votingMinAmount, tokenInfo.decimals)
      : '1';

    const initialSituation: IDAOVoting.InitialSituationStruct = {
      votingSituationName: newVotingSituation.situationName,
      votingValues: {
        votingPeriod: newVotingSituation.votingPeriod,
        vetoPeriod: newVotingSituation.vetoPeriod,
        proposalExecutionPeriod: newVotingSituation.proposalExecutionPeriod,
        requiredQuorum: toWeiWithDecimals(newVotingSituation.requiredQuorum, 25),
        requiredMajority: toWeiWithDecimals(newVotingSituation.requiredMajority, 25),
        requiredVetoQuorum: toWeiWithDecimals(newVotingSituation.requiredVetoQuorum, 25),
        votingType: newVotingSituation.votingType,
        votingTarget: newVotingSituation.votingTarget,
        votingMinAmount,
      },
    };

    if (canDAOSupportExternalLinks) {
      const data: IDAOVoting.ExtendedSituationStruct = {
        initialSituation: initialSituation,
        externalLink: newVotingSituation.externalLink
      };
      callData = getEncodedData(
        'GeneralDAOVoting',
        'createDAOVotingSituationWithLink',
        data,
      );
    } else {
      callData = getEncodedData(
        'GeneralDAOVoting',
        'createDAOVotingSituation',
        initialSituation
      );
    }
  }

  if (form.generalSituationType === 'remove-voting') {
    if (!form.situationNameForRemoval) throw new errors.RuntimeError();

    callData = getEncodedData(
      'GeneralDAOVoting',
      'removeVotingSituation',
      form.situationNameForRemoval,
    );
  }

  const votingInstance = await daoInstance.getDAOVotingInstance(form.panel);
  const votingParams: CreateVotingParameters = {
    remark: form.remark,
    situation: DefaultVotingSituations.General,
    callData
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

export const getStatusState = (proposal: ProposalBaseInfo): TagState => {
  switch (proposal.votingStatus) {
    case PROPOSAL_STATUS.pending:
    case PROPOSAL_STATUS.underReview:
    case PROPOSAL_STATUS.underEvaluation:
      return 'pending';
    case PROPOSAL_STATUS.rejected:
    case PROPOSAL_STATUS.expired:
      return 'rejected';
    case PROPOSAL_STATUS.accepted:
      return proposal.isAppealConfigured && proposal.extendedStats?.counters.isAppealed
        ? 'rejected'
        : 'approved';
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

export const getStatusTranslationKey = (proposal: ProposalBaseInfo) => {
  const isAppealedStatus = proposal.votingStatus === PROPOSAL_STATUS.accepted &&
    proposal.isAppealConfigured && proposal.extendedStats?.counters.isAppealed;
  if (isAppealedStatus) return 'STATUS_APPEALED';

  return statusMap[proposal.votingStatus || PROPOSAL_STATUS.none];
};
