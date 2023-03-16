import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { formatAsset } from '@q-dev/utils';
import { fromWei } from 'web3-utils';

import useVoteDelegation from 'hooks/useVoteDelegation';
import useVoterStatus from 'hooks/useVoterStatus';

import { StatsContainer } from './styles';

import { useBaseVotingWeightInfo } from 'store/proposals/hooks';
import { useQVault } from 'store/q-vault/hooks';
import { useUser } from 'store/user/hooks';

import { formatDateDMY, formatTimeGMT, unixToDate } from 'utils/date';

function VotingStats () {
  const { t, i18n } = useTranslation();
  const { loadDelegationInfo } = useQVault();
  const { baseVotingWeightInfo, getBaseVotingWeightInfo } = useBaseVotingWeightInfo();

  const user = useUser();
  const voterStatus = useVoterStatus();

  const { ownWeight, lockedUntil } = baseVotingWeightInfo;
  const delegationStatus = useVoteDelegation();

  useEffect(() => {
    getBaseVotingWeightInfo();
    loadDelegationInfo(user.address);
  }, []);

  const statsList = [
    {
      title: t('TOTAL_VOTING_WEIGHT'),
      value: formatAsset(fromWei(ownWeight || '0'), 'Q'),
    },
    {
      title: t('VOTING_LOCKING_END'),
      value: lockedUntil && lockedUntil !== '0'
        ? (
          <>
            <span>{formatDateDMY(unixToDate(lockedUntil), i18n.language)}</span>
            <span className="text-md">{formatTimeGMT(unixToDate(lockedUntil), i18n.language)}</span>
          </>
        )
        : '–'
    },
    {
      title: t('VOTING_STATUS'),
      value: <span className="text-lg font-semibold">{voterStatus}</span>
    },
    {
      title: t('VOTE_DELEGATION'),
      value: <span className="text-lg font-semibold">{delegationStatus}</span>
    }
  ];

  return (
    <StatsContainer className="block">
      <div className="block__header">
        <h2 className="text-h2">{t('VOTING_STATS')}</h2>
      </div>

      <div className="stats-list">
        {statsList.map(({ title, value }) => (
          <div key={title} className="stats-item">
            <p className="stats-item-lbl text-md">{title}</p>
            <p
              className="stats-item-val text-xl font-semibold"
              title={String(value)}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </StatsContainer>
  );
}

export default VotingStats;
