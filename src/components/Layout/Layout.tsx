import { ReactNode, useState } from 'react';
import { positions, Provider as AlertProvider, transitions } from 'react-alert';
import { useTranslation } from 'react-i18next';

import NetworkWarning from 'components/NetworkWarning';
import SupportedDaoNetworks from 'components/SupportedDaoNetworks';
import Toast from 'components/Toast';
import TransactionLoader from 'components/TransactionLoader';
import Header from 'navigation/Header';
import Sidebar from 'navigation/Sidebar';
import NotFound from 'pages/NotFound';

import { AppContainer } from './styles';

import { useDaoStore } from 'store/dao/hooks';
import { useProviderStore } from 'store/provider/hooks';

interface Props {
  children: ReactNode;
}

function Layout ({ children }: Props) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentProvider, isRightNetwork } = useProviderStore();
  const {
    supportedNetworks,
    isDaoOnSupportedNetwork,
    isShowDao,
    isSelectPage,
    daoAddress
  } = useDaoStore();

  const infoPages = ['imprint', 'privacy'];

  return (
    <AlertProvider
      template={({ message, options, close }) => <Toast
        type={options.type}
        text={String(message)}
        onClose={close}
      />}
      position={positions.TOP_RIGHT}
      timeout={8000}
      transition={transitions.SCALE}
      containerStyle={{
        width: 'auto',
        zIndex: '10001',
        pointerEvents: 'all',
        top: '80px',
        left: 'unset',
        right: '24px',
        gap: '12px',
      }}
    >
      {currentProvider?.isConnected && !isRightNetwork
        ? <NetworkWarning />
        : <AppContainer $wide={isShowDao}>
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="app__content">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="app__main">
              {
                isSelectPage || infoPages.includes(daoAddress)
                  ? <div className="app__main-content">{children}</div>
                  : <>
                    {
                      isDaoOnSupportedNetwork
                        ? <NotFound text={t('DAO_TOKEN_NOT_SUPPORTED')} />
                        : <SupportedDaoNetworks networkOptions={supportedNetworks} />
                    }
                  </>
              }
            </main>
          </div>
        </AppContainer>

      }
      <TransactionLoader />
    </AlertProvider>
  );
}

export default Layout;
