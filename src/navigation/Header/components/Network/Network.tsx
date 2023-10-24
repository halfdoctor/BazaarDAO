import { useTranslation } from 'react-i18next';

import { SegmentedButton } from '@q-dev/q-ui-kit';
import { useWeb3Context } from 'context/Web3ContextProvider';
import { ErrorHandler } from 'helpers';

import { networkConfigsMap } from 'constants/config';

function Network () {
  const { switchNetwork, chainId } = useWeb3Context();
  const { t } = useTranslation();

  const isDevnet = ![
    networkConfigsMap.mainnet.daoAppUrl,
    networkConfigsMap.testnet.daoAppUrl,
  ].includes(window.location.origin);

  const networkOptions = [
    { value: 35441, label: t('MAINNET') },
    { value: 35443, label: t('TESTNET') },
    ...(isDevnet ? [{ value: 35442, label: t('DEVNET') }] : []),
  ];

  const handleChangeNetwork = async (chainId: number) => {
    try {
      await switchNetwork(chainId);
    } catch (error) {
      ErrorHandler.process(error, t('SWITCH_NETWORK_ERROR'));
    }
  };

  return <SegmentedButton
    value={Number(chainId)}
    options={networkOptions}
    onChange={handleChangeNetwork}
  />;
}

export default Network;
