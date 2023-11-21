import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm, useFormArray } from '@q-dev/form-hooks';
import { RadioGroup, RadioOptions } from '@q-dev/q-ui-kit';
import { DeleteVotingSituationForm, GeneralSituationType, VotingSituationForm } from 'typings/forms';
import { VotingSituation } from 'typings/proposals';

import { FormStep } from 'components/MultiStepForm';

import { useNewProposalForm } from '../NewProposalForm';

import CreateVotingSituationForm from './CreateVotingSituationForm';
import RemoveVotingSituationForm from './RemoveVotingSituationForm';

import { GENERAL_SITUATION_TYPE_TRANSLATION_KEY_MAP } from 'constants/proposal';
import { required } from 'utils/validators';

interface Props {
  panelSituations: VotingSituation[];
}

function GeneralSituationStep ({ panelSituations }: Props) {
  const { t } = useTranslation();
  const { goNext, goBack } = useNewProposalForm();

  const [isValidContract, setIsValidContract] = useState(false);
  const [isValidateContractLoading, setIsValidateContractLoading] = useState(false);

  const externalPanelSituations = panelSituations
    .filter(({ isExternal }) => isExternal);

  const newVotingSituationForm = useFormArray<VotingSituationForm>({ maxCount: 1 });
  const removeVotingSituationForm = useFormArray<DeleteVotingSituationForm>({ maxCount: 1 });
  const form = useForm({
    initialValues: {
      generalSituationType: 'raise-topic' as GeneralSituationType,
    },
    validators: {
      generalSituationType: [required],
    },
    onSubmit: (form) => {
      goNext({
        generalSituationType: form.generalSituationType,
        ...(form.generalSituationType === 'create-voting'
          ? { newVotingSituation: newVotingSituationForm.forms[0]?.values || null }
          : {}
        ),
        ...(form.generalSituationType === 'remove-voting'
          ? { situationNameForRemoval: removeVotingSituationForm.forms[0]?.values.situationNameForRemoval || '' }
          : {}
        )
      });
    },
  });

  const isCreateVotingType = form.values.generalSituationType === 'create-voting';
  const isRemoveVotingType = form.values.generalSituationType === 'remove-voting';

  const handleSubmit = () => {
    if ((isRemoveVotingType && !removeVotingSituationForm.validate()) ||
      (isCreateVotingType && (!newVotingSituationForm.validate() || !isValidContract || isValidateContractLoading))
    ) return;

    form.submit();
  };

  useEffect(() => {
    newVotingSituationForm.reset(isCreateVotingType ? 1 : 0);
  }, [isCreateVotingType]);

  useEffect(() => {
    removeVotingSituationForm.reset(isRemoveVotingType ? 1 : 0);
  }, [isRemoveVotingType]);

  const isFormDisabled = !form.isValid ||
    (isCreateVotingType && (!newVotingSituationForm.isValid || !isValidContract || isValidateContractLoading));

  const panelTypeOptions: RadioOptions<GeneralSituationType> =
    Object.entries(GENERAL_SITUATION_TYPE_TRANSLATION_KEY_MAP)
      .map(([key, val]) => ({
        value: key as GeneralSituationType,
        label: t(val),
        disabled: key === 'remove-voting' && !externalPanelSituations.length
      }));

  return (
    <FormStep
      disabled={isFormDisabled}
      onNext={handleSubmit}
      onBack={goBack}
    >
      <RadioGroup
        {...form.fields.generalSituationType}
        name="param-panel-type"
        options={panelTypeOptions}
      />
      {form.values.generalSituationType === 'create-voting' && (
        newVotingSituationForm.forms.map((formItem) => (
          <CreateVotingSituationForm
            key={formItem.id}
            panelSituations={panelSituations}
            isValidContract={isValidContract}
            isValidateContractLoading={isValidateContractLoading}
            setIsValidContract={setIsValidContract}
            setIsValidateContractLoading={setIsValidateContractLoading}
            onChange={formItem.onChange}
          />
        ))
      )}
      {form.values.generalSituationType === 'remove-voting' && (
        removeVotingSituationForm.forms.map((formItem) => (
          <RemoveVotingSituationForm
            key={formItem.id}
            externalPanelSituations={externalPanelSituations}
            onChange={formItem.onChange}
          />
        ))
      )}
    </FormStep>
  );
}

export default GeneralSituationStep;
