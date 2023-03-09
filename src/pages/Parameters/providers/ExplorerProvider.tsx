import { ReactNode } from 'react';

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache
} from '@apollo/client';

import useNetworkConfig from 'hooks/useNetworkConfig';

function ExplorerProvider ({ children }: { children: ReactNode }) {
  const { explorerUrl } = useNetworkConfig();
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: `${explorerUrl}/graphql` }),
  });

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

export default ExplorerProvider;
