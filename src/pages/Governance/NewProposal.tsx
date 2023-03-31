import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Illustration } from '@q-dev/q-ui-kit';

import SpinnerLoading from 'components/Base/SpinnerLoading';
import PageLayout from 'components/PageLayout';
import Tabs from 'components/Tabs';
import { TabRoute, TabSwitch } from 'components/Tabs/components';

import useDao from 'hooks/useDao';

import CreateProposal from './components/CreateProposal';
import { ListEmptyStub } from './components/Proposals/styles';

import { useDaoProposals } from 'store/dao-proposals/hooks';

function NewProposal () {
  const { t } = useTranslation();
  const { getPanelsName, panelsName } = useDaoProposals();
  const { composeDaoLink } = useDao();
  const [isLoading, setIsLoading] = useState(true);

  const tabs = useMemo(() => {
    return panelsName.map((name, index) => ({
      id: index,
      label: name,
      link: composeDaoLink(`/governance/panels-${index}/new`),
    }));
  }, [panelsName]);

  const loadPanelsName = async () => {
    setIsLoading(true);
    await getPanelsName();
    setIsLoading(false);
  };

  useEffect(() => { loadPanelsName(); }, []);

  if (isLoading) {
    return (
      <SpinnerLoading />
    );
  }

  if (!tabs.length) {
    return (
      <ListEmptyStub>
        <Illustration type="empty-list" />
        <p className="text-lg font-semibold">{t('NO_PANELS_FOUND')}</p>
      </ListEmptyStub>
    );
  }

  return (
    <PageLayout title={t('NEW_PROPOSAL')}>
      <Tabs tabs={tabs} />
      <TabSwitch>
        <>
          {tabs.map(({ id, label, link }) => (
            <TabRoute
              key={id}
              exact
              path={link}
            >
              <CreateProposal panelName={label} />
            </TabRoute>
          ))}
        </>
      </TabSwitch>
    </PageLayout>
  );
}

export default NewProposal;
