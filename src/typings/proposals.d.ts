import { ProposalStatus } from '@q-dev/q-js-sdk';

export type VotingType = 'vote' | 'veto';

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
  relatedVotingSituation: string;
  params: DaoProposalVotingParams;
  counters: DaoProposalVotingCounters;
  executed:boolean;
}

export interface UserProposalVotingInfo {
  isUserVoted: boolean;
  isUserVetoed: boolean;
}

export interface ProposalVetoGroupInfo {
  target: string;
  name: string;
  members: string[];
  linkedMemberStorage: string;
}

export interface ProposalVetoInfo {
  isVetoGroupExists: boolean;
  vetoMembersCount: string;
}

export type ProposalBaseInfo = DaoProposal & DaoProposalVotingInfo & UserProposalVotingInfo
& ProposalVetoGroupInfo & ProposalVetoInfo;
