import { useCallback, useRef, useState } from 'react';

import {
  Chain,
  ChainId,
  createProvider,
  CreateProviderOpts,
  IProvider,
  ProviderProxyConstructor,
  TransactionResponse,
  TxRequestBody,
} from '@distributedlab/w3p';
import { errors } from 'errors';
import { providers } from 'ethers';
import { ProviderWrapper } from 'typings';

import { FALLBACK_PROVIDER_NAMES } from 'constants/providers';

export const useProvider = (): ProviderWrapper => {
  const _provider = useRef<IProvider | null>(null);

  const currentProvider = !_provider.current?.rawProvider
    ? undefined
    : _provider.current.rawProvider instanceof providers.JsonRpcProvider
      ? _provider.current.rawProvider
      : new providers.Web3Provider(_provider.current.rawProvider as providers.ExternalProvider);
  const currentSigner = _provider.current?.isConnected && currentProvider
    ? currentProvider?.getSigner()
    : undefined;

  const [providerReactiveState, setProviderReactiveState] = useState(() => {
    return {
      address: _provider.current?.address || '',
      isConnected: _provider.current?.isConnected || false,
      chainId: _provider.current?.chainId || '',
      chainType: _provider.current?.chainType,
      providerType: _provider.current?.providerType,
    };
  });

  const connect = async (): Promise<void> => _provider.current?.connect();

  const disconnect = async () => {
    if (_provider.current?.disconnect) {
      await _provider.current.disconnect();
    }

    _provider.current?.clearHandlers();
    _provider.current = null;
    _updateProviderState();
  };

  const addChain = async (chain: Chain): Promise<void> =>
    _provider.current?.addChain?.(chain);

  const switchChain = async (chainId: ChainId): Promise<void> =>
    _provider.current?.switchChain?.(chainId);

  const switchNetwork = async (chainId: ChainId, chain?: Chain) => {
    try {
      await switchChain(chainId);
    } catch (error) {
      if (chain &&
        (error instanceof errors.ProviderInternalError ||
          error instanceof errors.ProviderChainNotFoundError)
      ) {
        await addChain(chain);
      } else {
        throw error;
      }
    }
  };

  const signAndSendTx = async (
    txRequestBody: TxRequestBody,
  ): Promise<TransactionResponse> =>
    _provider.current?.signAndSendTx?.(txRequestBody) ?? '';

  const signMessage = async (message: string): Promise<string> =>
    _provider.current?.signMessage?.(message) ?? '';

  const getHashFromTxResponse = (txResponse: TransactionResponse): string =>
    _provider.current?.getHashFromTx?.(txResponse) ?? '';

  const getTxUrl = (chain: Chain, txHash: string): string =>
    _provider.current?.getTxUrl?.(chain, txHash) ?? '';

  const getAddressUrl = (chain: Chain, address: string): string =>
    _provider.current?.getAddressUrl?.(chain, address) ?? '';

  const init = useCallback(async (
    providerProxyConstructor: ProviderProxyConstructor,
    createProviderOpts: CreateProviderOpts<FALLBACK_PROVIDER_NAMES>,
  ) => {
    _provider.current?.clearHandlers();

    _provider.current = await createProvider(
      providerProxyConstructor,
      {
        providerDetector: createProviderOpts.providerDetector,
        listeners: {
          ...createProviderOpts.listeners,
          onAccountChanged: (e) => {
            createProviderOpts?.listeners?.onAccountChanged?.(e);
            _updateProviderState();
          },
          onChainChanged: (e) => {
            createProviderOpts?.listeners?.onChainChanged?.(e);
            _updateProviderState();
          },
          onConnect: (e) => {
            createProviderOpts?.listeners?.onConnect?.(e);
            _updateProviderState();
          },
          onDisconnect: (e) => {
            createProviderOpts?.listeners?.onDisconnect?.(e);
            _updateProviderState();
          },
        }
      },
    );

    _updateProviderState();
    return {
      isConnected: _provider.current?.isConnected || false
    };
  }, []);

  const _updateProviderState = () => {
    setProviderReactiveState({
      address: _provider.current?.address || '',
      isConnected: _provider.current?.isConnected || false,
      chainId: _provider.current?.chainId || '',
      chainType: _provider.current?.chainType,
      providerType: _provider.current?.providerType,
    });
  };

  return {
    init,
    currentProvider,
    currentSigner,
    ...providerReactiveState,
    connect,
    disconnect,
    addChain,
    switchNetwork,
    signMessage,
    signAndSendTx,
    getTxUrl,
    getHashFromTxResponse,
    getAddressUrl,
  };
};
