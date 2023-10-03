import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SupportedDaoNetworks from 'components/SupportedDaoNetworks';
import TransactionLoader from 'components/TransactionLoader';
import Header from 'navigation/Header';
import Sidebar from 'navigation/Sidebar';
import NotFound from 'pages/NotFound';

import { AppContainer } from './styles';

import { useDaoStore } from 'store/dao/hooks';

interface Props {
  children: ReactNode;
}

function Layout ({ children }: Props) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    supportedNetworks,
    isDaoOnSupportedNetwork,
    isShowDao,
    isSelectPage,
    daoAddress
  } = useDaoStore();

  const infoPages = ['imprint', 'privacy'];

  return (
    <>
      <AppContainer $wide={isShowDao}>
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
      <TransactionLoader />
    </>
  );
}

export default Layout;
