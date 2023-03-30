import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';

import { Icon } from '@q-dev/q-ui-kit';
import { useInterval } from '@q-dev/react-hooks';
import { DaoProposal, DaoProposalVotingInfo } from 'typings/proposals';

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
  const { composeDaoLink } = useDao();
  const { getPanelsName, panelsName, getProposal, getProposalInfo } = useDaoProposals();
  const [proposal, setProposal] = useState<DaoProposal | null>(null);
  const [panelName, setPanelName] = useState('');
  const [proposalInfo, setProposalInfo] = useState<DaoProposalVotingInfo | null>(null);
  const { id, panel } = useParams<ProposalParams>();

  const loadProposal = async () => {
    try {
      await getPanelsName();
      const pathPanelId = panel.split('panels-')[1];
      const panelName = panelsName.find((_, index) => index === Number(pathPanelId)) || '';

      if (!panelName) return;
      setPanelName(panelName);
      const newProposal = await getProposal(panelName, id) as DaoProposal;

      if (!newProposal || !newProposal.id) {
        history.replace('/not-found');
        return;
      }

      setProposal({ ...newProposal });
      const newProposalInfo = await getProposalInfo(newProposal.id, panelName);
      if (newProposalInfo) { setProposalInfo({ ...newProposalInfo }); }
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
    history.replace(composeDaoLink(RoutePaths.governance));
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
        <span>{panelName}</span>
      </Button>

      {proposal && proposalInfo
        ? <ProposalLayout proposal={proposal} proposalInfo={proposalInfo} />
        : <ProposalSkeleton />
      }
    </div>
  );
}

export default Proposal;
