import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route } from 'react-router';
import { Link } from 'react-router-dom';

import { Icon } from '@q-dev/q-ui-kit';

import LazyLoading from 'components/Base/LazyLoading';
import Button from 'components/Button';
import PageLayout from 'components/PageLayout';
import Tabs from 'components/Tabs';
import { TabRoute, TabSwitch } from 'components/Tabs/components';

import useDao from 'hooks/useDao';

import ExplorerProvider from './providers/ExplorerProvider';

import { RoutePaths } from 'constants/routes';

const QContractRegistryParameters = lazy(() => import('./components/QParameters/QContractRegistryParameters'));
const QConstitutionParameters = lazy(() => import('./components/QParameters/QConstitutionParameters'));
const QFIParameters = lazy(() => import('./components/QParameters/QFIParameters'));
const QEPDRParameters = lazy(() => import('./components/QParameters/QEPDRParameters'));
const QEPRSParameters = lazy(() => import('./components/QParameters/QEPRSParameters'));

function Parameters () {
  const { t } = useTranslation();
  const { composeDaoLink } = useDao();

  const tabs = [
    {
      id: 'contract-registry',
      label: t('CONTRACT_REGISTRY'),
      link: composeDaoLink(RoutePaths.qContractRegistry)
    },
    {
      id: 'constitution',
      label: t('CONSTITUTION'),
      link: composeDaoLink(RoutePaths.qConstitution)
    },
    {
      id: 'fees-and-incentives',
      label: t('FEES_INCENTIVES_EXPERT'),
      link: composeDaoLink(RoutePaths.qFeesAndIncentivesExpertPanel)
    },
    {
      id: 'defi-risk',
      label: t('DEFI_RISK_EXPERT'),
      link: composeDaoLink(RoutePaths.qDefiRiskExpertPanelParameters)
    },
    {
      id: 'root-node-selection',
      label: t('ROOT_NODE_SELECTION_EXPERT'),
      link: composeDaoLink(RoutePaths.qRootNodeSelectionExpertPanelParameters)
    },
  ];

  return (
    <PageLayout
      title={t('PARAMETERS')}
      action={
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to={composeDaoLink(RoutePaths.dashboard)}>
            <Button
              block
              alwaysEnabled
              look="secondary"
            >
              <Icon name="dashboard" />
              <span>{t('DASHBOARD')}</span>
            </Button>
          </Link>
        </div>
      }
    >
      <Tabs tabs={tabs} />

      <TabSwitch>
        <>
          <Route exact path={composeDaoLink(RoutePaths.parameters)}>
            <Redirect to={composeDaoLink(RoutePaths.qContractRegistry)} />
          </Route>

          <TabRoute exact path={composeDaoLink(RoutePaths.qContractRegistry)}>
            <LazyLoading>
              <ExplorerProvider>
                <QContractRegistryParameters />
              </ExplorerProvider>
            </LazyLoading>
          </TabRoute>

          <TabRoute exact path={composeDaoLink(RoutePaths.qConstitution)}>
            <LazyLoading>
              <QConstitutionParameters />
            </LazyLoading>
          </TabRoute>

          <TabRoute exact path={composeDaoLink(RoutePaths.qFeesAndIncentivesExpertPanel)}>
            <LazyLoading>
              <QFIParameters />
            </LazyLoading>
          </TabRoute>

          <TabRoute exact path={composeDaoLink(RoutePaths.qDefiRiskExpertPanelParameters)}>
            <LazyLoading>
              <QEPDRParameters />
            </LazyLoading>
          </TabRoute>

          <TabRoute exact path={composeDaoLink(RoutePaths.qRootNodeSelectionExpertPanelParameters)}>
            <LazyLoading>
              <QEPRSParameters />
            </LazyLoading>
          </TabRoute>
        </>
      </TabSwitch>

    </PageLayout>
  );
}

export default Parameters;
