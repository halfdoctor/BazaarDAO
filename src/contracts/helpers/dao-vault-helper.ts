import { toBigNumber } from '@q-dev/utils';
import { fromWei, toWei } from 'web3-utils';

import { getUserAddress } from 'store';
import { TokenInfo } from 'store/dao/reducer';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';
import { toWeiWithDecimals } from 'utils/numbers';

const DEFAULT_GAS_PRICE = 50;

export async function getDAOVaultDepositAmount (amount: string, balance: string, token: TokenInfo) {
  try {
    if (!daoInstance) {
      return { balance: '0', canDeposit: false }; ;
    }
    const userAddress = getUserAddress();
    const balanceInWei = toWeiWithDecimals(balance, token.decimals);
    const amountInWei = toWeiWithDecimals(amount, token.decimals);
    const qBalance = await window.web3.eth.getBalance(userAddress);
    const daoVaultInstance = await daoInstance.getVaultInstance();

    if (
      toBigNumber(token.allowance).isLessThanOrEqualTo(0) ||
      toBigNumber(amountInWei).isGreaterThanOrEqualTo(token.allowance) ||
      !amount
    ) return { balance, canDeposit: true };

    const gasLimit = await daoVaultInstance.instance.methods
      .deposit(token.address, amountInWei)
      .estimateGas({ ...(token.isNative ? { value: amountInWei } : {}), from: userAddress });

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
