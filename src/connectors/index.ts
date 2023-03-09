import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import { WalletConnect } from '@web3-react/walletconnect';

import { networkConfigsMap, ORIGIN_NETWORK_NAME } from 'constants/config';

export enum WalletType {
  INJECTED = 'injected', // metamask and all browser wallets
  COINBASE = 'coinbase',
  WALLET_CONNECT = 'wallet_connect',
}

const networkConfig = networkConfigsMap[ORIGIN_NETWORK_NAME];

export const [coinbaseWallet, coinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: networkConfig.rpcUrl,
        appName: 'Your HQ',
      },
    })
);

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }));

export const [network, networkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: networkConfig.rpcUrl })
);

export const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: { rpc: networkConfig.rpcUrl },
    })
);

export const getWallet = (walletType: WalletType) => {
  switch (walletType) {
    case WalletType.INJECTED:
      return metaMask;
    case WalletType.COINBASE:
      return coinbaseWallet;
    case WalletType.WALLET_CONNECT:
      return walletConnect;
    default: {
      throw new Error('unsupported wallet');
    }
  }
};
