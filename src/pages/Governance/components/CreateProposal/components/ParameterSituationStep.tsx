import { useTranslation } from 'react-i18next';

import { useFormArray } from '@q-dev/form-hooks';
import { Icon } from '@q-dev/q-ui-kit';
import { FormParameter } from 'typings/forms';

import Button from 'components/Button';
import FormBlock from 'components/FormBlock';
import { FormStep } from 'components/MultiStepForm';
import ParameterForm from 'components/ParameterForm';

import { useCreateProposalForm } from '../CreateProposal';

import { CONTRACT_TYPES } from 'constants/contracts';

function ParameterSituation () {
  const { t } = useTranslation();
  const { goNext, goBack } = useCreateProposalForm();

  const formArray = useFormArray<FormParameter>({
    minCount: 1,
    maxCount: 10,
    onSubmit: (forms) => {
      goNext({ params: forms });
    },
  });

  return (
    <FormStep
      disabled={!formArray.isValid}
      onNext={formArray.submit}
      onBack={goBack}
    >
      {formArray.forms.map((form, i) => (
        <FormBlock
          key={form.id}
          title={t('PARAMETER_INDEX', { index: i + 1 })}
          icon={formArray.forms.length > 1 ? 'delete' : undefined}
          onAction={() => formArray.removeForm(form.id)}
        >
          <ParameterForm
            key={form.id}
            contract={CONTRACT_TYPES.constitution}
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
