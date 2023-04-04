import { ParameterType } from '@q-dev/gdk-sdk';

export interface ParameterValue {
  name: string;
  value: string;
  normalValue: string;
  type: ParameterType;
}
