
import { Tag } from '@q-dev/q-ui-kit';
import { Proposal, ProposalType } from 'typings/proposals';

import PageLayout from 'components/PageLayout';
import useProposalDetails from 'pages/Governance/hooks/useProposalDetails';

import ProposalActions from './components/ProposalActions';
import ProposalDetails from './components/ProposalDetails';
import ProposalParameters from './components/ProposalParameters';
import ProposalTurnout from './components/ProposalTurnout';
import ProposalVeto from './components/ProposalVeto';
import ProposalVoting from './components/ProposalVoting';
import { ProposalLayoutContainer } from './styles';

function ProposalLayout ({ proposal, type }: { proposal: Proposal; type: ProposalType }) {
  const { title, status, state } = useProposalDetails(proposal);

  return (
    <PageLayout
      title={`#${proposal.id} ${title}`}
      titleExtra={<Tag state={state}>{status}</Tag>}
      action={<ProposalActions proposal={proposal} title={title} />}
    >
      <ProposalLayoutContainer>
        <ProposalDetails proposal={proposal} type={type} />
        {proposal.parameters?.length > 0 && (
          <ProposalParameters proposal={proposal} />
        )}

        <div className="proposal-layout__voting">
          <ProposalTurnout proposal={proposal} />
          <ProposalVoting proposal={proposal} />
          <ProposalVeto proposal={proposal} />
        </div>
      </ProposalLayoutContainer>
    </PageLayout>
  );
}

export default ProposalLayout;
