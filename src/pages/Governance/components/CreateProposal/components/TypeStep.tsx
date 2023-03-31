import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { RadioGroup, RadioOptions } from '@q-dev/q-ui-kit';

import { FormStep } from 'components/MultiStepForm';

import useProposalStep from 'hooks/useProposalStep';

import { useCreateProposalForm } from '../CreateProposal';

import { required } from 'utils/validators';

function TypeStep ({ situations, panelName }: { situations: string[]; panelName: string }) {
  const { t } = useTranslation();
  const { goNext, onChange } = useCreateProposalForm();
  const { proposalSteps } = useProposalStep();

  const form = useForm({
    initialValues: {
      type: DefaultVotingSituations.GeneralSituation as string,
      currentPanelName: panelName
    },
    validators: {
      type: [required],
      currentPanelName: [required]
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

  return (
    <FormStep
      disabled={!form.isValid}
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
