import { useTranslation } from 'react-i18next';

import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { RadioOptions } from '@q-dev/q-ui-kit';

function useProposalStep () {
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
      value: DefaultVotingSituations.ParameterSituation,
      label: t('PARAMETER_VOTE'),
      tip: t('PARAMETER_VOTE')
    },
    {
      value: DefaultVotingSituations.MembershipSituation,
      label: t('MEMBERSHIP_VOTE'),
      tip: t('MEMBERSHIP_VOTE')
    },
  ];

  return { proposalSteps };
}

export default useProposalStep;
