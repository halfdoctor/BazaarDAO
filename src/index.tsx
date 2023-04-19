import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { StyleProvider } from '@q-dev/q-ui-kit';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import LanguageProvider from 'context/LanguageProvider';
import Web3ContextProvider from 'context/Web3ContextProvider';

import Layout from 'components/Layout';
import Routes from 'navigation/Routes';

import { store } from './store';

import '@mdi/font/css/materialdesignicons.min.css';

Sentry.init({
  dsn: 'https://55eac6f20f434cc2b23b93499ac31111@o1170264.ingest.sentry.io/6263659',
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  enabled: import.meta.env.NODE_ENV !== 'development',
});

ReactDOM.render(
  <Provider store={store}>
    <StyleProvider>
      <LanguageProvider>
        <Web3ContextProvider>
          <BrowserRouter>
            <Layout>
              <Routes />
            </Layout>
          </BrowserRouter>
        </Web3ContextProvider>
      </LanguageProvider>
    </StyleProvider>
  </Provider>,
  document.getElementById('root')
);
