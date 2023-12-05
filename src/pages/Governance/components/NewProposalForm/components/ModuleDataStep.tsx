import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm, useFormArray } from '@q-dev/form-hooks';
import { CallDataProposalForm, FormValidatesMap } from 'typings/forms';

import FormBlock from 'components/FormBlock';
import { FormStep } from 'components/MultiStepForm';
import Textarea from 'components/Textarea';

import { useNewProposalForm } from '../NewProposalForm';

import CallDataForm from './CallDataForm';

import { MAX_FIELD_LENGTH } from 'constants/fields';
import { required } from 'utils/validators';

interface Props {
  abi: string[];
}

function ModuleDataStep ({ abi }: Props) {
  const { t } = useTranslation();
  const { goNext, goBack, onChange } = useNewProposalForm();
  const formValidatesMap = useRef<FormValidatesMap>({});

  const baseForm = useForm({
    initialValues: {
      remark: ''
    },
    validators: {
      remark: [required],
    },
    onSubmit: (form) => {
      onChange(form);
    },
  });

  const formArray = useFormArray<CallDataProposalForm>({
    minCount: 1,
    maxCount: 1,
    onSubmit: (forms) => {
      onChange({ callData: forms.map(i => i.callData) });
    },
  });

  const handleSubmit = () => {
    const isChildFieldsValid = Object.values(formValidatesMap.current)
      .map(validate => validate())
      .every(i => i);
    const isBaseFormsValid = baseForm.validate();
    const isFormArrayValid = formArray.validate();
    if (!isChildFieldsValid || !isBaseFormsValid || !isFormArrayValid) return;
    formArray.submit();
    baseForm.submit();
    goNext();
  };

  return (
    <FormStep
      onNext={handleSubmit}
      onBack={goBack}
    >
      <Textarea
        {...baseForm.fields.remark}
        label={t('DESCRIPTION')}
        labelTooltip={t('PROPOSAL_DESCRIPTION_TOOLTIP')}
        placeholder={t('DESCRIPTION')}
        maxLength={MAX_FIELD_LENGTH.proposalRemark}
      />

      {formArray.forms.map((form) => (
        <FormBlock key={form.id}>
          <CallDataForm
            key={form.id}
            abi={abi}
            formValidatesMap={formValidatesMap}
            formId={form.id}
            onChange={form.onChange}
          />
        </FormBlock>
      ))}
    </FormStep>
  );
}

export default ModuleDataStep;
