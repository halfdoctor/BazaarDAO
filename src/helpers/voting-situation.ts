import axios from 'axios';
import { ErrorHandler } from 'helpers';
import { ExternalVotingSituationInfo } from 'typings/proposals';

import { formatFunctionAbi } from 'contracts/helpers/interface-helper';

const axiosInstance = axios.create();

export async function getExternalVotingSituationInfo (url: string): Promise<ExternalVotingSituationInfo | null> {
  if (!url) return null;
  try {
    const { data } = await axiosInstance.get(url);
    return {
      abi: formatFunctionAbi(data.abi),
      description: data.description || ''
    };
  } catch (e) {
    ErrorHandler.processWithoutFeedback(e);
    return null;
  }
}
