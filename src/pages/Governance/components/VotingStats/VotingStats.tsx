import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatAsset } from '@q-dev/utils';
import { fromWei } from 'web3-utils';

import { StatsContainer } from './styles';

import { useDaoStore } from 'store/dao/hooks';
import { useDaoProposals } from 'store/dao-proposals/hooks';
import { useDaoVault } from 'store/dao-vault/hooks';

import { formatDateDMY, formatTimeGMT, unixToDate } from 'utils/date';

function VotingStats () {
  const { t, i18n } = useTranslation();
  const { vaultBalance, vaultTimeLock, loadWithdrawalAmount } = useDaoVault();
  const { tokenInfo } = useDaoStore();
  const { getAccountStatuses } = useDaoProposals();
  const [voterStatus, setVoterStatus] = useState<string[]>([]);

  const loadAccountStatuses = async () => {
    const response = await getAccountStatuses();
    setVoterStatus(response?.accountGroupsStatuses || []);
  };

  const statsList = [
    {
      title: t('TOTAL_VOTING_WEIGHT'),
      value: formatAsset(fromWei(vaultBalance || '0'), tokenInfo.symbol),
    },
    {
      title: t('VOTING_LOCKING_END'),
      value: vaultTimeLock && vaultTimeLock !== '0'
        ? (
          <>
            <span>{formatDateDMY(unixToDate(vaultTimeLock), i18n.language)}</span>
            <span className="text-md">{formatTimeGMT(unixToDate(vaultTimeLock), i18n.language)}</span>
          </>
        )
        : '–'
    },
    {
      title: t('VOTING_STATUS'),
      value: <span className="text-lg font-semibold stats-item-val--groups">{voterStatus.length ? voterStatus.join(', ') : '–'}</span>
    }
  ];

  useEffect(() => {
    loadWithdrawalAmount();
    loadAccountStatuses();

    return () => {
      setVoterStatus([]);
    };
  }, []);

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
