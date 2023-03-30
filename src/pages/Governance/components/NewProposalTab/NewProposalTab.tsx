import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CreateProposal from 'pages/Governance/components/CreateProposal';

import { useDaoProposals } from 'store/dao-proposals/hooks';

function NewProposalTab ({ panelName }: { panelName: string }) {
  const { t } = useTranslation();
  const { getPanelSituation, } = useDaoProposals();
  const [panelSituations, setPanelSituations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPanelSituation = useCallback(async () => {
    setIsLoading(true);
    const situation = await getPanelSituation(panelName);
    setPanelSituations(situation || []);
    setIsLoading(false);
  }, [panelName]);

  useEffect(() => {
    loadPanelSituation();
  }, [panelName]);

  if (isLoading) {
    return <>Loading</>;
  }

  return (
    <>
      {
        panelSituations.length
          ? <CreateProposal panelName={panelName} panelSituations={panelSituations} />
          : <p className="text-lg font-semibold">{t('NO_PROPOSALS_FOUND')}</p>
      }
    </>
  );
}

export default NewProposalTab;
