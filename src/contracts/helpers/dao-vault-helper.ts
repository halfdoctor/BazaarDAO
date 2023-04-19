import { toBigNumber } from '@q-dev/utils';

import { TokenInfo } from 'store/dao/reducer';

import { captureError } from 'utils/errors';
import { toWeiWithDecimals } from 'utils/numbers';

const DEFAULT_GAS_PRICE = '0.04';

export async function getDAOVaultDepositAmount (amount: string, balance: string, token: TokenInfo, qBalance:string) {
  try {
    if (token.isNative) {
      return getSpendAmountForNativeToken(amount, balance, token.address);
    }
    if (token.isErc721) {
      return getSpendAmountForErc721(amount, balance, token, qBalance);
    }
    return getSpendAmountForErc20(amount, balance, token, qBalance);
  } catch (error) {
    captureError(error);
    return { balance: '0', canDeposit: false }; ;
  }
}

export async function getSpendAmountForErc721 (amount: string, balance: string, token: TokenInfo, qBalance: string) {
  try {
    if (!token.address) { return { balance: '0', canDeposit: false }; }
    if (!token.isErc721Approved || !amount) return { balance, canDeposit: true };
    return {
      balance,
      canDeposit: checkIsCanDeposit(qBalance)
    };
  } catch (error) {
    captureError(error);
    return { balance: '0', canDeposit: false }; ;
  }
}

export async function getSpendAmountForErc20 (amount: string, balance: string, token: TokenInfo, qBalance:string) {
  try {
    if (!token.address) { return { balance: '0', canDeposit: false }; }

    const amountInWei = toWeiWithDecimals(amount, token.decimals);

    if (
      toBigNumber(token.allowance).isLessThanOrEqualTo(0) ||
      toBigNumber(amountInWei).isGreaterThanOrEqualTo(token.allowance) ||
      !amount
    ) return { balance, canDeposit: true };

    return {
      balance,
      canDeposit: checkIsCanDeposit(qBalance)
    };
  } catch (error) {
    captureError(error);
    return { balance: '0', canDeposit: false }; ;
  }
}

export async function getSpendAmountForNativeToken (amount: string, balance: string, address: string) {
  try {
    if (!address) { return { balance: '0', canDeposit: false }; }
    const calcAmount = toBigNumber(balance).minus(DEFAULT_GAS_PRICE);
    if (calcAmount.isLessThanOrEqualTo(0)) return { balance, canDeposit: false };
    return {
      balance: toBigNumber(balance).minus(DEFAULT_GAS_PRICE).toString(),
      canDeposit: checkIsCanDeposit(balance)
    };
  } catch (error) {
    captureError(error);
    return { balance: '0', canDeposit: false };
  }
}

export function checkIsCanDeposit (balance: string) {
  return toBigNumber(balance).isGreaterThan(DEFAULT_GAS_PRICE);
}
