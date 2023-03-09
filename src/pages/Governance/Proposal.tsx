import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps, useHistory } from 'react-router';

import { Icon } from '@q-dev/q-ui-kit';
import { useInterval } from '@q-dev/react-hooks';
import { ProposalContractType } from 'typings/contracts';
import { Proposal as ProposalInterface, ProposalType } from 'typings/proposals';

import Button from 'components/Button';

import ProposalLayout from './components/ProposalLayout';
import ProposalSkeleton from './components/Proposals/components/ProposalSkeleton';

import { useTransaction } from 'store/transaction/hooks';

import { getProposal, getProposalTypeByContract } from 'contracts/helpers/voting';

import { RoutePaths } from 'constants/routes';

function Proposal ({ match }: RouteComponentProps<{
  id: string;
  contract: ProposalContractType;
}>) {
  const { t } = useTranslation();
  const history = useHistory();
  const { pendingTransactions } = useTransaction();

  const [proposal, setProposal] = useState<ProposalInterface |null>(null);
  const type = getProposalTypeByContract(match.params.contract);

  useInterval(loadProposal, 60_000);
  useEffect(() => {
    if (!pendingTransactions.length) {
      setProposal(null);
      loadProposal();
    }
  }, [pendingTransactions.length]);

  async function loadProposal () {
    const proposal = await getProposal(match.params.contract, match.params.id);
    if (!proposal) {
      history.replace('/not-found');
      return;
    }

    setProposal(proposal);
  }

  const handleBackClick = () => {
    const location = history.location as { state?: { from: string } };
    if (location.state?.from === 'list') {
      history.goBack();
      return;
    }

    history.replace(RoutePaths.governance);
  };

  const backTextMap: Record<ProposalType, string> = {
    q: t('Q_PROPOSALS'),
    expert: t('EXPERT_PROPOSALS'),
  };

  return (
    <div className="proposal">
      <Button
        alwaysEnabled
        look="ghost"
        style={{ marginBottom: '24px' }}
        onClick={handleBackClick}
      >
        <Icon name="arrow-left" />
        <span>{backTextMap[type]}</span>
      </Button>

      {proposal
        ? <ProposalLayout type={type} proposal={proposal} />
        : <ProposalSkeleton />
      }
    </div>
  );
}

export default Proposal;
