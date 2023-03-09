import {
  ConstitutionProposal,
  ConstitutionVotingInstance,
} from '@q-dev/q-js-sdk/lib/contracts/governance/constitution/ConstitutionVotingInstance';
import { EmergencyUpdateVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/EmergencyUpdateVotingInstance';
import { GeneralUpdateVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/GeneralUpdateVotingInstance';
import flatten from 'lodash/flatten';
import { ProposalEvent } from 'typings/contracts';
import { QProposalForm } from 'typings/forms';
import { Proposal } from 'typings/proposals';
import { fromWei } from 'web3-utils';

import { getContractProposals } from '.';

import {
  getConstitutionVotingInstance,
  getEmergencyUpdateVotingInstance,
  getGeneralUpdateVotingInstance,
} from 'contracts/contract-instance';

export async function getQProposals (proposals: ProposalEvent[], lastBlock: number) {
  const newProposals = await Promise.all([
    getContractProposals({
      proposals,
      contract: await getConstitutionVotingInstance(),
      lastBlock,
      contractName: 'constitutionVoting',
    }),
    getContractProposals({
      proposals,
      contract: await getEmergencyUpdateVotingInstance(),
      lastBlock,
      contractName: 'emergencyUpdateVoting',
    }),
    getContractProposals({
      proposals,
      contract: await getGeneralUpdateVotingInstance(),
      lastBlock,
      contractName: 'generalUpdateVoting',
    }),
  ]);

  return flatten(newProposals);
}

export async function createConstitutionProposal (form: QProposalForm, address: string) {
  const contract = await getConstitutionVotingInstance();
  return await contract.createProposal(
    form.externalLink,
    form.classification,
    form.hash,
    form.isParamsChanged
      ? form.params.map((item) => ({
        paramType: item.type,
        paramKey: item.key,
        paramValue: item.value,
      }))
      : [],
    { from: address }
  );
}

export async function createGeneralProposal (form: QProposalForm, address: string) {
  const contract = await getGeneralUpdateVotingInstance();
  return contract.createProposal(form.externalLink, { from: address });
}

export async function createEmergencyProposal (form: QProposalForm, address: string) {
  const contract = await getEmergencyUpdateVotingInstance();
  return contract.createProposal(form.externalLink, { from: address });
}

export async function getConstitutionProposal (
  contract: ConstitutionVotingInstance | EmergencyUpdateVotingInstance | GeneralUpdateVotingInstance,
  id: string
): Promise<Partial<Proposal>> {
  const proposal = await contract.getProposal(id);

  const isConstitution = contract instanceof ConstitutionVotingInstance;
  const base = proposal.base;

  return {
    remark: base.remark,
    votingEndTime: Number(base.params.votingEndTime),
    vetoEndTime: Number(base.params.vetoEndTime),

    votesFor: contract instanceof EmergencyUpdateVotingInstance
      ? Number(base.counters.weightFor)
      : Number(fromWei(base.counters.weightFor)),
    votesAgainst: contract instanceof EmergencyUpdateVotingInstance
      ? Number(base.counters.weightAgainst)
      : Number(fromWei(base.counters.weightAgainst)),
    vetoesNumber: Number(base.counters.vetosCount),

    currentConstitutionHash: isConstitution ? (proposal as ConstitutionProposal).currentConstitutionHash : '',
    newConstitutionHash: isConstitution ? (proposal as ConstitutionProposal).newConstitutionHash : '',
    classification: isConstitution ? (proposal as ConstitutionProposal).classification : undefined,
  };
}
