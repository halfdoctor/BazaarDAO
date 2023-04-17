import { toBigNumber } from '@q-dev/utils';
import { fromWei } from 'web3-utils';

import { getUserAddress } from 'store';
import { TokenInfo } from 'store/dao/reducer';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';
import { toWeiWithDecimals } from 'utils/numbers';

const DEFAULT_GAS_PRICE = 50;

export async function getDAOVaultDepositAmount (amount: string, balance: string, token: TokenInfo) {
  try {
    if (token.isNative) {
      return getSpendAmountForNativeToken(amount, balance, token.address);
    }

    if (token.isErc721) {
      return getSpendAmountForErc721(amount, balance, token);
    }

    return getSpendAmountForErc20(amount, balance, token);
  } catch (error) {
    captureError(error);
    return { balance: '0', canDeposit: false }; ;
  }
}

export async function getSpendAmountForErc721 (amount: string, balance: string, token: TokenInfo) {
  try {
    if (!daoInstance) {
      return { balance: '0', canDeposit: false };
    }
    const daoVaultInstance = await daoInstance.getVaultInstance();
    const qBalance = await window.web3.eth.getBalance(getUserAddress());
    if (!token.isErc721Approved || !amount) return { balance, canDeposit: true };
    const gasLimit = await daoVaultInstance.instance.methods
      .depositNFT(token.address, amount)
      .estimateGas({ from: getUserAddress() });

    return {
      balance,
      canDeposit: checkIsCanDeposit(qBalance, gasLimit)
    };
  } catch (error) {
    captureError(error);
    return { balance: '0', canDeposit: false }; ;
  }
}

export async function getSpendAmountForErc20 (amount: string, balance: string, token: TokenInfo) {
  try {
    if (!daoInstance) {
      return { balance: '0', canDeposit: false };
    }
    const daoVaultInstance = await daoInstance.getVaultInstance();
    const amountInWei = toWeiWithDecimals(amount, token.decimals);
    const qBalance = await window.web3.eth.getBalance(getUserAddress());

    if (
      toBigNumber(token.allowance).isLessThanOrEqualTo(0) ||
      toBigNumber(amountInWei).isGreaterThanOrEqualTo(token.allowance) ||
      !amount
    ) return { balance, canDeposit: true };

    const gasLimit = await daoVaultInstance.instance.methods
      .deposit(token.address, amountInWei)
      .estimateGas({ from: getUserAddress() });

    return {
      balance,
      canDeposit: checkIsCanDeposit(qBalance, gasLimit)
    };
  } catch (error) {
    captureError(error);
    return { balance: '0', canDeposit: false }; ;
  }
}

export async function getSpendAmountForNativeToken (amount: string, balance: string, address: string) {
  try {
    if (!daoInstance) { return { balance: '0', canDeposit: false }; }

    const daoVaultInstance = await daoInstance.getVaultInstance();
    const amountInWei = fromWei(amount);

    const gasLimit = await daoVaultInstance.instance.methods
      .deposit(address, amountInWei)
      .estimateGas({ value: amountInWei, from: getUserAddress() });

    const gas = toBigNumber(gasLimit).multipliedBy(DEFAULT_GAS_PRICE);

    return {
      balance: fromWei(toBigNumber(balance).minus(gas).toString()),
      canDeposit: checkIsCanDeposit(balance, gasLimit)
    };
  } catch (error) {
    captureError(error);
    return { balance: '0', canDeposit: false };
  }
}

export function checkIsCanDeposit (balance: string, gasLimit: number) {
  return toBigNumber(balance).isGreaterThan(toBigNumber(gasLimit).multipliedBy(DEFAULT_GAS_PRICE));
}
