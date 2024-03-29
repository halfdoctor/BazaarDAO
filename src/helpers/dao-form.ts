import { JsonFragment } from '@ethersproject/abi';
import { DecodedData } from '@q-dev/gdk-sdk';

import { formatJsonAbi } from 'contracts/helpers/interface-helper';

import {
  address,
  addressList,
  booleanList,
  booleanString,
  bytes,
  bytes32,
  bytes32List,
  bytesList,
  integer,
  integerList,
  name,
  required,
  Validator
} from 'utils/validators';

interface InitialFields {
  fieldsInfo: {
    key: string;
    type: string;
    label: string;
    placeholder: string;
    isArrayType: boolean;
  }[];
  initialValues: Record<string, string>;
  validators: Record<string, Validator<string>[]>;
}

export function generateInitialFieldsByABI ({
  abiFunction,
  decodedCallData,
}: {
  abiFunction: string;
  decodedCallData?: DecodedData | null;
}): InitialFields {
  const abi: ReadonlyArray<JsonFragment> = JSON.parse(formatJsonAbi([abiFunction]));
  const funcInputs = abi?.[0]?.inputs || [];
  const isEqualFunction = abiFunction === decodedCallData?.abiFunction;

  return funcInputs.map(i => i).reduce((acc, item) => {
    if (!item?.name || !item?.type) return acc;

    acc.initialValues[item.name] = isEqualFunction
      ? Array.isArray(decodedCallData?.arguments?.[item.name])
        ? decodedCallData?.arguments?.[item.name]?.length === 1
          ? decodedCallData?.arguments?.[item.name]?.[0]?.toString() || ' '
          : decodedCallData?.arguments?.[item.name]?.join(',\n')
        : decodedCallData?.arguments?.[item.name]?.toString() || ''
      : '';

    acc.fieldsInfo.push({
      key: item.name,
      type: item.type,
      label: item.name,
      placeholder: item.type,
      isArrayType: item.type.includes('[]')
    });

    switch (item.type) {
      case 'string':
        acc.validators[item.name] = [
          required,
          ...(item.name === 'name_' ? [name] : [])
        ];
        break;
      case 'string[]':
        acc.validators[item.name] = [required];
        break;
      case 'address':
        acc.validators[item.name] = [required, address];
        break;
      case 'address[]':
        acc.validators[item.name] = [required, addressList];
        break;
      case 'bytes':
        acc.validators[item.name] = [required, bytes];
        break;
      case 'bytes[]':
        acc.validators[item.name] = [required, bytesList];
        break;
      case 'bytes32':
        acc.validators[item.name] = [required, bytes32];
        break;
      case 'bytes32[]':
        acc.validators[item.name] = [required, bytes32List];
        break;
      case 'uint256':
        acc.validators[item.name] = [required, integer];
        break;
      case 'uint256[]':
        acc.validators[item.name] = [required, integerList];
        break;
      case 'bool':
        acc.validators[item.name] = [required, booleanString];
        break;
      case 'bool[]':
        acc.validators[item.name] = [required, booleanList];
        break;
      default:
        acc.validators[item.name] = [];
        break;
    }

    return acc;
  }, {
    fieldsInfo: [],
    initialValues: {},
    validators: {}
  } as InitialFields);
}

export function parseFieldValueList (string: string) {
  return string.trim().split(/,\s*|;\s*|\s+/);
}
