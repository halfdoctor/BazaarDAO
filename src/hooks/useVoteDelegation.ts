import { useTranslation } from 'react-i18next';

import { trimString } from '@q-dev/utils';

import { useQVault } from 'store/q-vault/hooks';
import { useUser } from 'store/user/hooks';

import { ZERO_ADDRESS } from 'constants/boundaries';

function useVoteDelegation () {
  const { t } = useTranslation();
  const { delegationInfo } = useQVault();
  const { address } = useUser();

  const agent = delegationInfo.votingAgent;

  if (!agent) return '...';

  if (agent !== address && agent !== ZERO_ADDRESS) {
    return `${t('YOUR_VOTING_AGENT_IS')} ${trimString(agent)}`;
  }

  if (agent === address) {
    return t('YOU_VOTE_FOR_YOURSELF');
  }

  return t('YOU_CURRENTLY_HAVE_NO_VOTING_WEIGHT_RIGHTS');
}

export default useVoteDelegation;
