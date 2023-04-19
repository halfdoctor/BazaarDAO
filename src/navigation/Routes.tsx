import { lazy, useCallback, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

import * as Sentry from '@sentry/react';
import { useWeb3Context } from 'context/Web3ContextProvider';

import LazyLoading from 'components/Base/LazyLoading';
import ErrorBoundary from 'components/Custom/ErrorBoundary';

import useDao from 'hooks/useDao';
import useLoadDao from 'hooks/useLoadDao';

import { useDaoStore } from 'store/dao/hooks';

import { LOAD_TYPES } from 'constants/statuses';
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

function Routes () {
  const { currentProvider, setLoadAppType } = useWeb3Context();
  const { daoAddress } = useDaoStore();
  const { pathDaoAddress } = useDao();
  const { loadAdditionalInfo } = useLoadDao();

  const loadApp = useCallback(async () => {
    setLoadAppType(LOAD_TYPES.loading);
    await loadAdditionalInfo();
    setLoadAppType(LOAD_TYPES.loaded);
  }, [pathDaoAddress]);

  const addSentryContext = () => {
    try {
      if (!currentProvider) return;
      Sentry.setContext('additional', { network: currentProvider.chainId });
    } catch (error) {
      captureError(error);
    }
  };

  useEffect(() => {
    if (pathDaoAddress && pathDaoAddress !== daoAddress) {
      loadApp();
    }
  }, [pathDaoAddress]);

  useEffect(() => {
    addSentryContext();
  }, []);

  useEffect(() => {
    loadAdditionalInfo();
  }, [currentProvider]);

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
