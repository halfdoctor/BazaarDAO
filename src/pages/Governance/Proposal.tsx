import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';

import { Icon } from '@q-dev/q-ui-kit';
import { useInterval } from '@q-dev/react-hooks';
import { ProposalBaseInfo } from 'typings/proposals';

import Button from 'components/Button';

import useDao from 'hooks/useDao';

import ProposalLayout from './components/ProposalLayout';
import ProposalSkeleton from './components/Proposals/components/ProposalSkeleton';

import { useDaoProposals } from 'store/dao-proposals/hooks';

import { RoutePaths } from 'constants/routes';
import { captureError } from 'utils/errors';

interface ProposalParams {
  id: string;
  panel: string;
}

function Proposal () {
  const history = useHistory();
  const { t } = useTranslation();
  const { composeDaoLink } = useDao();
  const { getPanelsName, panelsName, getProposalBaseInfo } = useDaoProposals();
  const [proposal, setProposal] = useState<ProposalBaseInfo | null>(null);
  const { id, panel } = useParams<ProposalParams>();

  const loadProposal = async () => {
    try {
      await getPanelsName();
      const pathPanelId = panel.split('panels-')[1];
      const panelName = panelsName.find((_, index) => index === Number(pathPanelId)) || '';
      const proposalBaseInfo = panelName && id ? await getProposalBaseInfo(panelName, id) : null;
      if (!proposalBaseInfo) {
        history.replace('/not-found');
        return;
      }
      setProposal(proposalBaseInfo);
    } catch (error) {
      captureError(error);
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

  useEffect(() => {
    loadProposal();
  }, []);

  useInterval(loadProposal, 60_000);

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
        ? <ProposalLayout proposal={proposal} />
        : <ProposalSkeleton />
      }
    </div>
  );
}

export default Proposal;
