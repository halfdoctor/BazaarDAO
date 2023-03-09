import { ParameterType, ProposalStatus, RawParameter, VotingStats } from '@q-dev/q-js-sdk';
import { ConstitutionVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/constitution/ConstitutionVotingInstance';
import { EPQFIMembershipVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPQFIMembershipVotingInstance';
import { transformToPercentage } from '@q-dev/utils';
import merge from 'lodash/merge';
import uniqBy from 'lodash/uniqBy';
import { ContractType, ProposalContractType, ProposalEvent, ProposalsContract } from 'typings/contracts';
import { CreateProposalForm, FormParameter } from 'typings/forms';
import { Proposal, ProposalType } from 'typings/proposals';

import { getMinimalActiveBlockHeight } from '../block-number';

import {
  createConstitutionProposal,
  createEmergencyProposal,
  createGeneralProposal,
  getConstitutionProposal,
  getQProposals,
} from './constitution';
import {
  createAddExpertProposal,
  createParameterVoteProposal,
  createRemoveExpertProposal,
  getExpertProposal,
  getExpertProposals,
} from './expert';

import { getState, getUserAddress } from 'store';

import { getInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

async function checkProposal (contract: ProposalsContract, proposal: ProposalEvent) {
  const status = await contract.getStatus(proposal.id);
  if (status === ProposalStatus.NONE) return { ...proposal, status };
  const isActive = [ProposalStatus.PENDING, ProposalStatus.ACCEPTED, ProposalStatus.PASSED].includes(status);
  return {
    ...proposal,
    status: isActive ? 'active' : 'ended',
  };
}

function getOldestActiveBlockFromStorage () {
  const { user } = getState();
  return JSON.parse(localStorage.getItem('oldestActiveBlock ' + user.chainId) || '{}');
}

async function getOldestBlock (contractName: ContractType) {
  const { minimalActiveBlockHeight } = await getMinimalActiveBlockHeight();
  const oldestActiveBlocks = getOldestActiveBlockFromStorage();
  return oldestActiveBlocks[contractName] ?? minimalActiveBlockHeight;
}

async function changeOldestBlock (contractName: ContractType, proposals: ProposalEvent[]) {
  const { lastBlockHeight } = await getMinimalActiveBlockHeight();

  const oldestActiveBlocks = getOldestActiveBlockFromStorage();

  const oldestActiveProposal = Math.min(
    ...proposals.filter(({ status }) => status === 'active').map(({ blockNumber }) => blockNumber)
  );

  localStorage.setItem(
    'oldestActiveBlock ' + getState().user.chainId,
    JSON.stringify(
      merge(oldestActiveBlocks, {
        [contractName]: isFinite(oldestActiveProposal) ? oldestActiveProposal : lastBlockHeight,
      })
    )
  );
}

export async function getContractProposals ({
  proposals,
  contract,
  lastBlock,
  contractName,
}: {
  proposals: ProposalEvent[];
  contract: ProposalsContract;
  lastBlock: number;
  contractName: ContractType;
}): Promise<ProposalEvent[]> {
  try {
    const contractProposals = proposals.filter(({ contract }) => contract === contractName);
    const activeProposals = contractProposals.filter(({ status }) => status === 'active');

    const newProposals = await getProposalPastEvents(contract, {
      fromBlock: lastBlock,
      contractName,
    });

    const oldestBlock = await getOldestBlock(contractName);

    const proposalsBeforeActiveBlock = newProposals
      .filter((proposal) => proposal.blockNumber < oldestBlock)
      .map((item) => ({ ...item, status: 'ended' }));

    const proposalsAfterActiveBlock = newProposals.filter((proposal) => proposal.blockNumber >= oldestBlock);

    const proposalsWithStatus = await Promise.all(
      [...activeProposals, ...proposalsAfterActiveBlock].map((proposal) => checkProposal(contract, proposal))
    );

    await changeOldestBlock(contractName, proposalsWithStatus);

    return uniqBy([...proposalsWithStatus, ...proposalsBeforeActiveBlock, ...contractProposals], 'id');
  } catch (error) {
    captureError(error);
    return [];
  }
}

export async function getProposalPastEvents (
  contract: ProposalsContract,
  { fromBlock = 0, toBlock = 'latest', contractName = '' }
): Promise<ProposalEvent[]> {
  const pastEvents = await contract.instance.getPastEvents('ProposalCreated', { fromBlock, toBlock });

  return pastEvents.map((evt) => ({
    blockNumber: evt.blockNumber,
    id: evt.returnValues._id || evt.returnValues._proposalId,
    contract: contractName as ProposalContractType,
  }));
}

export function getProposalEvents (proposalType: ProposalType, proposals: ProposalEvent[], lastBlock: number) {
  switch (proposalType) {
    case 'q':
      return getQProposals(proposals, lastBlock);
    case 'expert':
      return getExpertProposals(proposals, lastBlock);
  }
}

export function createProposal (form: CreateProposalForm, address: string) {
  switch (form.type) {
    case 'constitution':
      return createConstitutionProposal(form, address);
    case 'emergency':
      return createEmergencyProposal(form, address);
    case 'general':
      return createGeneralProposal(form, address);
    case 'add-expert':
      return createAddExpertProposal(form, address);
    case 'remove-expert':
      return createRemoveExpertProposal(form, address);
    case 'parameter-vote':
      return createParameterVoteProposal(form, address);
  }
}

export function getProposalTypeByContract (contract: ProposalContractType): ProposalType {
  switch (contract) {
    case 'constitutionVoting':
    case 'emergencyUpdateVoting':
    case 'generalUpdateVoting':
      return 'q';
    case 'epqfiMembershipVoting':
    case 'epdrMembershipVoting':
    case 'epqfiParametersVoting':
    case 'epdrParametersVoting':
    case 'eprsMembershipVoting':
    case 'eprsParametersVoting':
      return 'expert';
  }
}

export async function getProposal<T extends ProposalContractType> (
  contractType: T,
  id: string
): Promise<Proposal | null> {
  try {
    const userAddress = getUserAddress();
    const contract = await getInstance<T>(contractType)();
    const status = await contract.getStatus(id);
    if (status === ProposalStatus.NONE) return null;

    const proposal = await getContractProposal({ contract, contractType, status, id });
    const stats = (await contract.getProposalStats(id)) as VotingStats;
    const parameters = 'getParametersArr' in contract ? await contract.getParametersArr(id) : [];

    const userVoted = await contract.hasUserVoted(id, userAddress);
    const userVetoed = 'hasRootVetoed' in contract ? await contract.hasRootVetoed(id, userAddress) : false;

    return {
      id,
      status,
      contract: contractType,
      parameters: convertProposalParameters(parameters),
      requiredMajority: Number(transformToPercentage(stats.requiredMajority)),
      userVoted,
      userVetoed,
      vetoThreshold: 50,
      requiredQuorum: Number(transformToPercentage(stats.requiredQuorum)) || 0,
      currentQuorum: Number(transformToPercentage(stats.currentQuorum)) || 0,
      ...proposal,
    } as Proposal;
  } catch (e) {
    captureError(e);
    return null;
  }
}

async function getContractProposal ({
  contract,
  id,
  contractType,
}: {
  contract: ProposalsContract;
  id: string;
  status: ProposalStatus;
  contractType: ProposalContractType;
}) {
  let proposal: Partial<Proposal> = {};
  switch (contractType) {
    case 'constitutionVoting':
    case 'emergencyUpdateVoting':
    case 'generalUpdateVoting':
      proposal = await getConstitutionProposal(contract as ConstitutionVotingInstance, id);
      break;
    case 'epqfiMembershipVoting':
    case 'epdrMembershipVoting':
    case 'eprsMembershipVoting':
    case 'epqfiParametersVoting':
    case 'epdrParametersVoting':
    case 'eprsParametersVoting':
      proposal = await getExpertProposal(contract as EPQFIMembershipVotingInstance, id);
      break;
  }

  return proposal;
}

function convertProposalParameters (params: RawParameter[]): FormParameter[] {
  return params.map((item) => {
    const parameterValueMap: Record<ParameterType, string> = {
      [ParameterType.ADDRESS]: item.addrValue,
      [ParameterType.BOOL]: String(item.boolValue),
      [ParameterType.BYTE]: item.bytes32value,
      [ParameterType.UINT]: item.uintValue,
      [ParameterType.STRING]: item.strValue,
      [ParameterType.NONE]: '',
    };

    return {
      type: item.paramType,
      value: parameterValueMap[item.paramType],
      key: item.paramKey,
    };
  });
}
