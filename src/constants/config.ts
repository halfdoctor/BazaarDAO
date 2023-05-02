import { utils } from 'ethers';
import { Chain } from 'typings';

export type NetworkName = 'mainnet' | 'testnet' | 'devnet';

interface NetworkConfig {
  chainId: number;
  name: string;
  networkName: NetworkName;
  dAppUrl: string;
  rpcUrl: string;
  indexerUrl: string;
  explorerUrl: string;
  gnosisSafeUrl: string;
  qBridgeUrl: string;
  docsUrl: string;
  constitutionUrl: string;
  gasBuffer: number;
  masterDaoRegistryAddress: string;
}

export const networkConfigsMap: Record<NetworkName, NetworkConfig> = {
  mainnet: {
    chainId: 35441,
    name: 'Q Mainnet',
    networkName: 'mainnet',
    dAppUrl: 'https://hq.q.org',
    rpcUrl: 'https://rpc.q.org',
    indexerUrl: 'https://indexer.q.org',
    explorerUrl: 'https://explorer.q.org',
    gnosisSafeUrl: 'https://multisig-ui.q.org',
    qBridgeUrl: 'https://bridge.q.org',
    docsUrl: 'https://docs.q.org',
    constitutionUrl: 'https://constitution.q.org',
    gasBuffer: 1.5,
    masterDaoRegistryAddress: '0x81FccB3dAfc6685c783F4A871700f4a0889c4008',
  },
  testnet: {
    chainId: 35443,
    name: 'Q Testnet',
    networkName: 'testnet',
    dAppUrl: 'https://hq.qtestnet.org',
    rpcUrl: 'https://rpc.qtestnet.org',
    indexerUrl: 'https://indexer.qtestnet.org',
    explorerUrl: 'https://explorer.qtestnet.org',
    gnosisSafeUrl: 'https://multisig-ui.qtestnet.org',
    qBridgeUrl: 'https://bridge.qtestnet.org',
    docsUrl: 'https://docs.qtestnet.org',
    constitutionUrl: 'https://constitution.qtestnet.org',
    gasBuffer: 2,
    masterDaoRegistryAddress: '0x58AED0176A0A534630C9df0d1E919EFcD660fbcf',
  },
  devnet: {
    chainId: 35442,
    name: 'Q Devnet',
    networkName: 'devnet',
    dAppUrl: 'https://hq.qdevnet.org',
    rpcUrl: 'https://rpc.qdevnet.org',
    indexerUrl: 'https://indexer.qdevnet.org',
    explorerUrl: 'https://explorer.qdevnet.org',
    gnosisSafeUrl: 'https://multisig.qdevnet.org',
    qBridgeUrl: 'https://bridge.qdevnet.org',
    docsUrl: 'https://docs.qtestnet.org',
    constitutionUrl: 'https://constitution.qdevnet.org',
    gasBuffer: 1.5,
    masterDaoRegistryAddress: '0x9CFeE6E148B1a9D67d562a0b77fF39C0C11EDE84',
  },
};

export const chainIdToNetworkMap: { [key: string]: NetworkName } = {
  35441: 'mainnet',
  35442: 'devnet',
  35443: 'testnet',
};

export const connectorParametersMap = Object.values(networkConfigsMap)
  .reduce((acc, config) => {
    acc[config.chainId] = {
      chainId: utils.hexlify(config.chainId),
      chainName: config.name,
      rpcUrls: [config.rpcUrl],
      blockExplorerUrls: [config.explorerUrl],
      nativeCurrency: {
        name: 'Q',
        // HACK: MetaMask requires the symbol to have at least 2 characters
        symbol: 'Q ',
        decimals: 18,
      },
    };
    return acc;
  }, {} as { [key: string]: Chain });

const originToNetworkMap: { [key: string]: NetworkName } = {
  'https://hq.q.org': 'mainnet',
  'https://hq.qtestnet.org': 'testnet',
  'https://hq.qdevnet.org': 'devnet',
  'http://localhost:3000': 'devnet',
  'http://localhost:3001': 'devnet',
};

export const ORIGIN_NETWORK_NAME: NetworkName = originToNetworkMap[window.location.origin] || 'testnet';
