import { useCallback } from 'react';

import { DAO_RESERVED_NAME, DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { useWeb3Context } from 'context/Web3ContextProvider';
import { ErrorHandler } from 'helpers';
import { NewProposalForm } from 'typings/forms';
import {
  DaoProposal,
  DaoProposalVotingInfo,
  ProposalBaseInfo,
  VotingActionType
} from 'typings/proposals';

import { getState } from 'store';

import { daoInstance } from 'contracts/contract-instance';
import {
  createConstitutionProposal,
  createExternalProposal,
  createGeneralSituationProposal,
  createMembershipSituationProposal,
  createMultiCallProposal,
  createParameterSituationProposal,
} from 'contracts/helpers/proposals-helper';

import { PROPOSAL_STATUS } from 'constants/statuses';

export function useDaoProposals () {
  const { address: accountAddress } = useWeb3Context();

  async function getPanelSituations (panelName: string) {
    try {
      if (!daoInstance) return;
      const votingInstance = await daoInstance.getDAOVotingInstance(panelName);
      return await votingInstance.getVotingSituations();
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function getPanelSituationInfo (panelName: string, situation: string) {
    try {
      if (!daoInstance) return;
      const votingInstance = await daoInstance.getDAOVotingInstance(panelName);
      const votingSituationInfo = await votingInstance.getBasicVotingSituationInfo(situation);
      return votingSituationInfo;
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function getProposalsList (panelName: string, offset: number, limit: number) {
    try {
      if (!daoInstance) return;
      const votingInstance = await daoInstance.getDAOVotingInstance(panelName);
      return await votingInstance.getProposalList(offset, limit);
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function getProposal (panelName: string, proposalId: string | number) {
    try {
      if (!daoInstance) return;
      const votingInstance = await daoInstance.getDAOVotingInstance(panelName);
      return await votingInstance.getProposal(Number(proposalId));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function getProposalSituationLink (panelName: string, proposalId: string | number) {
    try {
      if (!daoInstance) return '';
      const votingInstance = await daoInstance.getDAOVotingInstance(panelName);
      return await votingInstance.proposalSituationLink(Number(proposalId));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return '';
    }
  }

  async function checkIsUserVoted (proposalId: number, panel: string) {
    try {
      if (!daoInstance || !accountAddress) return false;
      const votingInstance = await daoInstance.getDAOVotingInstance(panel);
      return await votingInstance.instance.hasUserVoted(proposalId, accountAddress);
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return false;
    }
  }

  async function checkIsUserVetoed (proposalId: number, panel: string) {
    try {
      if (!daoInstance || !accountAddress) return false;
      const votingInstance = await daoInstance.getDAOVotingInstance(panel);
      return await votingInstance.instance.hasUserVetoed(proposalId, accountAddress);
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return false;
    }
  }

  async function checkIsExpertVoted (proposalId: number, panel: string) {
    try {
      if (!daoInstance || !accountAddress || panel === DAO_RESERVED_NAME) return false;
      const votingInstance = await daoInstance.getDAOVotingInstance(panel);
      return await votingInstance.instance.hasExpertVoted(proposalId, accountAddress);
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return false;
    }
  }

  async function getUserVotingStats (proposal: DaoProposal) {
    const proposalId = proposal.id.toNumber();
    const [isUserVoted, isUserVetoed, isUserExpertVoted] = await Promise.all([
      checkIsUserVoted(proposalId, proposal.relatedExpertPanel),
      checkIsUserVetoed(proposalId, proposal.relatedExpertPanel),
      checkIsExpertVoted(proposalId, proposal.relatedExpertPanel),
    ]);
    return { isUserVoted, isUserVetoed, isUserExpertVoted };
  }

  async function getProposalVetoStats (proposal: DaoProposal) {
    try {
      if (!daoInstance) return;
      const permissionManagerInstance = await daoInstance.getPermissionManagerInstance();
      const isVetoGroupExists = await permissionManagerInstance.isVetoGroupExists(proposal.target);
      const vetoMembersCount = isVetoGroupExists
        ? (await permissionManagerInstance.instance.getVetoMembersCount(proposal.target)).toString()
        : '0';
      const vetoGroupInfo = (await permissionManagerInstance.instance
        .getVetoGroupInfo(proposal.target));
      return { isVetoGroupExists, vetoMembersCount, vetoGroupInfo };
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function getProposalMembersCount (proposal: DaoProposal) {
    try {
      if (!daoInstance || proposal.relatedExpertPanel === DAO_RESERVED_NAME) return '0';
      const memberStorageInstance = await daoInstance.getMemberStorageInstance(proposal.relatedExpertPanel);
      const count = await memberStorageInstance.instance.getMembersCount();
      return count.toString();
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function getAccountStatuses () {
    try {
      if (!daoInstance || !accountAddress) return [];
      return await daoInstance.DAORegistryInstance.getAccountStatuses(
        accountAddress
      );
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return [];
    }
  }

  async function getProposalVotingDetails (proposal: DaoProposal) {
    if (!daoInstance) return;

    const votingInstance = await daoInstance.getDAOVotingInstance(proposal.relatedExpertPanel);
    const proposalVotingStats = await votingInstance.getProposalVotingStats(Number(proposal.id.toString()));
    const proposalStatus = await votingInstance.instance.getProposalStatus(proposal.id.toString());
    return { ...proposalVotingStats, votingStatus: proposalStatus } as DaoProposalVotingInfo;
  }

  async function getExtendedVotingStats (proposal: DaoProposal) {
    try {
      if (!daoInstance || proposal.relatedExpertPanel === DAO_RESERVED_NAME) return;

      const votingInstance = await daoInstance.getDAOVotingInstance(proposal.relatedExpertPanel);
      return await votingInstance.getExtendedVotingStats(proposal.id.toString());
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function getExtendedProposalStats (proposal: DaoProposal) {
    try {
      if (!daoInstance || proposal.relatedExpertPanel === DAO_RESERVED_NAME) return;

      const votingInstance = await daoInstance.getDAOVotingInstance(proposal.relatedExpertPanel);
      return await votingInstance.instance.extendedProposals(proposal.id.toString());
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function getProposalTurnoutCount (proposal: DaoProposal) {
    if (!daoInstance) return '0';
    const totalVoteValue = await daoInstance.getProposalTotalParticipate(
      proposal.relatedExpertPanel,
      Number(proposal.id.toString())
    );
    return totalVoteValue.toString();
  }

  async function checkIsAppealConfigured (proposal: DaoProposal) {
    try {
      if (!daoInstance || proposal.relatedExpertPanel === DAO_RESERVED_NAME) return false;
      const votingInstance = await daoInstance.getDAOVotingInstance(proposal.relatedExpertPanel);
      return await votingInstance.isAppealConfigured(proposal.id);
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return false;
    }
  }

  async function checkIsVoteByExpertConfigured (proposal: DaoProposal) {
    try {
      if (!daoInstance || proposal.relatedExpertPanel === DAO_RESERVED_NAME) return false;
      const votingInstance = await daoInstance.getDAOVotingInstance(proposal.relatedExpertPanel);
      return await votingInstance.isVoteByExpertConfigured(proposal.id);
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return false;
    }
  }

  async function getProposalBaseInfo (panelName: string, proposalId: string | number) {
    try {
      const proposal = (await getProposal(panelName, proposalId)) as DaoProposal;
      if (!proposal) return;

      const [
        userVotingInfo,
        userVetoInfo,
        proposalInfo,
        totalVoteValue,
        membersCount,
        expertsVotingStats,
        extendedStats,
        isVoteByExpertConfigured,
        isAppealConfigured,
      ] = await Promise.all([
        getUserVotingStats(proposal),
        getProposalVetoStats(proposal),
        getProposalVotingDetails(proposal),
        getProposalTurnoutCount(proposal),
        getProposalMembersCount(proposal),
        getExtendedVotingStats(proposal),
        getExtendedProposalStats(proposal),
        checkIsVoteByExpertConfigured(proposal),
        checkIsAppealConfigured(proposal)
      ]);

      return {
        totalVoteValue,
        membersCount,
        expertsVotingStats,
        extendedStats,
        isVoteByExpertConfigured,
        isAppealConfigured,
        ...proposal,
        ...userVotingInfo,
        ...userVetoInfo,
        ...proposalInfo
      } as ProposalBaseInfo;
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function createNewProposal (form: NewProposalForm, isExternalSituation?: boolean) {
    if (isExternalSituation) {
      return createExternalProposal(form);
    }

    switch (form.type) {
      case DefaultVotingSituations.General:
        const { tokenInfo } = getState().daoToken;
        const { canDAOSupportExternalLinks } = getState().dao;
        return createGeneralSituationProposal(form, tokenInfo, canDAOSupportExternalLinks);
      case DefaultVotingSituations.Membership:
        return createMembershipSituationProposal(form);
      case DefaultVotingSituations.Constitution:
        return createConstitutionProposal(form);
      case DefaultVotingSituations.RegularParameter:
        return createParameterSituationProposal(form, DefaultVotingSituations.RegularParameter);
      case DefaultVotingSituations.ConfigurationParameter:
        return createParameterSituationProposal(form, DefaultVotingSituations.ConfigurationParameter);
      case DefaultVotingSituations.DAORegistry:
        return createMultiCallProposal(form, 'DAORegistry');
      case DefaultVotingSituations.PermissionManager:
        return createMultiCallProposal(form, 'PermissionManager');
    }
  }

  async function voteForProposal ({
    proposal,
    type,
    isVotedFor
  }: {
    proposal: DaoProposal;
    type: VotingActionType;
    isVotedFor?: boolean;
  }) {
    if (!daoInstance || !accountAddress) return;
    const votingInstance = await daoInstance.getDAOVotingInstance(proposal.relatedExpertPanel);

    if (type === 'vote') {
      return isVotedFor
        ? votingInstance.voteFor(Number(proposal.id), { from: accountAddress })
        : votingInstance.voteAgainst(Number(proposal.id), { from: accountAddress });
    }

    if (type === 'expert-vote') {
      return isVotedFor
        ? votingInstance.voteByExpertFor(Number(proposal.id), { from: accountAddress })
        : votingInstance.voteByExpertAgainst(Number(proposal.id), { from: accountAddress });
    }

    return votingInstance.veto(Number(proposal.id), { from: accountAddress });
  }

  async function executeProposal (proposal: DaoProposal) {
    if (!daoInstance || !accountAddress) return;
    const votingInstance = await daoInstance.getDAOVotingInstance(proposal.relatedExpertPanel);
    const promiseStatus = await votingInstance.instance.getProposalStatus(Number(proposal.id));
    return promiseStatus === PROPOSAL_STATUS.passed && !proposal.executed
      ? votingInstance.executeProposal(Number(proposal.id), { from: accountAddress })
      : undefined;
  }

  async function appealProposal (proposal: DaoProposal) {
    if (!daoInstance) return;
    const votingInstance = await daoInstance.getDAOVotingInstance(proposal.relatedExpertPanel);
    return votingInstance.appealByUser(proposal.id);
  }

  return {
    createNewProposal: useCallback(createNewProposal, []),
    voteForProposal: useCallback(voteForProposal, []),
    executeProposal: useCallback(executeProposal, []),
    getProposal: useCallback(getProposal, []),
    getProposalsList: useCallback(getProposalsList, []),
    getProposalSituationLink: useCallback(getProposalSituationLink, []),
    getProposalVotingDetails: useCallback(getProposalVotingDetails, []),
    getPanelSituations: useCallback(getPanelSituations, []),
    getUserVotingStats: useCallback(getUserVotingStats, []),
    getProposalVetoStats: useCallback(getProposalVetoStats, []),
    getProposalBaseInfo: useCallback(getProposalBaseInfo, []),
    getAccountStatuses: useCallback(getAccountStatuses, []),
    getPanelSituationInfo: useCallback(getPanelSituationInfo, []),
    appealProposal: useCallback(appealProposal, [])
  };
}
