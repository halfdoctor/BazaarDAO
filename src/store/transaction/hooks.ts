import { useCallback } from 'react';
import { useAlert } from 'react-alert';
import { useDispatch } from 'react-redux';

import { SubmitTransactionResponse } from '@q-dev/q-js-sdk';
import { t } from 'i18next';
import uniqueId from 'lodash/uniqueId';

import { setTransactions, Transaction, TransactionEditableParams } from './reducer';

import { getState, useAppSelector } from 'store';
import { useQVault } from 'store/q-vault/hooks';

import { captureError } from 'utils/errors';

export function useTransaction () {
  const dispatch = useDispatch();
  const alert = useAlert();
  const { loadAllBalances } = useQVault();

  const pendingTransactions = useAppSelector(({ transaction }) => {
    return transaction.transactions.filter((item: Transaction) =>
      item.status === 'sending' || item.status === 'waitingConfirmation');
  });

  const transactions = useAppSelector(({ transaction }) => transaction.transactions);

  async function submitTransaction ({
    submitFn,
    successMessage,
    isClosedModal = false,
    onSuccess = () => {},
    onConfirm = () => {},
    onError = () => {},
  }: {
    submitFn: () => Promise<SubmitTransactionResponse | void | undefined>;
    successMessage?: string;
    isClosedModal?: boolean;
    onSuccess?: () => void;
    onConfirm?: () => void;
    onError?: (error?: unknown) => void;
  }) {
    const transaction: Transaction = {
      id: uniqueId(),
      isClosedModal,
      message: successMessage || t('DEFAULT_MESSAGE_TX'),
      status: 'waitingConfirmation',
    };

    const { transactions } = getState().transaction;
    dispatch(setTransactions([{ ...transaction }, ...transactions]));

    try {
      const submitResponse = await submitFn();

      if (submitResponse?.promiEvent) {
        submitResponse.promiEvent
          .once('transactionHash', (txHash: string) => {
            updateTransaction(transaction.id, { hash: txHash, status: 'sending' });
            onConfirm();
          });

        await submitResponse.promiEvent;
      }
      onSuccess();
      updateTransaction(transaction.id, { status: 'success' });
      await alertTxStatus(transaction.id, 'success', transaction.message);
    } catch (error) {
      captureError(error);
      onError(error);
      updateTransaction(transaction.id, { status: 'error' });
      await alertTxStatus(transaction.id, 'error', getErrorMessage(error));
    }
  }

  const getTxById = (id: string) => {
    const { transactions } = getState().transaction;
    return transactions.find((tx: Transaction) => tx.id === id);
  };

  const updateTransaction = (id: string, params: TransactionEditableParams) => {
    const { transactions } = getState().transaction;
    const txIndex = transactions.findIndex((tx: Transaction) => tx.id === id);
    if (txIndex === -1) return;
    const newTxs = [...transactions];
    newTxs[txIndex] = { ...newTxs[txIndex], ...params };
    dispatch(setTransactions(newTxs));
  };

  const alertTxStatus = async (id: string, type: 'success' | 'error', message: string) => {
    const currentTx = getTxById(id);
    if (currentTx?.isClosedModal) {
      alert[type](message);
    }
    await loadAllBalances();
  };

  return {
    pendingTransactions,
    transactions,
    submitTransaction: useCallback(submitTransaction, []),
    updateTransaction: useCallback(updateTransaction, []),
  };
}

function getErrorMessage (err: unknown): string {
  const error = err as {
    message: string;
    code?: number;
    stack?: string;
  };

  if (error.code === 4001) {
    return t('ERROR_TRANSACTION_REJECTED');
  }

  if (!error.message?.includes('Internal JSON-RPC error')) {
    if (error.message?.includes('Transaction has been reverted by the EVM')) {
      return t('ERROR_TRANSACTION_REVERTED_BY_EVM');
    }

    return error.message || t('ERROR_UNKNOWN');
  }

  if (error.message === 'execution reverted') {
    return t('ERROR_TRANSACTION_REVERTED');
  }

  const rpcErrorCode = error.message.match(/\[.+-(.+)\]/)?.at(1);
  return rpcErrorCode
    ? t(`ERROR_${rpcErrorCode}`)
    : t('ERROR_RPC_UNKNOWN');
}
