import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';

import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { Icon } from '@q-dev/q-ui-kit';
import { useInterval } from '@q-dev/react-hooks';
import { ErrorHandler, getExternalVotingSituationInfo } from 'helpers';
import { ProposalBaseInfo } from 'typings/proposals';

import Button from 'components/Button';

import { useDaoProposals } from 'hooks/useDaoProposals';

import ProposalLayout from './components/ProposalLayout';
import ProposalSkeleton from './components/Proposals/components/ProposalSkeleton';

import { useDaoStore } from 'store/dao/hooks';
import { useExpertPanels } from 'store/expert-panels/hooks';
import { useTransaction } from 'store/transaction/hooks';

import { RoutePaths } from 'constants/routes';

interface ProposalParams {
  id: string;
  panel: string;
}

function Proposal () {
  const history = useHistory();
  const { t } = useTranslation();
  const { composeDaoLink } = useDaoStore();
  const { availablePanels, loadExpertPanels } = useExpertPanels();
  const { getProposalBaseInfo, getProposalSituationLink } = useDaoProposals();
  const [proposal, setProposal] = useState<ProposalBaseInfo | null>(null);
  const [externalAbi, setExternalAbi] = useState<string[] | undefined>();
  const [isExternalProposalSituation, setIsExternalProposalSituation] = useState(false);
  const { id, panel } = useParams<ProposalParams>();
  const { pendingTransactions } = useTransaction();

  const loadProposal = async () => {
    try {
      await loadExpertPanels();
      const pathPanelId = panel.split('panel-')[1];
      const panelName = availablePanels.find((_, index) => index === Number(pathPanelId)) || '';
      const proposalBaseInfo = panelName && id ? await getProposalBaseInfo(panelName, id) : null;

      if (!proposalBaseInfo) {
        history.replace('/not-found');
        return;
      }

      const situationsList: string[] = Object.values(DefaultVotingSituations);

      const isExternalSituation = !situationsList.includes(proposalBaseInfo.relatedVotingSituation);
      if (isExternalSituation) {
        const link = await getProposalSituationLink(panelName, id);

        if (link) {
          const info = await getExternalVotingSituationInfo(link);
          setExternalAbi(info?.abi);
        }
      }

      setIsExternalProposalSituation(isExternalSituation);
      setProposal(proposalBaseInfo);
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  };

  const handleBackClick = () => {
    const location = history.location as { state?: { from: string } };
    if (location.state?.from === 'list') {
      history.goBack();
      return;
    }
    history.replace(panel
      ? composeDaoLink(`${RoutePaths.governance}/${panel}`)
      : composeDaoLink(RoutePaths.governance));
  };

  useInterval(loadProposal, 60_000, { immediate: true });

  useEffect(() => {
    if (!pendingTransactions.length) {
      setProposal(null);
      loadProposal();
    }
  }, [pendingTransactions.length]);

  return (
    <div className="proposal">
      <Button
        alwaysEnabled
        look="ghost"
        style={{ marginBottom: '24px' }}
        onClick={handleBackClick}
      >
        <Icon name="arrow-left" />
        <span>{proposal?.relatedExpertPanel || t('GOVERNANCE')}</span>
      </Button>

      {proposal
        ? <ProposalLayout
          proposal={proposal}
          externalAbi={externalAbi}
          isExternalProposalSituation={isExternalProposalSituation}
        />
        : <ProposalSkeleton />
      }
    </div>
  );
}

export default Proposal;
