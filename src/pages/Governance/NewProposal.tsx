import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import PageLayout from 'components/PageLayout';
import Tabs from 'components/Tabs';
import { TabRoute, TabSwitch } from 'components/Tabs/components';

import useDao from 'hooks/useDao';

import NewProposalTab from './components/NewProposalTab';

import { useDaoProposals } from 'store/dao-proposals/hooks';

function NewProposal () {
  const { t } = useTranslation();
  const { getPanelsName, panelsName } = useDaoProposals();
  const { composeDaoLink } = useDao();

  const tabs = useMemo(() => {
    return panelsName.map((name, index) => ({
      id: index,
      label: name,
      link: composeDaoLink(`/governance/panels-${index}/new`),
    }));
  }, [panelsName]);

  useEffect(() => { getPanelsName(); }, []);

  return (
    <PageLayout title={t('NEW_PROPOSAL')}>
      {tabs.length
        ? (
          <>
            <Tabs tabs={tabs} />
            <TabSwitch>
              <>
                {tabs.map(({ id, label, link }) => (
                  <TabRoute
                    key={id}
                    exact
                    path={link}
                  >
                    <NewProposalTab panelName={label} />
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

export default NewProposal;
