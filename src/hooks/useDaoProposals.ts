import { useCallback } from 'react';

import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { NewProposalForm } from 'typings/forms';
import {
  DaoProposal,
  DaoProposalVotingInfo,
  ProposalBaseInfo,
  ProposalVetoGroupInfo,
  VotingSituationInfo,
  VotingType
} from 'typings/proposals';

import { getUserAddress } from 'store';

import { daoInstance } from 'contracts/contract-instance';
import {
  createConstitutionProposal,
  createGeneralSituationProposal,
  createMembershipSituationProposal,
  createParameterSituationProposal
} from 'contracts/helpers/proposals-helper';

import { PROPOSAL_STATUS } from 'constants/statuses';
import { captureError } from 'utils/errors';

export function useDaoProposals () {
  async function getPanelSituations (panelName: string) {
    try {
      if (!daoInstance) return;
      const votingInstance = await daoInstance.getVotingInstance(panelName);
      return votingInstance.instance.methods.getVotingSituations().call();
    } catch (error) {
      captureError(error);
    }
  }

  async function getPanelSituationInfo (panelName: string, situation: string) {
    try {
      if (!daoInstance) return;
      const votingInstance = await daoInstance.getVotingInstance(panelName);
      const votingSituationInfo = await votingInstance.instance.methods
        .getVotingSituationInfo(situation).call();
      return votingSituationInfo as unknown as VotingSituationInfo; // fix
    } catch (error) {
      captureError(error);
    }
  }

  async function getProposalsList (panelName: string, offset: number, limit: number) {
    try {
      if (!daoInstance) return;
      const votingInstance = await daoInstance.getVotingInstance(panelName);
      return votingInstance.getProposalList(offset, limit);
    } catch (error) {
      captureError(error);
    }
  }

  async function getProposal (panelName: string, proposalId: string | number) {
    try {
      if (!daoInstance) return;
      const votingInstance = await daoInstance.getVotingInstance(panelName);
      return votingInstance.getProposal(Number(proposalId));
    } catch (error) {
      captureError(error);
    }
  }

  async function getUserVotingStats (proposal: DaoProposal) {
    try {
      if (!daoInstance) return;
      const votingInstance = await daoInstance.getVotingInstance(proposal.relatedExpertPanel);
      const isUserVoted = await votingInstance.instance.methods
        .hasUserVoted(Number(proposal.id), getUserAddress())
        .call();
      const isUserVetoed = await votingInstance.instance.methods
        .hasExpertVetoed(Number(proposal.id), getUserAddress())
        .call();
      return { isUserVoted, isUserVetoed };
    } catch (error) {
      captureError(error);
    }
  }

  async function getProposalVetoStats (proposal: DaoProposal) {
    try {
      if (!daoInstance) return;
      const permissionManagerInstance = await daoInstance.getPermissionManagerInstance();
      const isVetoGroupExists = await permissionManagerInstance.isVetoGroupExists(proposal.target);
      const vetoMembersCount = isVetoGroupExists
        ? await permissionManagerInstance.instance.methods.getVetoMembersCount(proposal.target).call()
        : '0';
      const vetoGroupInfo = (await permissionManagerInstance.instance.methods
        .getVetoGroupInfo(proposal.target)
        .call()) as ProposalVetoGroupInfo;
      return { isVetoGroupExists, vetoMembersCount, vetoGroupInfo };
    } catch (error) {
      captureError(error);
    }
  }
  async function getAccountStatuses () {
    try {
      if (!daoInstance) return;
      const accountGroupStatuses = (await daoInstance.DAORegistryInstance.getAccountStatuses(
        getUserAddress()
      )) as string[];
      return accountGroupStatuses;
    } catch (error) {
      captureError(error);
    }
  }

  async function getProposalVotingDetails (proposal: DaoProposal) {
    try {
      if (!daoInstance) return;

      const votingInstance = await daoInstance.getVotingInstance(proposal.relatedExpertPanel);
      const proposalVotingStats = await votingInstance.getProposalVotingStats(Number(proposal.id));
      const proposalStatus = await votingInstance.instance.methods.getProposalStatus(proposal.id).call();
      return { ...proposalVotingStats, votingStatus: proposalStatus } as DaoProposalVotingInfo;
    } catch (error) {
      captureError(error);
    }
  }

  async function getProposalTurnoutDetails (proposal: DaoProposal) {
    try {
      if (!daoInstance) return;
      const totalVoteValue = await daoInstance.getProposalTotalParticipate(
        proposal.relatedExpertPanel,
        Number(proposal.id)
      );
      return totalVoteValue;
    } catch (error) {
      captureError(error);
    }
  }

  async function getProposalBaseInfo (panelName: string, proposalId: string | number) {
    try {
      const proposal = (await getProposal(panelName, proposalId)) as DaoProposal;
      if (!proposal) return;
      const [userVotingInfo, userVetoInfo, proposalInfo, totalVoteValue] = await Promise.all([
        getUserVotingStats(proposal),
        getProposalVetoStats(proposal),
        getProposalVotingDetails(proposal),
        getProposalTurnoutDetails(proposal)
      ]);

      return {
        totalVoteValue,
        ...proposal,
        ...userVotingInfo,
        ...userVetoInfo,
        ...proposalInfo
      } as ProposalBaseInfo;
    } catch (error) {
      captureError(error);
    }
  }

  async function createNewProposal (form: NewProposalForm) {
    switch (form.type) {
      case DefaultVotingSituations.GeneralSituation:
        return createGeneralSituationProposal(form);
      case DefaultVotingSituations.MembershipSituation:
        return createMembershipSituationProposal(form);
      case DefaultVotingSituations.ConstitutionSituation:
        return createConstitutionProposal(form);
      case DefaultVotingSituations.ParameterSituation:
        return createParameterSituationProposal(form);
    }
  }

  async function voteForProposal ({
    proposal,
    type,
    isVotedFor
  }: {
    proposal: DaoProposal;
    type: VotingType;
    isVotedFor?: boolean;
  }) {
    if (!daoInstance) return;
    const votingInstance = await daoInstance.getVotingInstance(proposal.relatedExpertPanel);
    const userAddress = getUserAddress();

    if (type === 'vote') {
      return isVotedFor
        ? votingInstance.voteFor(Number(proposal.id), { from: userAddress })
        : votingInstance.voteAgainst(Number(proposal.id), { from: userAddress });
    }

    return votingInstance.veto(Number(proposal.id), { from: userAddress });
  }

  async function executeProposal (proposal: DaoProposal) {
    if (!daoInstance) return;
    const votingInstance = await daoInstance.getVotingInstance(proposal.relatedExpertPanel);
    const userAddress = getUserAddress();
    const promiseStatus = await votingInstance.instance.methods.getProposalStatus(Number(proposal.id)).call();
    return promiseStatus === PROPOSAL_STATUS.passed && !proposal.executed
      ? votingInstance.executeProposal(Number(proposal.id), { from: userAddress })
      : undefined;
  }

  return {
    createNewProposal: useCallback(createNewProposal, []),
    voteForProposal: useCallback(voteForProposal, []),
    executeProposal: useCallback(executeProposal, []),
    getProposal: useCallback(getProposal, []),
    getProposalsList: useCallback(getProposalsList, []),
    getProposalVotingDetails: useCallback(getProposalVotingDetails, []),
    getPanelSituations: useCallback(getPanelSituations, []),
    getUserVotingStats: useCallback(getUserVotingStats, []),
    getProposalVetoStats: useCallback(getProposalVetoStats, []),
    getProposalBaseInfo: useCallback(getProposalBaseInfo, []),
    getAccountStatuses: useCallback(getAccountStatuses, []),
    getPanelSituationInfo: useCallback(getPanelSituationInfo, [])
  };
}
