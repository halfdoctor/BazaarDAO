
import { useCallback } from 'react';

import { DAO_RESERVED_NAME } from '@q-dev/gdk-sdk';
import { toBigNumber } from '@q-dev/utils';

import { useDaoProposals } from './useDaoProposals';

import { useDaoTokenStore } from 'store/dao-token/hooks';
import { useDaoVault } from 'store/dao-vault/hooks';
import { useProviderStore } from 'store/provider/hooks';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';
import { fromWeiWithDecimals } from 'utils/numbers';

function useProposalActionsInfo () {
  const { vaultBalance } = useDaoVault();
  const { getPanelSituationInfo } = useDaoProposals();
  const { tokenInfo } = useDaoTokenStore();
  const { currentProvider } = useProviderStore();

  async function checkIsUserMember (panelName: string) {
    try {
      if (!daoInstance || panelName === DAO_RESERVED_NAME || !currentProvider?.selectedAddress) return false;
      const memberStorageInstance = await daoInstance.getMemberStorageInstance(panelName);
      return memberStorageInstance.instance.isMember(currentProvider.selectedAddress);
    } catch (error) {
      captureError(error);
      return false;
    }
  }
  async function checkIsUserCanVeto (target: string) {
    try {
      if (!daoInstance || !currentProvider?.selectedAddress) return false;
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
      if (!situationInfo || !tokenInfo) return { isUserHasVotingPower: false, isUserMember: false };
      const isUserMember = await checkIsUserMember(panelName);
      const isUserHasVotingPower = toBigNumber(vaultBalance)
        .isGreaterThanOrEqualTo(fromWeiWithDecimals(situationInfo?.votingMinAmount.toString(), tokenInfo.decimals));
      return { isUserHasVotingPower, isUserMember: situationInfo.votingType.toString() === '0' || isUserMember };
    } catch (error) {
      captureError(error);
      return { isUserHasVotingPower: false, isUserMember: false };
    }
  };

  async function checkIsUserCanVoting (panelName: string, situation: string) {
    try {
      const situationInfo = await getPanelSituationInfo(panelName, situation);
      if (!situationInfo || !tokenInfo) return false;
      const isUserMember = await checkIsUserMember(panelName);
      const isUserHasVotingPower = toBigNumber(vaultBalance)
        .isGreaterThanOrEqualTo((fromWeiWithDecimals(situationInfo?.votingMinAmount.toString(), tokenInfo.decimals)));
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
