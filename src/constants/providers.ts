import { networkConfigsMap } from 'constants/config';

export enum PROVIDERS {
  default = 'default',
  fallback = 'fallback',
  metamask = 'metamask',
  coinbase = 'coinbase',
  trust = 'trust',
  walletConnect = 'wallet-connect',
  brave = 'brave',
  ledger = 'ledger',
  phantom = 'phantom',
  solflare = 'solflare',
}

export enum FALLBACK_PROVIDER_NAMES {
  mainnetFallback = 'mainnetfallback',
  testnetFallback = 'testnetfallback',
  devnetFallback = 'devnetfallback'
}

export const FALLBACK_PROVIDERS = Object.freeze({
  mainnetFallback: {
    name: FALLBACK_PROVIDER_NAMES.mainnetFallback,
    rpcUrl: networkConfigsMap.mainnet.rpcUrl,
  },
  testnetFallback: {
    name: FALLBACK_PROVIDER_NAMES.testnetFallback,
    rpcUrl: networkConfigsMap.testnet.rpcUrl,
  },
  devnetFallback: {
    name: FALLBACK_PROVIDER_NAMES.devnetFallback,
    rpcUrl: networkConfigsMap.devnet.rpcUrl,
  },
});
