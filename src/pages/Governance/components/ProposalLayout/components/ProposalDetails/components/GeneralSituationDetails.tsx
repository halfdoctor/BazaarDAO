import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DecodedData } from '@q-dev/gdk-sdk';
import { VotingSituationForm } from 'typings/forms';

import CreateVotingSituationViewer from 'components/CreateVotingSituationViewer';

import { useDaoTokenStore } from 'store/dao-token/hooks';

import { fromWeiWithDecimals } from 'utils/numbers';

interface Props {
  decodedCallData: DecodedData;
}

function GeneralSituationDetails ({ decodedCallData }: Props) {
  const { t } = useTranslation();
  const { tokenInfo } = useDaoTokenStore();

  const proposalType = useMemo(() => {
    switch (decodedCallData.functionName) {
      case 'removeVotingSituation':
        return t('REMOVE_VOTING_SITUATION');
      case 'createDAOVotingSituation':
      case 'createDAOVotingSituationWithLink':
        return t('CREATE_VOTING_SITUATION');
      default:
        return '';
    }
  }, [decodedCallData.functionName, t]);

  const createSituationsParams = useMemo<VotingSituationForm | null>(() => {
    if (decodedCallData.arguments.conf_ &&
      (decodedCallData.functionName === 'createDAOVotingSituationWithLink' ||
        decodedCallData.functionName === 'createDAOVotingSituation')
    ) {
      const initialSituation = decodedCallData.functionName === 'createDAOVotingSituationWithLink'
        ? decodedCallData.arguments.conf_.initialSituation
        : decodedCallData.arguments.conf_;

      const situationName = initialSituation.votingSituationName;
      const votingValues = initialSituation.votingValues;

      const votingMinAmount = tokenInfo?.type === 'native' || tokenInfo?.type === 'erc20'
        ? fromWeiWithDecimals(votingValues.votingMinAmount.toString(), tokenInfo.decimals)
        : '';

      return {
        situationName,
        vetoPeriod: votingValues.vetoPeriod.toString(),
        proposalExecutionPeriod: votingValues.proposalExecutionPeriod.toString(),
        requiredQuorum: fromWeiWithDecimals(votingValues.requiredQuorum.toString(), 25),
        requiredMajority: fromWeiWithDecimals(votingValues.requiredMajority.toString(), 25),
        requiredVetoQuorum: fromWeiWithDecimals(votingValues.requiredVetoQuorum.toString(), 25),
        votingType: votingValues.votingType.toString(),
        votingTarget: votingValues.votingTarget,
        votingMinAmount: votingMinAmount,
        externalLink: decodedCallData.arguments.conf_?.externalLink || '',
        votingPeriod: votingValues.votingPeriod.toString(),
      };
    }

    return null;
  }, [decodedCallData, t]);

  if (!proposalType) return null;

  return (
    <div>
      <h3 className="text-h3">{proposalType}</h3>

      <div className="block__content">
        <div className="details-list single-column">
          {decodedCallData.functionName === 'removeVotingSituation' && (
            <div>
              <p className="text-md color-secondary">{t('VOTING_SITUATION_NAME')}</p>
              <p className="text-lg break-word">
                {decodedCallData.arguments.situation_}
              </p>
            </div>
          )}
          {createSituationsParams && (
            <CreateVotingSituationViewer situationsParams={createSituationsParams}/>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeneralSituationDetails;
