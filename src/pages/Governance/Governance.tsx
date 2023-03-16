import { useTranslation } from 'react-i18next';
import { Redirect, Route, useLocation } from 'react-router';
import { Link } from 'react-router-dom';

import { Icon } from '@q-dev/q-ui-kit';

import Button from 'components/Button';
import PageLayout from 'components/PageLayout';
import Tabs from 'components/Tabs';
import { TabRoute, TabSwitch } from 'components/Tabs/components';

import useDao from 'hooks/useDao';

import Proposals from './components/Proposals';
import VotingStats from './components/VotingStats';

import { useProposals } from 'store/proposals/hooks';

import { RoutePaths } from 'constants/routes';

function Governance () {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { getActiveProposalsByType } = useProposals();
  const { composeDaoLink } = useDao();

  const tabs = [
    {
      id: 'q-proposals',
      label: t('Q_PROPOSALS'),
      count: getActiveProposalsByType('q').length,
      link: composeDaoLink(RoutePaths.qProposals),
    },
    {
      id: 'expert-roposals',
      label: t('EXPERT_PROPOSALS'),
      count: getActiveProposalsByType('expert').length,
      link: composeDaoLink(RoutePaths.expertProposals),
    },
  ];

  const pathToNewProposalPath: Record<string, string> = {
    [composeDaoLink(RoutePaths.qProposals)]: composeDaoLink(RoutePaths.newQProposal),
    [composeDaoLink(RoutePaths.expertProposals)]: composeDaoLink(RoutePaths.newExpertProposal),
  };

  const redirectTab = tabs.find(tab => tab.count > 0) || tabs[0];

  return (
    <PageLayout
      title={t('GOVERNANCE')}
      action={(
        <Link to={pathToNewProposalPath[pathname] || composeDaoLink(RoutePaths.newQProposal)}>
          <Button block>
            <Icon name="add" />
            <span>{t('CREATE_PROPOSAL')}</span>
          </Button>
        </Link>
      )}
    >
      <VotingStats />
      <Tabs tabs={tabs} />
      <TabSwitch>
        <>
          <Route exact path={'/:address' + RoutePaths.governance}>
            <Redirect to={redirectTab.link} />
          </Route>

          <TabRoute exact path={'/:address' + RoutePaths.qProposals}>
            <Proposals type="q" />
          </TabRoute>

          <TabRoute exact path={'/:address' + RoutePaths.expertProposals}>
            <Proposals type="expert" />
          </TabRoute>
        </>
      </TabSwitch>
    </PageLayout>
  );
}

export default Governance;
