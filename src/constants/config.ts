import { Chain, CHAIN_TYPES } from '@distributedlab/w3p';
import { utils } from 'ethers';

export type NetworkName = 'mainnet' | 'testnet' | 'devnet';

interface NetworkConfig {
  chainId: number;
  name: string;
  networkName: NetworkName;
  dAppUrl: string;
  daoAppUrl: string;
  rpcUrl: string;
  indexerUrl: string;
  explorerUrl: string;
  gnosisSafeUrl: string;
  qBridgeUrl: string;
  docsUrl: string;
  constitutionUrl: string;
  gasBuffer: number;
  masterDaoRegistryAddress: string;
  faucetUrl: string;
}

export const networkConfigsMap: Record<NetworkName, NetworkConfig> = {
  mainnet: {
    chainId: 35441,
    name: 'Q Mainnet',
    networkName: 'mainnet',
    dAppUrl: 'https://hq.q.org',
    daoAppUrl: 'https://hq.q-dao.tools',
    rpcUrl: 'https://rpc.q.org',
    indexerUrl: 'https://indexer.q.org',
    explorerUrl: 'https://explorer.q.org',
    gnosisSafeUrl: 'https://multisig-ui.q.org',
    qBridgeUrl: 'https://bridge.q.org',
    docsUrl: 'https://docs.q.org',
    constitutionUrl: 'https://constitution.q.org',
    gasBuffer: 1.5,
    masterDaoRegistryAddress: '0xD2acB019Ef0479628Ca86Bf322eE5E5fCF58620b',
    faucetUrl: 'https://faucet.q.org',
  },
  testnet: {
    chainId: 35443,
    name: 'Q Testnet',
    networkName: 'testnet',
    dAppUrl: 'https://hq.qtestnet.org',
    daoAppUrl: 'https://hq.q-dao.tools',
    rpcUrl: 'https://rpc.qtestnet.org',
    indexerUrl: 'https://indexer.qtestnet.org',
    explorerUrl: 'https://explorer.qtestnet.org',
    gnosisSafeUrl: 'https://multisig-ui.qtestnet.org',
    qBridgeUrl: 'https://bridge.qtestnet.org',
    docsUrl: 'https://docs.qtestnet.org',
    constitutionUrl: 'https://constitution.qtestnet.org',
    gasBuffer: 2,
    masterDaoRegistryAddress: '0x62A8eF5393b3Ca8B3189C20321992F146701b420',
    faucetUrl: 'https://faucet.qtestnet.org',
  },
  devnet: {
    chainId: 35442,
    name: 'Q Devnet',
    networkName: 'devnet',
    dAppUrl: 'https://hq.qdevnet.org',
    daoAppUrl: 'https://dao-hq.qdevnet.org',
    rpcUrl: 'https://rpc.qdevnet.org',
    indexerUrl: 'https://indexer.qdevnet.org',
    explorerUrl: 'https://explorer.qdevnet.org',
    gnosisSafeUrl: 'https://multisig.qdevnet.org',
    qBridgeUrl: 'https://bridge.qdevnet.org',
    docsUrl: 'https://docs.qtestnet.org',
    constitutionUrl: 'https://constitution.qdevnet.org',
    gasBuffer: 1.5,
    masterDaoRegistryAddress: '0xCC7218eeAD86542f1F82ff6287BfD39CdbCFD6D0',
    faucetUrl: 'https://faucet.qdevnet.org',
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
      id: utils.hexlify(config.chainId),
      name: config.name,
      rpcUrl: config.rpcUrl,
      explorerUrl: config.explorerUrl,
      token: {
        name: 'Q',
        // HACK: MetaMask requires the symbol to have at least 2 characters
        symbol: 'Q ',
        decimals: 18,
      },
      type: CHAIN_TYPES.EVM,
      icon: ''
    };
    return acc;
  }, {} as { [key: string]: Chain });

const originToNetworkMap: { [key: string]: NetworkName } = {
  'https://hq.q-dao.tools': 'mainnet',
  'https://dao-hq.qdevnet.org': 'testnet',
  'http://localhost:3000': 'devnet',
};

export const ORIGIN_NETWORK_NAME: NetworkName = originToNetworkMap[window.location.origin] || 'testnet';
