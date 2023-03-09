import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import { Select } from '@q-dev/q-ui-kit';
import { ProposalFilter, ProposalFilterStatus, ProposalType } from 'typings/proposals';

import { FiltersWrapper } from './styles';

interface Props {
  type: ProposalType;
  filters: ProposalFilter;
  onChange: (value: ProposalFilter) => void;
}

function ProposalFilters ({ filters, onChange }: Props) {
  const { t } = useTranslation();
  const history = useHistory();

  const updateStatus = (value: ProposalFilterStatus) => {
    history.replace({
      search: value === '' ? '' : `?status=${value}`,
    });
    onChange({ ...filters, status: value });
  };

  return (
    <FiltersWrapper>
      <Select
        chips
        value={filters.status}
        placeholder={t('STATUS')}
        options={[
          { label: t('PROPOSAL_STATUS_ALL'), value: '' },
          { label: t('PROPOSAL_STATUS_ACTIVE'), value: 'active' },
          { label: t('PROPOSAL_STATUS_ENDED'), value: 'ended' },
        ]}
        onChange={updateStatus}
      />
    </FiltersWrapper>
  );
}

export default ProposalFilters;
