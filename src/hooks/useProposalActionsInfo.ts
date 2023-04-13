
import { useCallback } from 'react';

import { toBigNumber } from '@q-dev/utils';
import { fromWei } from 'web3-utils';

import { useDaoProposals } from './useDaoProposals';

import { getUserAddress } from 'store';
import { useDaoVault } from 'store/dao-vault/hooks';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

function useProposalActionsInfo () {
  const { vaultBalance } = useDaoVault();
  const { getPanelSituationInfo } = useDaoProposals();

  async function checkIsUserMember (panelName: string) {
    try {
      if (!daoInstance) return false;
      const memberStorageInstance = await daoInstance.getMemberStorageInstance(panelName);
      return memberStorageInstance.instance.methods.isMember(getUserAddress()).call();
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
        .instance.methods.getVetoGroupMembers(target).call();
      return vetoGroupMembers.includes(getUserAddress());
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
        .isGreaterThan(fromWei(situationInfo?.votingMinAmount));
      return isUserHasVotingPower && (situationInfo.votingType === '0' || isUserMember);
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
        .isGreaterThan(fromWei(situationInfo?.votingMinAmount));
      return isUserHasVotingPower && (situationInfo.votingType !== '1' || isUserMember);
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
