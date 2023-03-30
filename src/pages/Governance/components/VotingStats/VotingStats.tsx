import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { formatAsset } from '@q-dev/utils';
import { fromWei } from 'web3-utils';

import { StatsContainer } from './styles';

import { useDaoStore } from 'store/dao/hooks';
import { useDaoVault } from 'store/dao-vault/hooks';

import { formatDateDMY, formatTimeGMT, unixToDate } from 'utils/date';

function VotingStats () {
  const { t, i18n } = useTranslation();
  const { vaultBalance, vaultTimeLock, loadWithdrawalAmount } = useDaoVault();
  const { tokenInfo } = useDaoStore();
  const voterStatus = 'Need get from contract';

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
      value: <span className="text-lg font-semibold">{voterStatus}</span>
    }
  ];

  useEffect(() => {
    loadWithdrawalAmount();
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
