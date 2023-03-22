import { StakeDelegationInfo } from '@q-dev/q-js-sdk';
import { toBigNumber } from '@q-dev/utils';
import { fromWei, toWei } from 'web3-utils';

import { getUserAddress } from 'store';
import { TokenInfo } from 'store/dao/reducer';

import { contractRegistryInstance, daoInstance } from 'contracts/contract-instance';

export async function getQHolderRewardPool () {
  const address = await contractRegistryInstance?.instance.methods.getAddress('tokeneconomics.qHolderRewardPool').call();
  const balance = await window.web3.eth.getBalance(address || '');
  return fromWei(balance);
}

export function countTotalStakeReward (delegationsList: StakeDelegationInfo[]) {
  return delegationsList
    .map((member) => Number(fromWei(member.claimableReward)))
    .reduce((acc, curr) => acc + curr, 0);
}

export async function getQVaultDepositAmount (balance: string, token: TokenInfo) {
  const userAddress = getUserAddress();
  const balanceInWei = toWei(balance);

  const qAmount = await window.web3.eth.getBalance(userAddress);

  if (Number(balanceInWei) <= 0 || !daoInstance) {
    return { balance: '0', canDeposit: false }; ;
  }

  const daoVaultInstance = await daoInstance.getVaultInstance();

  if (Number(token.allowance) <= 0) return { balance, canDeposit: true };

  const fee = await daoVaultInstance.instance.methods
    .deposit(token.address, balanceInWei)
    .estimateGas({ value: balanceInWei, from: userAddress });

  const gas = fromWei(String(fee * 50), 'gwei'); // In Q

  const result = token.isNative
    ? toBigNumber(balanceInWei).minus(toWei(gas)).toString(10)
    : toBigNumber(balanceInWei).toString(10);

  return { balance: fromWei(result), canDeposit: toBigNumber(qAmount).comparedTo(toWei(gas)) === 1 };
}
