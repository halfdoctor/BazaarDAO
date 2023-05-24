import { useTranslation } from 'react-i18next';

import { useForm, useFormArray } from '@q-dev/form-hooks';
import { Icon } from '@q-dev/q-ui-kit';
import { FormParameter, NewProposalForm, ParameterSituationType } from 'typings/forms';

import Button from 'components/Button';
import FormBlock from 'components/FormBlock';
import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';
import ParameterForm from 'components/ParameterForm';

import { useNewProposalForm } from '../NewProposalForm';

import { required, url } from 'utils/validators';

interface Props {
  panelName: string;
  situation?: ParameterSituationType;
}

function ParameterSituation ({ panelName, situation }: Props) {
  const { t } = useTranslation();
  const { goNext, goBack, onChange } = useNewProposalForm();

  const form = useForm({
    initialValues: {
      externalLink: '',
    },
    validators: {
      externalLink: [required, url],
    },
    onSubmit: (form) => {
      goNext(form as NewProposalForm);
    },
  });

  const formArray = useFormArray<FormParameter>({
    minCount: 1,
    maxCount: 10,
    onSubmit: (forms) => {
      onChange({ params: forms });
    },
  });

  const handleSubmit = () => {
    if (!form.validate() || !formArray.validate()) return;
    formArray.submit();
    form.submit();
  };

  return (
    <FormStep
      disabled={!form.isValid || !formArray.isValid}
      onNext={handleSubmit}
      onBack={goBack}
    >
      <Input
        {...form.fields.externalLink}
        label={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE')}
        placeholder={t('LINK')}
      />

      {formArray.forms.map((form, i) => (
        <FormBlock
          key={form.id}
          title={t('PARAMETER_INDEX', { index: i + 1 })}
          icon={formArray.forms.length > 1 ? 'delete' : undefined}
          onAction={() => formArray.removeForm(form.id)}
        >
          <ParameterForm
            key={form.id}
            situation={situation}
            panelName={panelName}
            onChange={form.onChange}
          />
        </FormBlock>
      ))}

      <Button
        look="ghost"
        onClick={formArray.appendForm}
      >
        <Icon name="add" />
        <span>{t('ADD_PARAMETER')}</span>
      </Button>
    </FormStep>
  );
}

export default ParameterSituation;
