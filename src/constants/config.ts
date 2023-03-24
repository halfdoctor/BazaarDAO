import Web3 from 'web3';

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

interface ConnectorParams {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
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
    masterDaoRegistryAddress: '0x5BBb75925A85b95324d7cbe8A7Fd2B66Cb3aE931',
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
    masterDaoRegistryAddress: '0x5BBb75925A85b95324d7cbe8A7Fd2B66Cb3aE931',
  },
  devnet: {
    chainId: 35442,
    name: 'Q Devnet',
    networkName: 'devnet',
    dAppUrl: 'http://63.34.190.209:8000',
    rpcUrl: 'http://63.34.190.209:8545',
    indexerUrl: 'http://54.73.188.73:4000',
    explorerUrl: 'http://54.73.188.73:8080',
    gnosisSafeUrl: 'http://63.34.190.209:8020',
    qBridgeUrl: 'http://63.34.190.209:8080',
    docsUrl: 'https://docs.qtestnet.org',
    constitutionUrl: 'http://34.248.83.162:8999',
    gasBuffer: 1.5,
    masterDaoRegistryAddress: '0x5BBb75925A85b95324d7cbe8A7Fd2B66Cb3aE931',
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
      chainId: Web3.utils.toHex(config.chainId).replace('0x', ''),
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
  }, {} as { [key: string]: ConnectorParams });

const originToNetworkMap: { [key: string]: NetworkName } = {
  'https://hq.q.org': 'mainnet',
  'https://hq.qtestnet.org': 'testnet',
  // TODO: Replace with devnet when it's migrated to the HTTPS protocol
  'http://63.34.190.209:8000': 'testnet',
  'http://localhost:3000': 'testnet',
};

export const ORIGIN_NETWORK_NAME: NetworkName = originToNetworkMap[window.location.origin] || 'testnet';
