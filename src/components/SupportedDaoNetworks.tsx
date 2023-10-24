import { useTranslation, } from 'react-i18next';

import { useWeb3Context } from 'context/Web3ContextProvider';
import { ErrorHandler } from 'helpers';
import styled from 'styled-components';
import { SupportedDaoNetwork } from 'typings/dao';

import NotFound from 'pages/NotFound/NotFound';

import Button from './Button';

import { chainIdToNetworkMap } from 'constants/config';

export const StyledWrapper = styled.div`
  position: fixed;
  z-index: 10000;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: max-content;
  max-width: 375px;
  padding: 32px;
  pointer-events: all;

  .network-warning__message {
    margin-top: 20px;
  }

  .network-warning__button {
    margin-top: 24px;
    width: 100%;
  }

  .network-warning__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

interface Props {
  networkOptions: SupportedDaoNetwork[];
}

function SupportedDaoNetworks ({ networkOptions }: Props) {
  const { switchNetwork } = useWeb3Context();
  const { t } = useTranslation();

  const handleChangeNetwork = async (chainId: number) => {
    try {
      await switchNetwork(chainId);
    } catch (error) {
      ErrorHandler.process(error, t('SWITCH_NETWORK_ERROR'));
    }
  };

  if (!networkOptions.length) {
    return <NotFound text={t('DAO_NOT_SUPPORTED')} />;
  }

  return (
    <StyledWrapper className="block">
      <p className="text-xl font-semibold">
        {t('SUPPORTED_DAO_NETWORKS_HEADER')}
      </p>
      <p className="network-warning__message text-md color-secondary">
        {t('SUPPORTED_DAO_NETWORKS_MESSAGE')}
      </p>
      <div className="network-warning__actions">
        {
          networkOptions.map((item) =>
            <Button
              key={item.chainId}
              alwaysEnabled
              className="network-warning__button"
              onClick={() => handleChangeNetwork(item.chainId)}
            >
              {t('SWITCH_TO_Q_NETWORK', {
                network: t(chainIdToNetworkMap[item.chainId].toUpperCase())
              })}
            </Button>
          )
        }
      </div>
    </StyledWrapper>
  );
}

export default SupportedDaoNetworks;
