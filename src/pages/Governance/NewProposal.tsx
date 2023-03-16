import { useTranslation } from 'react-i18next';

import PageLayout from 'components/PageLayout';
import Tabs from 'components/Tabs';
import { TabRoute, TabSwitch } from 'components/Tabs/components';

import useDao from 'hooks/useDao';

import { NewExpertProposal, NewQProposal } from './components/NewProposal';

import { RoutePaths } from 'constants/routes';

function NewProposal () {
  const { t } = useTranslation();
  const { composeDaoLink } = useDao();

  const tabs = [
    {
      id: 'q-proposal',
      label: t('Q_PROPOSAL'),
      link: composeDaoLink(RoutePaths.newQProposal)
    },
    {
      id: 'expert-roposal',
      label: t('EXPERT_PROPOSAL'),
      link: composeDaoLink(RoutePaths.newExpertProposal)
    },
  ];

  return (
    <PageLayout title={t('NEW_PROPOSAL')}>
      <Tabs tabs={tabs} />
      <TabSwitch>
        <>
          <TabRoute exact path={composeDaoLink(RoutePaths.newQProposal)}>
            <NewQProposal />
          </TabRoute>

          <TabRoute exact path={composeDaoLink(RoutePaths.newExpertProposal)}>
            <NewExpertProposal />
          </TabRoute>
        </>
      </TabSwitch>
    </PageLayout>
  );
}

export default NewProposal;
