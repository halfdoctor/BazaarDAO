import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { useForm } from '@q-dev/form-hooks';
import { RadioGroup, RadioOptions, Tip } from '@q-dev/q-ui-kit';

import { FormStep } from 'components/MultiStepForm';

import useProposalActionsInfo from 'hooks/useProposalActionsInfo';
import useProposalSteps from 'hooks/useProposalSteps';

import { useNewProposalForm } from '../NewProposalForm';

import { useDaoStore } from 'store/dao/hooks';
import { useProviderStore } from 'store/provider/hooks';

import { RoutePaths } from 'constants/routes';
import { required } from 'utils/validators';

function TypeStep ({ situations, panelName }: { situations: string[]; panelName: string }) {
  const { t } = useTranslation();
  const { composeDaoLink } = useDaoStore();
  const { currentProvider } = useProviderStore();
  const { goNext, onChange } = useNewProposalForm();
  const { proposalSteps } = useProposalSteps();
  const { checkIsUserCanCreateProposal } = useProposalActionsInfo();
  const [isUserHasVotingPower, setIsUserHasVotingPower] = useState(true);
  const [isUserMember, setIsUserMember] = useState(true);

  const form = useForm({
    initialValues: {
      type: '',
      panel: panelName
    },
    validators: {
      type: [required],
      panel: [required]
    },
    onChange,
    onSubmit: goNext,
  });

  const typeOptions: RadioOptions<string> = useMemo(() => {
    return situations.map(item => {
      return proposalSteps.find(el => el.value === item) || {
        value: item,
        label: item,
        tip: t('COMING_SOON'),
        disabled: true
      };
    });
  }, [situations]);

  const loadPermissions = async () => {
    if (!form.values.type) return;
    const userPermission = await checkIsUserCanCreateProposal(panelName, form.values.type);
    setIsUserHasVotingPower(userPermission.isUserHasVotingPower);
    setIsUserMember(userPermission.isUserMember);
  };

  useEffect(() => {
    loadPermissions();
  }, [form.values.type, panelName]);

  useEffect(() => {
    form.fields.type.onChange(situations[0]);
  }, [situations, panelName]);

  return (
    <FormStep
      disabled={!form.isValid || !isUserMember || !isUserHasVotingPower}
      onNext={form.submit}
    >
      {(!isUserHasVotingPower || !isUserMember) && currentProvider?.selectedAddress &&
        <Tip type="warning">
          {isUserHasVotingPower
            ? t('NEED_MEMBER_STATUS')
            : <Trans
              i18nKey="NEED_VOTING_POWER"
              components={{
                votingPowerLink: <NavLink
                  style={{ textDecoration: 'underline' }}
                  to={composeDaoLink(RoutePaths.votingPower)}
                />
              }}
            />
          }
        </Tip>}
      <RadioGroup
        {...form.fields.type}
        extended
        name="type"
        options={typeOptions}
      />
    </FormStep>
  );
}

export default TypeStep;
