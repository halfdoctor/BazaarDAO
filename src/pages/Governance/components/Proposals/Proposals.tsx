import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { ProposalFilter, ProposalFilterStatus, ProposalType } from 'typings/proposals';

import ProposalsList from './components/ProposalsList';

import { useProposals } from 'store/proposals/hooks';

function Proposals ({ type }: { type: ProposalType }) {
  const { getProposals } = useProposals();

  const { search } = useLocation();
  const query = new URLSearchParams(search);

  const [filters, setFilters] = useState<ProposalFilter>(getDefaultFilters());

  useEffect(() => {
    setFilters(getDefaultFilters());
    getProposals(type);
  }, [type]);

  function getDefaultFilters () {
    return { status: (query.get('status') || '') as ProposalFilterStatus };
  }

  return (
    <div className="proposals">
      <ProposalsList type={type} status={filters.status} />
    </div>
  );
}

export default Proposals;
