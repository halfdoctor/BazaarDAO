import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setAddress, setChainId } from './reducer';

import { useAppSelector } from 'store';

export function useUser () {
  const dispatch = useDispatch();

  const address = useAppSelector(({ user }) => user.address);
  const chainId = useAppSelector(({ user }) => user.chainId);

  return {
    address,
    chainId,

    setAddress: useCallback((address: string) => dispatch(setAddress(address)), []),
    setChainId: useCallback((chainId: number) => dispatch(setChainId(chainId)), []),
  };
}
