import { toBigNumber } from '@q-dev/utils';
import { fromWei, toWei } from 'web3-utils';

import { getUserAddress } from 'store';
import { TokenInfo } from 'store/dao/reducer';

import { contractRegistryInstance, daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

const DEFAULT_GAS_PRICE = 50;

export async function getDAOHolderRewardPool () {
  const address = await contractRegistryInstance?.instance.methods.getAddress('tokeneconomics.qHolderRewardPool').call();
  const balance = await window.web3.eth.getBalance(address || '');
  return fromWei(balance);
}

export async function getDAOVaultDepositAmount (balance: string, token: TokenInfo) {
  try {
    const userAddress = getUserAddress();
    const balanceInWei = toWei(balance);
    const qBalance = await window.web3.eth.getBalance(userAddress);
    if (toBigNumber(balanceInWei).isLessThanOrEqualTo(0) || !daoInstance) {
      return { balance: '0', canDeposit: false }; ;
    }
    const daoVaultInstance = await daoInstance.getVaultInstance();

    if (toBigNumber(token.allowance).isLessThanOrEqualTo(0)) return { balance, canDeposit: true };
    const gasLimit = await daoVaultInstance.instance.methods
      .deposit(token.address, balanceInWei)
      .estimateGas({ value: balanceInWei, from: userAddress });
    const gas = fromWei(toBigNumber(gasLimit).multipliedBy(DEFAULT_GAS_PRICE).toString(), 'gwei');
    const result = token.isNative
      ? toBigNumber(balanceInWei).minus(toWei(gas)).toString(10)
      : toBigNumber(balanceInWei).toString(10);
    return { balance: fromWei(result), canDeposit: toBigNumber(qBalance).comparedTo(toWei(gas)) === 1 };
  } catch (error) {
    captureError(error);
    return { balance: '0', canDeposit: false }; ;
  }
}
