import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConnectionInfo, Web3Adapter } from '@q-dev/gdk-sdk';
import { Modal } from '@q-dev/q-ui-kit';
import { useInterval } from '@q-dev/react-hooks';

import CopyToClipboard from 'components/CopyToClipboard';

import useNetworkConfig from 'hooks/useNetworkConfig';

import packageJson from '../../../../../package.json';

import { VersionsContainer } from './styles';

import { formatDateGMT } from 'utils/date';

interface Props {
  open: boolean;
  onClose: () => void;
}

function VersionModal ({ open, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { rpcUrl } = useNetworkConfig();
  const web3Adapter = new Web3Adapter(window.web3);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);

  useInterval(() => {
    setCurrentDate(new Date());
  }, 50000);

  async function loadConnectionInfo () {
    const info = await web3Adapter?.getConnectionInfo();
    setConnectionInfo(info);
  }

  useEffect(() => {
    if (web3Adapter) {
      loadConnectionInfo();
    }

    return () => {
      setConnectionInfo(null);
    };
  }, []);

  const versionGroups = [
    {
      title: t('MAIN'),
      items: [
        {
          name: 'dApp',
          value: packageJson.version,
        },
        {
          name: t('YOUR_CURRENT_TIME'),
          value: formatDateGMT(currentDate, i18n.language),
        },
      ],
    },
    {
      title: t('MODULES'),
      items: [
        {
          name: 'Web3.js',
          value: web3Adapter?.web3.version,
        },
        {
          name: 'Q.js SDK',
          value: web3Adapter?.SDK_VERSION,
        },
      ],
    },
    {
      title: t('Q_CLIENT'),
      items: [
        {
          name: 'RPC URL',
          value: rpcUrl,
        },
        {
          name: t('NETWORK') + ' ID',
          value: connectionInfo?.networkId,
        },
        {
          name: t('NODE_INFO'),
          value: connectionInfo?.nodeInfo,
        },
      ],
    },
  ];

  return (
    <Modal
      open={open}
      title={t('VERSION_INFORMATION')}
      width={600}
      onClose={onClose}
    >
      <VersionsContainer>
        {versionGroups.map((group, i) => (
          <div key={String(i)} className="version-group">
            <h3 className="text-h3">{group.title}</h3>
            <div className="version-group-items">
              {group.items.map((item) => (
                <div key={item.name}>
                  <p className="text-md font-light">{item.name}</p>
                  <div className="text-md">
                    <span>{item.value}</span>
                    <CopyToClipboard value={item.name + '-' + item.value} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </VersionsContainer>
    </Modal>
  );
}

export default VersionModal;
