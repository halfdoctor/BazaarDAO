
import { useMemo } from 'react';

import { ProposalStatus } from '@q-dev/q-js-sdk';
import { Tag } from '@q-dev/q-ui-kit';
import { DaoProposal, DaoProposalVotingInfo } from 'typings/proposals';

import PageLayout from 'components/PageLayout';

import ProposalTurnout from './components/ProposalTurnout';
import ProposalVeto from './components/ProposalVeto';
import ProposalVoting from './components/ProposalVoting';
import { ProposalLayoutContainer } from './styles';

import { useDaoProposals } from 'store/dao-proposals/hooks';

function ProposalLayout ({ proposal, proposalInfo }: {
  proposal: DaoProposal; proposalInfo: DaoProposalVotingInfo;
}) {
  const { statusMap, getStatusState } = useDaoProposals();
  const status = useMemo(() => {
    return statusMap[proposalInfo?.votingStatus || ProposalStatus.NONE];
  }, [proposalInfo]);

  return (
    <PageLayout
      title={`#${proposal.id} ${proposal.remark}`}
      titleExtra={<Tag state={getStatusState(proposalInfo.votingStatus)}>{status}</Tag>}
    // action={<ProposalActions proposal={proposal} title={title} />}
    >
      <ProposalLayoutContainer>
        {/* <ProposalDetails proposal={proposal} type={type} />
        {proposal.parameters?.length > 0 && (
          <ProposalParameters proposal={proposal} />
        )} */}

        <div className="proposal-layout__voting">
          <ProposalTurnout proposal={proposal} proposalInfo={proposalInfo} />
          <ProposalVoting proposal={proposal} />
          <ProposalVeto proposal={proposal} />
        </div>
      </ProposalLayoutContainer>
    </PageLayout>
  );
}

export default ProposalLayout;
