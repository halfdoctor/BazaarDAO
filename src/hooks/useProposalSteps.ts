import { useTranslation } from 'react-i18next';

import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { RadioOptions } from '@q-dev/q-ui-kit';

function useProposalSteps () {
  const { t } = useTranslation();

  const proposalSteps: RadioOptions<string> = [
    {
      value: DefaultVotingSituations.Constitution,
      label: t('CONSTITUTION_UPDATE'),
      tip: t('CONSTITUTION_UPDATE_TIP')
    },
    {
      value: DefaultVotingSituations.General,
      label: t('GENERAL_Q_UPDATE'),
      tip: t('GENERAL_Q_UPDATE_TIP')
    },
    {
      value: DefaultVotingSituations.ConfigurationParameter,
      label: t('CONFIG_PARAMETER_VOTE'),
      tip: t('CONFIG_PARAMETER_VOTE_TIP')
    },
    {
      value: DefaultVotingSituations.RegularParameter,
      label: t('EXPERT_PARAMETER_VOTE'),
      tip: t('PARAMETER_VOTE_TIP')
    },
    {
      value: DefaultVotingSituations.Membership,
      label: t('MEMBERSHIP_VOTE'),
      tip: t('MEMBERSHIP_VOTE_TIP')
    },
    {
      value: DefaultVotingSituations.DAORegistry,
      label: t('DAO_REGISTRY_VOTE'),
      tip: t('DAO_REGISTRY_TIP')
    }
  ];

  return { proposalSteps };
}

export default useProposalSteps;
