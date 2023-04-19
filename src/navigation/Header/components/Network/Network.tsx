import { useAlert } from 'react-alert';
import { useTranslation } from 'react-i18next';

import { SegmentedButton } from '@q-dev/q-ui-kit';
import { useWeb3Context } from 'context/Web3ContextProvider';

import { connectorParametersMap, networkConfigsMap } from 'constants/config';
import { captureError } from 'utils';

function Network () {
  const { currentProvider } = useWeb3Context();
  const { t } = useTranslation();
  const alert = useAlert();

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
      const chainInfo = connectorParametersMap[chainId];
      await currentProvider.switchNetwork(chainId, chainInfo);
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
