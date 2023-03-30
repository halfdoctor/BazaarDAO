import { Classification, ProposalStatus } from '@q-dev/q-js-sdk';

import { ProposalContractType } from './contracts';
import { FormParameter } from './forms';

export type FormProposalType = 'q' | 'expert';
export type ProposalType = FormProposalType;

export type VotingType = 'basic' | 'constitution';

export interface Proposal {
  id: string;
  status: ProposalStatus;
  candidate: string;
  contract: ProposalContractType;
  parameters: FormParameter[];
  votingEndTime: number;
  votesFor: number;
  votesAgainst: number;
  requiredMajority: number;
  vetoEndTime: number;
  vetoesNumber: number;
  vetoThreshold: number;
  requiredQuorum: number;
  currentQuorum: number;
  rootNodesNumber: number;
  userVoted: boolean;
  userVetoed: boolean;
  key: string;
  implementation: string;
  proxy: string;
  addressToAdd: string;
  addressToRemove: string;
  remark: string;
  currentConstitutionHash: string;
  newConstitutionHash: string;
  classification?: Classification;
  replaceDest: string;
  amountToSlash: string | number;
  proposer: string;
}

export interface DaoProposalVotingInfo {
  votingStatus: ProposalStatus;
  votingStatus: string;
  requiredQuorum: string;
  currentQuorum: string;
  requiredMajority: string;
  currentMajority: string;
  currentVetoQuorum: string;
  requiredVetoQuorum: string;
}

export interface DaoProposalVotingParams {
  proposalExecutionPeriod: string;
  requiredMajority: string;
  requiredQuorum: string;
  requiredVetoQuorum: string;
  vetoEndTime: string;
  votingEndTime: string;
  votingStartTime: string;
  votingType: string;
}

export interface DaoProposalVotingCounters {
  vetoesCount: string;
  votedAgainst: string;
  votedFor: string;
}
export interface DaoProposal {
  id: string;
  remark: string;
  callData: string;
  target: string;
  relatedExpertPanel: string;
  params: DaoProposalVotingParams;
  counters: DaoProposalVotingCounters;
  executed:boolean;
}
