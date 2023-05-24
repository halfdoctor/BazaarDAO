import { useTranslation } from 'react-i18next';

import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { RadioOptions } from '@q-dev/q-ui-kit';

function useProposalSteps () {
  const { t } = useTranslation();

  const proposalSteps: RadioOptions<string> = [
    {
      value: DefaultVotingSituations.ConstitutionSituation,
      label: t('CONSTITUTION_UPDATE'),
      tip: t('CONSTITUTION_UPDATE_TIP')
    },
    {
      value: DefaultVotingSituations.GeneralSituation,
      label: t('GENERAL_Q_UPDATE'),
      tip: t('GENERAL_Q_UPDATE_TIP')
    },
    {
      value: DefaultVotingSituations.ConfigurationParameterSituation,
      label: t('CONFIG_PARAMETER_VOTE'),
      tip: t('PARAMETER_VOTE_TIP')
    },
    {
      value: DefaultVotingSituations.RegularParameterSituation,
      label: t('REGULAR_PARAMETER_VOTE'),
      tip: t('PARAMETER_VOTE_TIP')
    },
    {
      value: DefaultVotingSituations.MembershipSituation,
      label: t('MEMBERSHIP_VOTE'),
      tip: t('MEMBERSHIP_VOTE_TIP')
    }
  ];

  return { proposalSteps };
}

export default useProposalSteps;
