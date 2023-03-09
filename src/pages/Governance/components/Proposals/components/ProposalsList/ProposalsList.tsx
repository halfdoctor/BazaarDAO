import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Illustration } from '@q-dev/q-ui-kit';
import { fillArray } from '@q-dev/utils';
import { ProposalEvent } from 'typings/contracts';
import { ProposalFilterStatus, ProposalType } from 'typings/proposals';

import Button from 'components/Button';

import ProposalCard from '../ProposalCard';
import ProposalCardSkeleton from '../ProposalCardSkeleton';

import { ListEmptyStub, ListNextContainer, ListWrapper } from './styles';

import { useProposals } from 'store/proposals/hooks';

const PAGE_LIMIT = 10;

function ProposalsList ({ type, status }: { type: ProposalType; status: ProposalFilterStatus }) {
  const { t } = useTranslation();
  const {
    proposalsMap,
    getActiveProposalsByType,
    getEndedProposalsByType
  } = useProposals();

  const { proposals, isLoading } = proposalsMap[type];
  const activeProposals = getActiveProposalsByType(type);
  const endedProposals = getEndedProposalsByType(type);
  const filteredProposals = getFilteredProposals();

  const [list, setList] = useState<ProposalEvent[]>([]);
  const [offset, setOffset] = useState(PAGE_LIMIT);

  useEffect(() => {
    setOffset(PAGE_LIMIT);
    setList(filteredProposals.slice(0, PAGE_LIMIT));
  }, [status, proposals]);

  const handleNextProposals = () => {
    const newOffset = offset + PAGE_LIMIT;
    const newList = list.concat(filteredProposals.slice(offset, newOffset));
    setOffset((offset) => offset + PAGE_LIMIT);
    setList(newList);
  };

  function getFilteredProposals () {
    switch (status) {
      case 'active':
        return activeProposals;
      case 'ended':
        return endedProposals;
      default:
        return proposals;
    }
  }

  if (isLoading) {
    return (
      <ListWrapper>
        {fillArray(10).map((id) => (
          <ProposalCardSkeleton key={id} />
        ))}
      </ListWrapper>
    );
  }

  if (list.length === 0) {
    return (
      <ListEmptyStub>
        <Illustration type="empty-list" />
        <p className="text-lg font-semibold">{t('NO_PROPOSALS_FOUND')}</p>
      </ListEmptyStub>
    );
  }

  return (
    <>
      <ListWrapper>
        {list.map((proposal) => (
          <ProposalCard key={proposal.id + proposal?.contract} proposal={proposal} />
        ))}
      </ListWrapper>

      {filteredProposals.length > list.length && (
        <ListNextContainer>
          <Button
            alwaysEnabled
            onClick={handleNextProposals}
          >{t('SHOW_MORE')}</Button>
        </ListNextContainer>
      )}
    </>
  );
}

export default ProposalsList;
