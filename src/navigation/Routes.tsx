import { lazy, useEffect } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import * as Sentry from '@sentry/react';
import { ProposalContractType } from 'typings/contracts';

import LazyLoading from 'components/Base/LazyLoading';
import ErrorBoundary from 'components/Custom/ErrorBoundary';

import { getState } from 'store';

import { RoutePaths } from 'constants/routes';
import { captureError } from 'utils/errors';

const QVault = lazy(() => import('pages/QVault'));
const Manage = lazy(() => import('pages/Parameters'));
const Dashboard = lazy(() => import('pages/Dashboard'));

const DataPrivacy = lazy(() => import('pages/DataPrivacy'));
const Governance = lazy(() => import('pages/Governance'));
const VotingPower = lazy(() => import('pages/Governance/components/VotingPower'));
const NewProposal = lazy(() => import('pages/Governance/NewProposal'));
const Proposal = lazy(() => import('pages/Governance/Proposal'));
const Imprint = lazy(() => import('pages/Imprint'));
const NotFound = lazy(() => import('pages/NotFound'));

function addSentryContext () {
  try {
    const { chainId } = getState().user;
    Sentry.setContext('additional', { network: chainId });
  } catch (error) {
    captureError(error);
  }
}

function Routes () {
  useEffect(() => {
    addSentryContext();
  }, []);

  return (
    <ErrorBoundary>
      <LazyLoading>
        <Switch>
          <Route exact path={['/', '/dashboard/:slug']}>
            <Dashboard />
          </Route>

          <Route exact path="/q-parameters/:type?">
            <Manage />
          </Route>

          <Route exact path="/governance/:type/new">
            <NewProposal />
          </Route>

          <Route exact path={RoutePaths.votingPower}>
            <VotingPower />
          </Route>

          <Route exact path={RoutePaths.governanceTab}>
            <Governance />
          </Route>

          <Route
            exact
            path={RoutePaths.proposal}
            component={(props: RouteComponentProps<{ id: string; contract: ProposalContractType }>) => (
              <Proposal {...props} />
            )}
          />

          <Route exact path={RoutePaths.qVault}>
            <QVault />
          </Route>

          <Route exact path="/imprint">
            <Imprint />
          </Route>
          <Route exact path="/data-privacy">
            <DataPrivacy />
          </Route>

          <Route component={NotFound} />
        </Switch>
      </LazyLoading>
    </ErrorBoundary>
  );
}

export default Routes;
