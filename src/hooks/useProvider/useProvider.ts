import { useCallback, useEffect, useMemo, useState } from 'react';

import { LogLevel } from '@ethersproject/logger';
import { errors } from 'errors';
import { ethers } from 'ethers';
import { isEqual } from 'lodash';
import {
  Chain,
  ChainId,
  DesignatedProvider,
  ProviderWrapper,
  TransactionResponse,
  TxRequestBody,
} from 'typings';

import { defaultProviderWrapper, metamaskWrapper } from 'hooks/useProvider';

import { PROVIDERS } from 'constants/providers';

export interface UseProvider {
  currentProvider?: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider;
  currentSigner?: ethers.providers.JsonRpcSigner;

  init: (provider: DesignatedProvider) => void;
  disconnect: () => void;
  chainId: ChainId;
  selectedAddress: string;
  switchChain: (chainId: ChainId) => Promise<void>;
  switchNetwork: (chainId: ChainId, chain?: Chain) => Promise<void>;
  addChain: (chain: Chain) => Promise<void>;
  signAndSendTx: (txRequestBody: TxRequestBody) => Promise<TransactionResponse>;
  isConnected: boolean;
  selectedProvider: PROVIDERS | undefined;
  connect: () => Promise<void>;
  getHashFromTxResponse: (txResponse: TransactionResponse) => string;
  getTxUrl: (explorerUrl: string, txHash: string) => string;
  getAddressUrl: (explorerUrl: string, address: string) => string;
}

export const useProvider = (): UseProvider => {
  const [providerWrp, setProviderWrp] = useState<ProviderWrapper | undefined>();

  const currentProvider = useMemo(
    () => providerWrp?.currentProvider,
    [providerWrp],
  );

  const currentSigner = useMemo(
    () => providerWrp?.currentSigner,
    [providerWrp],
  );

  const [selectedProvider, setSelectedProvider] = useState<PROVIDERS | undefined>();

  const [chainId, setChainId] = useState<ChainId>('');
  const [selectedAddress, setSelectedAddress] = useState('');

  const isConnected = useMemo(
    () => Boolean(chainId && selectedAddress),
    [chainId, selectedAddress],
  );

  const init = useCallback(
    (provider: DesignatedProvider) => {
      switch (provider.name as PROVIDERS) {
        case PROVIDERS.metamask:
          setProviderWrp(state => {
            const newState = metamaskWrapper(provider.instance, {
              selectedAddressState: [selectedAddress, setSelectedAddress],
              chainIdState: [chainId, setChainId],
            });

            return isEqual(state, newState) ? state : newState;
          });
          setSelectedProvider(provider.name);
          break;
        case PROVIDERS.default:
          setProviderWrp(state => {
            const newState = defaultProviderWrapper(provider.instance as string, {
              selectedAddressState: [selectedAddress, setSelectedAddress],
              chainIdState: [chainId, setChainId],
            });
            return isEqual(state, newState) ? state : newState;
          });
          setSelectedProvider(provider.name);
          break;
        default:
          throw new Error('Invalid Provider');
      }
    },
    [chainId, selectedAddress],
  );

  useEffect(() => {
    providerWrp?.init();
  }, [providerWrp]);

  const connect = useCallback(async () => {
    if (!providerWrp || !providerWrp?.connect) throw new errors.ProviderWrapperMethodNotFoundError();
    await providerWrp.connect();
  }, [providerWrp]);

  const switchChain = useCallback(
    async (chainId: ChainId) => {
      if (!providerWrp || !providerWrp?.switchChain) throw new errors.ProviderWrapperMethodNotFoundError();

      await providerWrp.switchChain(chainId);
    },
    [providerWrp],
  );

  const addChain = useCallback(
    async (chain: Chain) => {
      if (!providerWrp || !providerWrp?.addChain) { throw new errors.ProviderWrapperMethodNotFoundError(); };

      await providerWrp.addChain(chain);
    },
    [providerWrp],
  );

  const switchNetwork = useCallback(
    async (chainId: ChainId, chain?: Chain) => {
      if (!providerWrp || !providerWrp?.switchNetwork) { throw new errors.ProviderWrapperMethodNotFoundError(); };

      await providerWrp.switchNetwork(chainId, chain);
    },
    [providerWrp],
  );

  const disconnect = useCallback(() => {
    setProviderWrp(undefined);
    setSelectedProvider(undefined);
    setChainId('');
    setSelectedAddress('');
  }, []);

  const signAndSendTx = useCallback(
    (txRequestBody: TxRequestBody) => {
      if (!providerWrp || !providerWrp?.signAndSendTransaction) throw new errors.ProviderWrapperMethodNotFoundError();

      return providerWrp.signAndSendTransaction(txRequestBody);
    },
    [providerWrp],
  );

  const getHashFromTxResponse = (txResponse: TransactionResponse) => {
    if (!providerWrp) throw new errors.ProviderWrapperMethodNotFoundError();

    return providerWrp.getHashFromTxResponse(txResponse);
  };

  const getTxUrl = (explorerUrl: string, txHash: string) => {
    if (!providerWrp) throw new errors.ProviderWrapperMethodNotFoundError();

    return providerWrp.getTxUrl(explorerUrl, txHash);
  };

  const getAddressUrl = (explorerUrl: string, address: string) => {
    if (!providerWrp) throw new errors.ProviderWrapperMethodNotFoundError();

    return providerWrp.getAddressUrl(explorerUrl, address);
  };

  ethers.utils.Logger.setLogLevel(LogLevel.OFF); // Fix for duplicate definition for Compound ABI

  return {
    currentProvider,
    currentSigner,

    selectedProvider,
    chainId,
    selectedAddress,
    isConnected,

    init,
    connect,
    switchChain,
    switchNetwork,
    addChain,
    disconnect,
    signAndSendTx,
    getHashFromTxResponse,
    getTxUrl,
    getAddressUrl,
  };
};
