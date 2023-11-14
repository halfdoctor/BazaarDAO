import { memo, MutableRefObject, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { DecodedData, getEncodedDataByABI } from '@q-dev/gdk-sdk';
import { Select } from '@q-dev/q-ui-kit';
import { generateInitialFieldsByABI, parseFieldValueList } from 'helpers/dao-form';
import { FormValidatesMap } from 'typings/forms';

import Input from 'components/Input';
import Textarea from 'components/Textarea';

import { formatFunctionMinimalAbi } from 'contracts/helpers/interface-helper';

interface Props {
  abi: string[];
  formId: string;
  formValidatesMap: MutableRefObject<FormValidatesMap>;
  abiFunction: string;
  decodedCallData: DecodedData | null;
  setCallData: (value: string) => void;
}

function FunctionArgsForm ({
  abiFunction,
  formId,
  formValidatesMap,
  setCallData,
  decodedCallData,
  abi,
}: Props) {
  const { t } = useTranslation();
  const { initialValues, validators, fieldsInfo } = generateInitialFieldsByABI({
    abiFunction,
    decodedCallData
  });

  const name = useMemo(() => {
    return formatFunctionMinimalAbi([abiFunction])[0]?.replace('function ', '') || '';
  }, [abiFunction]);

  const form = useForm<string, string>({
    initialValues,
    validators
  });

  const fieldValues = useMemo(() => {
    return fieldsInfo.map(({ key, isArrayType, type }) =>
      isArrayType
        ? type === 'bool[]'
          ? parseFieldValueList(form.values[key]).map(i => i === 'true')
          : parseFieldValueList(form.values[key])
        : type === 'bool'
          ? form.values[key] === 'true'
          : form.values[key]
    );
  }, [form.values]);

  useEffect(() => {
    try {
      if (fieldsInfo.length && fieldsInfo.every(({ key }) => form.validateByKey(key, true))) {
        const callData = getEncodedDataByABI(abi, name, ...fieldValues);
        setCallData(callData);
      } else {
        setCallData('');
      }
    } catch (e) {
      setCallData('');
    }
  }, [...fieldValues, abi, abiFunction, name]);

  useEffect(() => {
    formValidatesMap.current[formId] = form.validate;

    return () => {
      delete formValidatesMap.current[formId];
    };
  }, [form.validate]);

  return (
    <>
      {fieldsInfo.map(({ key, label, placeholder, type, isArrayType }, index) => {
        if (type === 'bool') {
          return (
            <Select
              {...form.fields[key]}
              key={index + key}
              label={label}
              placeholder={placeholder}
              options={[
                { value: 'true', label: 'true' },
                { value: 'false', label: 'false' }
              ]}
            />
          );
        }

        return type === 'bytes' || isArrayType
          ? (
            <Textarea
              {...form.fields[key]}
              key={index + key}
              label={label}
              labelTooltip={isArrayType
                ? type === 'bool[]'
                  ? t('FIELD_TOOLTIP_FOR_BOOLEAN_LIST')
                  : t('FIELD_TOOLTIP_FOR_LIST')
                : ''
              }
              rows={5}
              placeholder={placeholder}
            />
          )
          : (
            <Input
              {...form.fields[key]}
              key={index + key}
              label={label}
              placeholder={placeholder}
            />
          );
      })}
    </>
  );
}

export default memo(FunctionArgsForm);
