import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Form, useForm } from '@q-dev/form-hooks';
import { filterParameter, ParameterType } from '@q-dev/gdk-sdk';
import { RadioGroup, Select, Tip } from '@q-dev/q-ui-kit';
import { FormParameter, ParameterSituationType } from 'typings/forms';
import { ParameterValue } from 'typings/parameters';

import Input from 'components/Input';

import { ParameterFormContainer } from './styles';

import { getParameters } from 'contracts/helpers/parameters-helper';

import { parameterType, required } from 'utils/validators';

interface Props {
  panelName: string;
  situation?: ParameterSituationType;
  disabled?: boolean;
  onChange: (form: Form<FormParameter>) => void;
}

function ParameterForm ({
  panelName,
  situation,
  disabled = false,
  onChange
}: Props) {
  const { t } = useTranslation();
  const [currentValue, setCurrentValue] = useState('');
  const [keys, setKeys] = useState<ParameterValue[]>([]);

  const form = useForm({
    initialValues: {
      key: '',
      value: '',
      type: ParameterType.ADDRESS,
      isNew: false,
    },
    validators: {
      type: [required],
      key: [required],
      value: [required, parameterType(form => (form as FormParameter).type)],
      isNew: []
    },
  });

  useEffect(() => {
    onChange(form);
  }, [form.values, onChange]);

  useEffect(() => {
    form.values.key = '';
    getParameters(panelName, situation, form.values.type as ParameterType)
      .then(setKeys);

    return () => {
      setKeys([]);
    };
  }, [panelName, form.values.type]);

  useEffect(() => {
    if (!keys.find(item => item.name === form.values.key)) {
      setCurrentValue('');
      form.fields.isNew.onChange(true);
      return;
    }

    const parameters = filterParameter(keys, form.values.type as ParameterType, form.values.key.toString());
    if (!parameters.length) return;
    setCurrentValue(parameters[0].normalValue);
    form.fields.isNew.onChange(false);

    return () => {
      setCurrentValue('');
    };
  }, [form.values.key, keys]);

  return (
    <ParameterFormContainer>
      <RadioGroup
        {...form.fields.type}
        label={t('PARAMETER_TYPE')}
        name="parameter-type"
        disabled={disabled}
        options={[
          { value: ParameterType.ADDRESS, label: t('ADDRESS') },
          { value: ParameterType.UINT256, label: t('UINT') },
          { value: ParameterType.STRING, label: t('STRING') },
          { value: ParameterType.BYTES, label: t('BYTES') },
          { value: ParameterType.BOOL, label: t('BOOLEAN') },
        ]}
      />

      <Select
        {...form.fields.key}
        combobox
        label={t('PARAMETER_KEY')}
        placeholder={t('KEY')}
        options={keys.map((key) => ({ label: key.name, value: key.name }))}
        disabled={disabled}
      />

      {currentValue && (
        <Tip compact>
          <p className="break-word">
            {`${t('CURRENT_VALUE')}: ${currentValue}`}
          </p>
        </Tip>
      )}

      <Input
        {...form.fields.value}
        label={t('PARAMETER_VALUE')}
        placeholder={t('VALUE')}
        disabled={disabled}
      />
    </ParameterFormContainer>
  );
}

export default ParameterForm;
