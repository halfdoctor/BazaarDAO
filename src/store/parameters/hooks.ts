import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ParameterType } from '@q-dev/q-js-sdk/lib/contracts/BaseParametersInstance';
import { ParametersInstance } from 'typings/contracts';

import { setConstitutionParameters, setConstitutionParametersError, setContractRegistry, setContractRegistryError, setEpdrParameters, setEpqfiParameters, setEpqfiParametersError, setEprsParameters, setEprsParametersError } from './reducer';

import { useAppSelector } from 'store';

import {
  getConstitutionInstance,
  getContractRegistryInstance,
  getEpdrParametersInstance,
  getEpqfiParametersInstance,
  getEprsParametersInstance
} from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

async function getParameters (contract: ParametersInstance) {
  const PARAMETER_TYPES: ParameterType[] = ['Uint', 'String', 'Bool', 'Addr', 'Bytes32'];

  const rawParams = await Promise.all(PARAMETER_TYPES.map(async type => {
    const parameters = await contract.getParameters(type);
    return parameters.map(param => ({ ...param, type }));
  }));

  return rawParams.flat();
}

export function useParameters () {
  const dispatch = useDispatch();

  const contractRegistry = useAppSelector(({ parameters }) => parameters.contractRegistry);
  const contractRegistryLoading = useAppSelector(({ parameters }) => parameters.contractRegistryLoading);
  const contractRegistryError = useAppSelector(({ parameters }) => parameters.contractRegistryError);

  const constitutionParameters = useAppSelector(({ parameters }) => parameters.constitutionParameters);
  const constitutionParametersLoading = useAppSelector(({ parameters }) => parameters.constitutionParametersLoading);
  const constitutionParametersError = useAppSelector(({ parameters }) => parameters.constitutionParametersError);

  const epqfiParameters = useAppSelector(({ parameters }) => parameters.epqfiParameters);
  const epqfiParametersLoading = useAppSelector(({ parameters }) => parameters.epqfiParametersLoading);
  const epqfiParametersError = useAppSelector(({ parameters }) => parameters.epqfiParametersError);

  const epdrParameters = useAppSelector(({ parameters }) => parameters.epdrParameters);
  const epdrParametersLoading = useAppSelector(({ parameters }) => parameters.epdrParametersLoading);
  const epdrParametersError = useAppSelector(({ parameters }) => parameters.epdrParametersError);

  const eprsParameters = useAppSelector(({ parameters }) => parameters.eprsParameters);
  const eprsParametersLoading = useAppSelector(({ parameters }) => parameters.eprsParametersLoading);
  const eprsParametersError = useAppSelector(({ parameters }) => parameters.eprsParametersError);

  async function getContractRegistry () {
    try {
      const contractRegistryInstance = getContractRegistryInstance();
      const data = await contractRegistryInstance.instance.methods.getContracts().call();
      dispatch(setContractRegistry(data.map(([key, value]) => ({ key, value, type: 'Addr' }))));
    } catch (error) {
      captureError(error);
      dispatch(setContractRegistryError('There was an error while loading Contract Registry data'));
    }
  }

  async function getConstitutionParameters () {
    try {
      const contract = await getConstitutionInstance();
      const parameters = await getParameters(contract);
      dispatch(setConstitutionParameters(parameters));
    } catch (error) {
      captureError(error);
      dispatch(setConstitutionParametersError('There was an error while loading Constitution Parameters data'));
    }
  }

  async function getEpqfiParameters () {
    try {
      const contract = await getEpqfiParametersInstance();
      const parameters = await getParameters(contract);
      dispatch(setEpqfiParameters(parameters));
    } catch (error) {
      captureError(error);
      dispatch(setEpqfiParametersError('There was an error while loading EPQFI Parameters data'));
    }
  }

  async function getEpdrParameters () {
    try {
      const contract = await getEpdrParametersInstance();
      const parameters = await getParameters(contract);
      dispatch(setEpdrParameters(parameters));
    } catch (error) {
      captureError(error);
      dispatch(setEprsParametersError('There was an error while loading EPDR Parameters data'));
    }
  }

  async function getEprsParameters () {
    try {
      const contract = await getEprsParametersInstance();
      const parameters = await getParameters(contract);
      dispatch(setEprsParameters(parameters));
    } catch (error) {
      captureError(error);
      dispatch(setEprsParametersError('There was an error while loading EPRS Parameters data'));
    }
  }

  return {
    contractRegistry,
    contractRegistryLoading,
    contractRegistryError,

    constitutionParameters,
    constitutionParametersLoading,
    constitutionParametersError,

    epqfiParameters,
    epqfiParametersLoading,
    epqfiParametersError,

    epdrParameters,
    epdrParametersLoading,
    epdrParametersError,

    eprsParameters,
    eprsParametersLoading,
    eprsParametersError,

    getContractRegistry: useCallback(getContractRegistry, []),
    getConstitutionParameters: useCallback(getConstitutionParameters, []),
    getEpqfiParameters: useCallback(getEpqfiParameters, []),
    getEpdrParameters: useCallback(getEpdrParameters, []),
    getEprsParameters: useCallback(getEprsParameters, [])
  };
}
