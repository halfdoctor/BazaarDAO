import { ReactNode, useState } from 'react';
import { positions, Provider as AlertProvider, transitions } from 'react-alert';

import { useWeb3Context } from 'context/Web3ContextProvider';

import NetworkWarning from 'components/NetworkWarning';
import Toast from 'components/Toast';
import TransactionLoader from 'components/TransactionLoader';
import Header from 'navigation/Header';
import Sidebar from 'navigation/Sidebar';

import { AppContainer } from './styles';

interface Props {
  children: ReactNode;
}

function Layout ({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isConnected, isRightNetwork } = useWeb3Context();

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
      { isConnected && !isRightNetwork
        ? <NetworkWarning />
        : (
          <AppContainer>
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <div className="app__content">
              <Header onMenuClick={() => setSidebarOpen(true)} />
              <main className="app__main">
                <div className="app__main-content">{children}</div>
              </main>
            </div>
          </AppContainer>)
      }
      <TransactionLoader />
    </AlertProvider>
  );
}

export default Layout;
