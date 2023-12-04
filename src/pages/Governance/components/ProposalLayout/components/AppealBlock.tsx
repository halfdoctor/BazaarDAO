import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@q-dev/q-ui-kit';
import { unixToDate } from '@q-dev/utils';
import { ProposalBaseInfo } from 'typings/proposals';

import useEndTime from '../hooks/useEndTime';

import { PROPOSAL_STATUS } from 'constants/statuses';

function AppealBlock ({ proposal }: { proposal: ProposalBaseInfo }) {
  const { t } = useTranslation();

  const appealEndTime = proposal.extendedStats?.appealEndTime.toString();

  const vetoEndTime = useEndTime(unixToDate(appealEndTime || '0'));

  const appealStatus = useMemo(() => {
    switch (proposal.votingStatus) {
      case PROPOSAL_STATUS.none:
      case PROPOSAL_STATUS.pending:
      case PROPOSAL_STATUS.underEvaluation:
      case PROPOSAL_STATUS.underReview:
        return t('THERE_HAS_BEEN_NO_APPEAL');
      default:
        return proposal.extendedStats?.counters.isAppealed
          ? t('APPEAL_HAD_BEEN_MADE')
          : t('THERE_HAD_BEEN_NO_APPEAL');
    }
  }, [proposal.votingStatus, proposal.extendedStats?.counters.isAppealed, t]);

  return (
    <div className="block">
      <div className="block__header">
        <h2 className="text-h2">{t('APPEAL_PERIOD')}</h2>
        {appealEndTime && (
          <Tooltip
            placement="bottom"
            trigger={(
              <p className="text-md font-light">{vetoEndTime.relative}</p>
            )}
          >
            {vetoEndTime.formatted}
          </Tooltip>
        )}
      </div>

      <div className="block__content">
        <p className="text-lg">
          {appealStatus}
        </p>
      </div>
    </div>
  );
}

export default AppealBlock;
