import { lazy, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

import { useInterval } from '@q-dev/react-hooks';
import * as Sentry from '@sentry/react';

import LazyLoading from 'components/Base/LazyLoading';
import ErrorBoundary from 'components/Custom/ErrorBoundary';

import useDao from 'hooks/useDao';

import { getState } from 'store';
import { useDaoStore } from 'store/dao/hooks';

import { captureError } from 'utils/errors';

const SelectDAO = lazy(() => import('pages/SelectDAO'));
const Imprint = lazy(() => import('pages/Imprint'));
const DataPrivacy = lazy(() => import('pages/DataPrivacy'));
const NotFound = lazy(() => import('pages/NotFound'));

const VotingPower = lazy(() => import('pages/VotingPower'));
const Manage = lazy(() => import('pages/Parameters'));
const Dashboard = lazy(() => import('pages/Dashboard'));

const Governance = lazy(() => import('pages/Governance'));
const NewProposal = lazy(() => import('pages/Governance/NewProposal'));
const Proposal = lazy(() => import('pages/Governance/Proposal'));

function addSentryContext () {
  try {
    const { chainId } = getState().user;
    Sentry.setContext('additional', { network: chainId });
  } catch (error) {
    captureError(error);
  }
}

function Routes () {
  const { loadAllDaoInfo } = useDaoStore();
  const { pathDaoAddress } = useDao();

  useEffect(() => {
    loadAllDaoInfo(pathDaoAddress);
  }, [pathDaoAddress]);

  useInterval(() => loadAllDaoInfo(pathDaoAddress), 5000);

  useEffect(() => {
    addSentryContext();
  }, []);

  return (
    <ErrorBoundary>
      <LazyLoading>
        <Switch>
          <Route exact path="/">
            <SelectDAO />
          </Route>

          <Route exact path="/imprint">
            <Imprint />
          </Route>

          <Route exact path="/privacy">
            <DataPrivacy />
          </Route>

          <Route exact path="/:address">
            <Dashboard />
          </Route>

          <Route exact path="/:address/parameters/:type?">
            <Manage />
          </Route>

          <Route exact path="/:address/governance/:type/new">
            <NewProposal />
          </Route>

          <Route exact path="/:address/governance/:tab?">
            <Governance />
          </Route>

          <Route exact path="/:address/governance/proposal/:panel?/:id?">
            <Proposal />
          </Route>

          <Route exact path="/:address/voting-power">
            <VotingPower />
          </Route>

          <Route component={NotFound} />
        </Switch>
      </LazyLoading>
    </ErrorBoundary>
  );
}

export default Routes;
