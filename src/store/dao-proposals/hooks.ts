import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { ProposalStatus, SubmitTransactionResponse } from '@q-dev/q-js-sdk';
import { TagState } from '@q-dev/q-ui-kit/dist/components/Tag';
import { CreateProposalForm } from 'typings/forms';
import { DaoProposalVotingInfo, Proposal, VotingType } from 'typings/proposals';

import { setPanelsName } from './reducer';

import { getUserAddress, useAppSelector } from 'store';
import { useDaoVault } from 'store/dao-vault/hooks';

import { daoInstance, getInstance, getPermissionManagerInstance } from 'contracts/contract-instance';
import { createProposal, getProposalEvents } from 'contracts/helpers/voting';

import { captureError } from 'utils/errors';

export function useDaoProposals () {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loadDelegationInfo, loadLockInfo } = useDaoVault();

  const proposalsMap = useAppSelector(({ proposals }) => proposals.proposalsMap);
  const panelsName = useAppSelector(({ daoProposals }) => daoProposals.panelsName);

  async function getPanelsName () {
    try {
      if (!daoInstance) return;
      const allPanelsName = await daoInstance.DAORegistryInstance.instance.methods.getPanels().call();
      dispatch(setPanelsName(allPanelsName));
    } catch (error) {
      captureError(error);
    }
  }

  async function getPanelSituation (panelName: string) {
    try {
      if (!daoInstance) return;
      const panel1 = await daoInstance.getVotingInstance(panelName);
      return panel1.instance.methods.getVotingSituations().call();
    } catch (error) {
      captureError(error);
    }
  }

  async function getProposal (panelName: string, proposalId: string | number) {
    try {
      if (!daoInstance) return;
      const panel = await daoInstance.getVotingInstance(panelName);

      return panel.getProposal(Number(proposalId));
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

  async function getProposalInfo (id: string, panelName: string) {
    try {
      if (!daoInstance) return;

      const votingInstance = await daoInstance.getVotingInstance(panelName);
      const proposalVotingStats = await votingInstance.getProposalVotingStats(Number(id));
      const proposalStatus = await votingInstance.instance.methods.getProposalStatus(id).call();
      return { ...proposalVotingStats, votingStatus: proposalStatus } as DaoProposalVotingInfo;
    } catch (error) {
      captureError(error);
    }
  }

  async function getProposalVetoInfo (target: string) {
    try {
      if (!daoInstance) return;
      const managerAddress = await daoInstance.DAORegistryInstance.instance.methods.getPermissionManager().call();
      const permissionManagerInstance = getPermissionManagerInstance(managerAddress);
      const isVetoGroupExists = await permissionManagerInstance.isVetoGroupExists(target);
      const vetoMembersCount = isVetoGroupExists
        ? await permissionManagerInstance.instance.methods.getVetoMembersCount(target).call()
        : '';
      return { isVetoGroupExists, vetoMembersCount };
    } catch (error) {
      captureError(error);
    }
  }

  const getStatusState = (status: string): TagState => {
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

  const statusMap: Record<ProposalStatus, string> = {
    [ProposalStatus.ACCEPTED]: t('STATUS_ACCEPTED'),
    [ProposalStatus.EXECUTED]: t('STATUS_EXECUTED'),
    [ProposalStatus.EXPIRED]: t('STATUS_EXPIRED'),
    [ProposalStatus.NONE]: t('STATUS_NONE'),
    [ProposalStatus.PASSED]: t('STATUS_PASSED'),
    [ProposalStatus.PENDING]: t('STATUS_PENDING'),
    [ProposalStatus.REJECTED]: t('STATUS_REJECTED'),
    [ProposalStatus.OBSOLETE]: t('STATUS_OBSOLETE'),
  };

  async function createNewProposal (form: CreateProposalForm) {
    const userAddress = getUserAddress();
    const receipt = await createProposal(form, userAddress);

    return receipt;
  }

  async function voteForProposal ({ proposal, type, isVotedFor }: {
    proposal: Proposal;
    type: VotingType;
    isVotedFor?: boolean;
  }) {
    const userAddress = getUserAddress();
    const contract = await getInstance(proposal.contract)();

    let receipt: SubmitTransactionResponse | undefined;
    let methodError: string | undefined;
    switch (type) {
      case 'constitution':
        if ('veto' in contract) {
          receipt = await contract.veto(proposal.id, { from: userAddress });
        } else {
          methodError = 'veto';
        }
        break;
      case 'basic':
        if ('voteFor' in contract && 'voteAgainst' in contract) {
          receipt = isVotedFor
            ? await contract.voteFor(proposal.id, { from: userAddress })
            : await contract.voteAgainst(proposal.id, { from: userAddress });
        } else {
          methodError = isVotedFor ? 'voteFor' : 'voteAgainst';
        }
        break;
    }

    if (methodError && !receipt) {
      throw new Error(t('ERROR_METHOD_MISSING_FROM_CONTRACT', { method: methodError }));
    }

    receipt?.promiEvent
      .once('receipt', () => {
        loadDelegationInfo(userAddress);
        loadLockInfo(userAddress);
      });

    return receipt as SubmitTransactionResponse;
  }

  async function executeProposal (proposal: Proposal) {
    const userAddress = getUserAddress();
    const contract = await getInstance(proposal.contract)();

    let receipt: SubmitTransactionResponse | undefined;
    const promiseStatus = await contract.getStatus(proposal.id);

    if (promiseStatus === ProposalStatus.PASSED) {
      if ('execute' in contract) {
        receipt = await contract.execute(proposal.id, { from: userAddress });

        receipt.promiEvent
          .once('receipt', () => {
            loadDelegationInfo(userAddress);
          });
      } else {
        throw new Error(t('ERROR_METHOD_MISSING_FROM_CONTRACT', { method: 'execute' }));
      }
    } else {
      loadDelegationInfo(userAddress);
    }

    return receipt;
  }

  return {
    proposalsMap,
    panelsName,
    statusMap,
    getStatusState,

    getProposal: useCallback(getProposal, []),
    getProposalEvents: useCallback(getProposalEvents, []),
    createNewProposal: useCallback(createNewProposal, []),
    voteForProposal: useCallback(voteForProposal, []),
    executeProposal: useCallback(executeProposal, []),

    getPanelsName: useCallback(getPanelsName, []),
    getProposalsList: useCallback(getProposalsList, []),
    getProposalInfo: useCallback(getProposalInfo, []),
    getPanelSituation: useCallback(getPanelSituation, []),
    getProposalVetoInfo: useCallback(getProposalVetoInfo, []),
  };
}
