import { EPDRMembershipVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPDRMembershipVotingInstance';
import { EPDRParametersVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPDRParametersVotingInstance';
import { EPQFIMembershipVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPQFIMembershipVotingInstance';
import { EPQFIParametersVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPQFIParametersVotingInstance';
import { EPRSMembershipVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPRSMembershipVotingInstance';
import { EPRSParametersVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPRSParametersVotingInstance';
import flatten from 'lodash/flatten';
import { ProposalEvent } from 'typings/contracts';
import { ExpertProposalForm, ExpertType } from 'typings/forms';
import { Proposal } from 'typings/proposals';
import { fromWei } from 'web3-utils';

import { getContractProposals } from '.';

import {
  getEpdrMembershipVotingInstance,
  getEpdrParametersVotingInstance,
  getEpqfiMembershipVotingInstance,
  getEpqfiParametersVotingInstance,
  getEprsMembershipVotingInstance,
  getEprsParametersVotingInstance
} from 'contracts/contract-instance';

export async function getExpertProposals (
  proposals: ProposalEvent[],
  lastBlock: number
) {
  const newProposals = await Promise.all([
    getContractProposals({
      proposals,
      contract: await getEpqfiMembershipVotingInstance(),
      lastBlock,
      contractName: 'epqfiMembershipVoting'
    }),
    getContractProposals({
      proposals,
      contract: await getEpdrMembershipVotingInstance(),
      lastBlock,
      contractName: 'epdrMembershipVoting'
    }),
    getContractProposals({
      proposals,
      contract: await getEpqfiParametersVotingInstance(),
      lastBlock,
      contractName: 'epqfiParametersVoting'
    }),
    getContractProposals({
      proposals,
      contract: await getEpdrParametersVotingInstance(),
      lastBlock,
      contractName: 'epdrParametersVoting'
    }),
    getContractProposals({
      proposals,
      contract: await getEprsParametersVotingInstance(),
      lastBlock,
      contractName: 'eprsParametersVoting'
    }),
    getContractProposals({
      proposals,
      contract: await getEprsMembershipVotingInstance(),
      lastBlock,
      contractName: 'eprsMembershipVoting'
    })
  ]);

  return flatten(newProposals);
}

export async function createAddExpertProposal (
  form: ExpertProposalForm,
  address: string
) {
  const contract = await getMembershipContractByType(form.panelType);
  return contract.createAddExpertProposal(
    form.externalLink,
    form.address,
    { from: address }
  );
}

export async function createRemoveExpertProposal (
  form: ExpertProposalForm,
  address: string
) {
  const contract = await getMembershipContractByType(form.panelType);
  return contract.createRemoveExpertProposal(
    form.externalLink,
    form.address,
    { from: address }
  );
}

export async function createParameterVoteProposal (
  form: ExpertProposalForm,
  address: string
) {
  const contract = await getParametersContractByType(form.panelType);
  return contract.createProposal(
    form.externalLink,
    form.params.map((item) => ({
      paramType: item.type,
      paramKey: item.key,
      paramValue: item.value
    })),
    { from: address }
  );
}

async function getMembershipContractByType (type: ExpertType) {
  switch (type) {
    case 'fees-incentives':
      return getEpqfiMembershipVotingInstance();
    case 'defi':
      return getEpdrMembershipVotingInstance();
    case 'root-node':
      return getEprsMembershipVotingInstance();
  }
}

async function getParametersContractByType (type: ExpertType) {
  switch (type) {
    case 'fees-incentives':
      return getEpqfiParametersVotingInstance();
    case 'defi':
      return getEpdrParametersVotingInstance();
    case 'root-node':
      return getEprsParametersVotingInstance();
  }
}

export async function getExpertProposal (
  contract: EPRSMembershipVotingInstance | EPQFIMembershipVotingInstance | EPDRMembershipVotingInstance
  | EPRSParametersVotingInstance | EPQFIParametersVotingInstance | EPDRParametersVotingInstance,
  id: string
): Promise<Partial<Proposal>> {
  const proposal = await contract.getProposal(id);
  const isParametersContract = contract instanceof EPRSParametersVotingInstance ||
    contract instanceof EPQFIParametersVotingInstance ||
    contract instanceof EPDRParametersVotingInstance;

  return {
    vetoEndTime: Number(proposal.base.params.vetoEndTime),
    votingEndTime: Number(proposal.base.params.votingEndTime),
    vetoesNumber: Number(proposal.base.counters.vetosCount),
    votesFor: isParametersContract
      ? Number(proposal.base.counters.weightFor)
      : Number(fromWei(proposal.base.counters.weightFor)),
    votesAgainst: isParametersContract
      ? Number(proposal.base.counters.weightAgainst)
      : Number(fromWei(proposal.base.counters.weightAgainst)),

    remark: proposal.base.remark,
    addressToAdd: 'proposalDetails' in proposal
      ? proposal.proposalDetails.addressToAdd
      : '',
    addressToRemove: 'proposalDetails' in proposal
      ? proposal.proposalDetails.addressToRemove
      : '',
  };
}
