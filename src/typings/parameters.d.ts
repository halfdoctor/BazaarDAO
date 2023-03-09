import { ParameterType } from '@q-dev/q-js-sdk/lib/contracts/BaseParametersInstance';

export interface ParameterValue {
  key: string;
  value: string;
  type: ParameterType;
  verifiedName?: string;
}
