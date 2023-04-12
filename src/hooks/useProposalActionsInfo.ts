
import { useCallback } from 'react';

import { toBigNumber } from '@q-dev/utils';
import { fromWei } from 'web3-utils';

import { useDaoProposals } from './useDaoProposals';

import { getUserAddress } from 'store';
import { useDaoVault } from 'store/dao-vault/hooks';
import { useExpertPanels } from 'store/expert-panels/hooks';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

function useProposalActionsInfo () {
  const { vaultBalance } = useDaoVault();
  const { getPanelSituationInfo } = useDaoProposals();
  const { checkIsUserMember } = useExpertPanels();

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
  const checkIsUserCanCreateProposal = async (panelName: string, situation: string) => {
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

  const checkIsUserCanVoting = async (panelName: string, situation: string) => {
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
  };
}

export default useProposalActionsInfo;
