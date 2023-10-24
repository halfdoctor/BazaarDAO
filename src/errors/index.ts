import { errors as w3pErrors } from '@distributedlab/w3p';

import * as runtimeErrors from './runtime.errors';

export const errors = {
  ...w3pErrors,
  ...runtimeErrors,
};
