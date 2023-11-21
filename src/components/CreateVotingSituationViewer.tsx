import { useTranslation } from 'react-i18next';

import { VotingType } from '@q-dev/gdk-sdk';
import { formatAsset, formatDuration, formatPercent } from '@q-dev/utils';
import { VotingSituationForm } from 'typings/forms';

import { useDaoStore } from 'store/dao/hooks';
import { useDaoTokenStore } from 'store/dao-token/hooks';

import { VOTING_TYPE_TRANSLATION_KEY_MAP } from 'constants/proposal';

interface Props {
  situationsParams: VotingSituationForm;
}

function CreateVotingSituationViewer ({ situationsParams }: Props) {
  const { t } = useTranslation();
  const { tokenInfo } = useDaoTokenStore();
  const { canDAOSupportSituationExternalLinks } = useDaoStore();

  return (
    <>
      <div>
        <p className="text-md color-secondary">{t('VOTING_SITUATION_NAME')}</p>
        <p className="text-lg break-word">
          {situationsParams.situationName}
        </p>
      </div>

      <div>
        <p className="text-md color-secondary">{t('VOTING_PERIOD')}</p>
        <p
          className="text-lg break-word"
          title={t('NUMBER_SECONDS', { number: situationsParams.votingPeriod })}

        >
          {formatDuration(situationsParams.votingPeriod)}
        </p>
      </div>
      <div>
        <p className="text-md color-secondary">{t('VETO_PERIOD')}</p>
        <p
          className="text-lg break-word"
          title={t('NUMBER_SECONDS', { number: situationsParams.vetoPeriod })}
        >
          {formatDuration(situationsParams.vetoPeriod)}
        </p>
      </div>
      <div>
        <p className="text-md color-secondary">{t('PROPOSAL_EXECUTION_PERIOD')}</p>
        <p
          className="text-lg break-word"
          title={t('NUMBER_SECONDS', { number: situationsParams.proposalExecutionPeriod })}
        >
          {formatDuration(situationsParams.proposalExecutionPeriod)}
        </p>
      </div>

      <div>
        <p className="text-md color-secondary">{t('REQUIRED_QUORUM')}</p>
        <p className="text-lg break-word">
          {formatPercent(situationsParams.requiredQuorum, 2)}
        </p>
      </div>
      <div>
        <p className="text-md color-secondary">{t('REQUIRED_MAJORITY')}</p>
        <p className="text-lg break-word">
          {formatPercent(situationsParams.requiredMajority, 2)}
        </p>
      </div>
      <div>
        <p className="text-md color-secondary">{t('REQUIRED_VETO_QUORUM')}</p>
        <p className="text-lg break-word">
          {formatPercent(situationsParams.requiredVetoQuorum, 2)}
        </p>
      </div>

      <div>
        <p className="text-md color-secondary">{t('VOTING_TYPE')}</p>
        <p className="text-lg break-word">
          {t(VOTING_TYPE_TRANSLATION_KEY_MAP[Number(situationsParams.votingType) as VotingType]) }
        </p>
      </div>

      <div>
        <p className="text-md color-secondary">{t('VOTING_TARGET')}</p>
        <p className="text-lg break-word">
          {situationsParams.votingTarget}
        </p>
      </div>

      {(tokenInfo?.type === 'native' || tokenInfo?.type === 'erc20') && (
        <div>
          <p className="text-md color-secondary">{t('VOTING_MIN_AMOUNT')}</p>
          <p className="text-lg break-word">
            {formatAsset(situationsParams.votingMinAmount, tokenInfo.symbol)}
          </p>
        </div>
      )}

      {canDAOSupportSituationExternalLinks && (
        <div>
          <p className="text-md color-secondary">{t('EXTERNAL_LINK')}</p>
          <p className="text-lg break-word">
            {situationsParams.externalLink || '-'}
          </p>
        </div>
      )}
    </>
  );
}

export default CreateVotingSituationViewer;
