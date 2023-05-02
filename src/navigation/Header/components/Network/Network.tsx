import { useAlert } from 'react-alert';
import { useTranslation } from 'react-i18next';

import { SegmentedButton } from '@q-dev/q-ui-kit';
import { useWeb3Context } from 'context/Web3ContextProvider';

import { useProviderStore } from 'store/provider/hooks';

import { connectorParametersMap, networkConfigsMap } from 'constants/config';
import { PROVIDERS } from 'constants/providers';
import { captureError } from 'utils';

function Network () {
  const { currentProvider } = useProviderStore();
  const { t } = useTranslation();
  const alert = useAlert();
  const { initDefaultProvider } = useWeb3Context();

  const isDevnet = ![
    networkConfigsMap.mainnet.dAppUrl,
    networkConfigsMap.testnet.dAppUrl,
  ].includes(window.location.origin);

  const networkOptions = [
    { value: 35441, label: t('MAINNET') },
    { value: 35443, label: t('TESTNET') },
    ...(isDevnet ? [{ value: 35442, label: t('DEVNET') }] : []),
  ];

  const handleChangeNetwork = async (chainId: number) => {
    if (!currentProvider) return;
    try {
      if (currentProvider.selectedProvider !== PROVIDERS.default) {
        const chainInfo = connectorParametersMap[chainId];
        await currentProvider.switchNetwork(chainId, chainInfo);
        return;
      }
      await initDefaultProvider(chainId);
    } catch (error) {
      captureError(error);
      alert.error(t('SWITCH_NETWORK_ERROR'));
    }
  };

  return <SegmentedButton
    value={Number(currentProvider?.chainId)}
    options={networkOptions}
    onChange={handleChangeNetwork}
  />;
}

export default Network;
