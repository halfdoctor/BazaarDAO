import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Form, useForm } from '@q-dev/form-hooks';
import { ParameterType } from '@q-dev/q-js-sdk';
import { RadioGroup, Select, Tip } from '@q-dev/q-ui-kit';
import { FormParameter } from 'typings/forms';

import Input from 'components/Input';

import { ParameterFormContainer } from './styles';

import { getParameterKeysByType, getParameterValueByKey } from 'contracts/helpers/parameters-helper';

import { parameterType, required } from 'utils/validators';

interface Props {
  contract: string;
  disabled?: boolean;
  onChange: (form: Form<FormParameter>) => void;
}

function ParameterForm ({
  contract,
  disabled = false,
  onChange
}: Props) {
  const { t } = useTranslation();

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

  const [currentValue, setCurrentValue] = useState('');
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    onChange(form);
  }, [form.values, onChange]);

  useEffect(() => {
    getParameterKeysByType(contract, form.values.type as ParameterType)
      .then(setKeys);

    return () => {
      setKeys([]);
    };
  }, [contract, form.values.type]);

  useEffect(() => {
    if (!keys.includes(String(form.values.key))) {
      setCurrentValue('');
      form.fields.isNew.onChange(true);
      return;
    }

    getParameterValueByKey(
      contract,
      form.values.type as ParameterType,
      form.values.key as string
    ).then(setCurrentValue);
    form.fields.isNew.onChange(false);

    return () => {
      setCurrentValue('');
    };
  }, [form.values.key, keys]);

  return (
    <ParameterFormContainer>
      <Select
        {...form.fields.key}
        combobox
        label={t('PARAMETER_KEY')}
        placeholder={t('KEY')}
        options={keys.map((key) => ({ label: key, value: key }))}
        disabled={disabled}
      />

      <RadioGroup
        {...form.fields.type}
        label={t('PARAMETER_TYPE')}
        name="parameter-type"
        disabled={disabled}
        options={[
          { value: ParameterType.ADDRESS, label: t('ADDRESS') },
          { value: ParameterType.BOOL, label: t('BOOLEAN') },
          { value: ParameterType.STRING, label: t('STRING') },
          { value: ParameterType.UINT, label: t('UINT') },
        ]}
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
