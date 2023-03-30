import { useEffect, useMemo } from 'react';
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

import { useDaoProposals } from 'store/dao-proposals/hooks';

import { RoutePaths } from 'constants/routes';

function Governance () {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { getPanelsName, panelsName } = useDaoProposals();
  const { composeDaoLink } = useDao();

  const tabs = useMemo(() => {
    return panelsName.map((name, index) => ({
      id: index,
      label: name,
      link: composeDaoLink(`/governance/panels-${index}`),
    }));
  }, [panelsName]);

  const pathToNewProposalPath = tabs.reduce((acc: Record<string, string>, item) => {
    acc[item.link] = `${item.link}/new`;
    return acc;
  }, {});

  useEffect(() => { getPanelsName(); }, []);

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
      {tabs.length
        ? (
          <>
            <Tabs tabs={tabs} />
            <TabSwitch>
              <>
                <Route exact path={'/:address' + RoutePaths.governance}>
                  <Redirect to={tabs[0].link} />
                </Route>
                {tabs.map(({ id, label, link }) => (
                  <TabRoute
                    key={id}
                    exact
                    path={link}
                  >
                    <Proposals panelName={label} />
                  </TabRoute>
                ))}
              </>
            </TabSwitch>
          </>)
        : <>
          loader
        </>}
    </PageLayout>
  );
}

export default Governance;
