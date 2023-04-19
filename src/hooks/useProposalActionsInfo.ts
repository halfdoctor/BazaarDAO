
import { useCallback } from 'react';

import { DAO_RESERVED_NAME } from '@q-dev/gdk-sdk';
import { toBigNumber } from '@q-dev/utils';
import { useWeb3Context } from 'context/Web3ContextProvider';

import { useDaoProposals } from './useDaoProposals';

import { useDaoVault } from 'store/dao-vault/hooks';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

function useProposalActionsInfo () {
  const { vaultBalance } = useDaoVault();
  const { getPanelSituationInfo } = useDaoProposals();
  const { currentProvider } = useWeb3Context();

  async function checkIsUserMember (panelName: string) {
    try {
      if (!daoInstance || panelName === DAO_RESERVED_NAME) return false;
      const memberStorageInstance = await daoInstance.getMemberStorageInstance(panelName);
      return memberStorageInstance.instance.isMember(currentProvider.selectedAddress);
    } catch (error) {
      captureError(error);
      return false;
    }
  }
  async function checkIsUserCanVeto (target: string) {
    try {
      if (!daoInstance) return false;
      const permissionManagerInstance = await daoInstance.getPermissionManagerInstance();
      const vetoGroupMembers = await permissionManagerInstance
        .instance.getVetoGroupMembers(target);
      return vetoGroupMembers.includes(currentProvider.selectedAddress);
    } catch (error) {
      captureError(error);
      return false;
    }
  }
  async function checkIsUserCanCreateProposal (panelName: string, situation: string) {
    try {
      const situationInfo = await getPanelSituationInfo(panelName, situation);
      if (!situationInfo) return false;
      const isUserMember = await checkIsUserMember(panelName);
      const isUserHasVotingPower = toBigNumber(vaultBalance)
        .isGreaterThanOrEqualTo(situationInfo?.votingMinAmount.toString());
      return isUserHasVotingPower && (situationInfo.votingType.toString() === '0' || isUserMember);
    } catch (error) {
      captureError(error);
      return false;
    }
  };

  async function checkIsUserCanVoting (panelName: string, situation: string) {
    try {
      const situationInfo = await getPanelSituationInfo(panelName, situation);
      if (!situationInfo) return false;
      const isUserMember = await checkIsUserMember(panelName);
      const isUserHasVotingPower = toBigNumber(vaultBalance)
        .isGreaterThanOrEqualTo(situationInfo?.votingMinAmount.toString());
      return isUserHasVotingPower && (situationInfo.votingType.toString() !== '1' || isUserMember);
    } catch (error) {
      captureError(error);
      return false;
    }
  };

  return {
    checkIsUserCanVeto: useCallback(checkIsUserCanVeto, []),
    checkIsUserCanCreateProposal: useCallback(checkIsUserCanCreateProposal, []),
    checkIsUserCanVoting: useCallback(checkIsUserCanVoting, []),
    checkIsUserMember: useCallback(checkIsUserMember, [])
  };
}

export default useProposalActionsInfo;
