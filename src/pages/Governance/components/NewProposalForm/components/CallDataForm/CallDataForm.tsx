import { memo, MutableRefObject, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Form, useForm } from '@q-dev/form-hooks';
import { getDecodeDataByABI } from '@q-dev/gdk-sdk';
import { Select, Switch } from '@q-dev/q-ui-kit';
import styled from 'styled-components';
import { CallDataProposalForm, FormValidatesMap } from 'typings/forms';

import Textarea from 'components/Textarea';

import FunctionArgsForm from './FunctionArgsForm';

import { callData, required } from 'utils/validators';

interface Props {
  formId: string;
  formValidatesMap: MutableRefObject<FormValidatesMap>;
  abi: string[];
  onChange: (form: Form<CallDataProposalForm>) => void;
}

export const CallDataFormContainer = styled.div`
  display: grid;
  gap: 16px;
`;

function CallDataForm ({ onChange, formValidatesMap, formId, abi }: Props) {
  const { t } = useTranslation();
  const [isRawMode, setIsRawMode] = useState(false);

  const form = useForm({
    initialValues: {
      abiFunction: '',
      callData: '',
    },
    validators: {
      abiFunction: [required],
      callData: [required, callData(abi)],
    },
  });

  const abiFunctionOptions = useMemo(() => {
    return abi.map(func => ({
      label: func.match(/^function ([a-zA-Z0-9]*)/)?.[1] || func,
      value: func
    }));
  }, [abi]);

  const decodedCallData = useMemo(() => {
    try {
      if (!form.validateByKey('callData', true)) return null;
      const decodedData = getDecodeDataByABI(abi, form.values.callData);
      if (!decodedData) return null;

      return abiFunctionOptions.some(({ value }) => value === decodedData?.abiFunction)
        ? decodedData
        : null;
    } catch (e) {
      return null;
    }
  }, [form.values.callData, abiFunctionOptions, abi]);

  useEffect(() => {
    if (isRawMode) {
      if (decodedCallData) {
        form.fields.abiFunction.onChange(decodedCallData?.abiFunction || '');
      } else if (form.values.abiFunction) {
        form.fields.abiFunction.onChange('');
      }
    }
  }, [form.values.abiFunction, decodedCallData, isRawMode]);

  useEffect(() => {
    onChange(form);
  }, [form.values, onChange]);

  return (
    <CallDataFormContainer>
      <Switch
        value={isRawMode}
        label={t('RAW_MODE')}
        onChange={() => setIsRawMode(!isRawMode)}
      />

      {isRawMode
        ? (<Textarea
          {...form.fields.callData}
          label={t('CALL_DATA')}
          maxLength={10000}
        />)
        : (<>
          <Select
            {...form.fields.abiFunction}
            label={t('FUNCTION')}
            placeholder={t('FUNCTION')}
            options={abiFunctionOptions}
          />
          {form.fields.abiFunction.value !== '' && (
            <FunctionArgsForm
              key={form.values.abiFunction}
              formId={formId}
              formValidatesMap={formValidatesMap}
              abiFunction={form.values.abiFunction}
              setCallData={form.fields.callData.onChange}
              decodedCallData={decodedCallData}
              abi={abi}
            />
          )}
        </>)
      }
    </CallDataFormContainer>
  );
}

export default memo(CallDataForm);
