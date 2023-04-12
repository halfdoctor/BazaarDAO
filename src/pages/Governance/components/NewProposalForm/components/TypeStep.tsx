import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { RadioGroup, RadioOptions } from '@q-dev/q-ui-kit';

import { FormStep } from 'components/MultiStepForm';

import useProposalActionsInfo from 'hooks/useProposalActionsInfo';
import useProposalSteps from 'hooks/useProposalSteps';

import { useNewProposalForm } from '../NewProposalForm';

import { required } from 'utils/validators';

function TypeStep ({ situations, panelName }: { situations: string[]; panelName: string }) {
  const { t } = useTranslation();
  const { goNext, onChange } = useNewProposalForm();
  const { proposalSteps } = useProposalSteps();
  const { checkIsUserCanCreateProposal } = useProposalActionsInfo();
  const [isUserCanCreateProposal, setIsUserCanCreateProposal] = useState(false);

  const form = useForm({
    initialValues: {
      type: DefaultVotingSituations.GeneralSituation as string,
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

  const loadData = async () => {
    setIsUserCanCreateProposal(await checkIsUserCanCreateProposal(panelName, form.values.type));
  };

  useEffect(() => {
    loadData();
  }, [form.values.type, situations, panelName]);

  return (
    <FormStep
      disabled={!form.isValid || !isUserCanCreateProposal}
      onNext={form.submit}
    >
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
