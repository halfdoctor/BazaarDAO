import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setEpdrMember, setEpdrMembers, setEpdrMembersError, setEpqfiMember, setEpqfiMembers, setEpqfiMembersError, setEprsMember, setEprsMembers, setEprsMembersError } from './reducer';

import { getUserAddress, useAppSelector } from 'store';

import {
  getEpdrMembershipInstance,
  getEpqfiMembershipInstance,
  getEprsMembershipInstance
} from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

export function useExperts () {
  const dispatch = useDispatch();

  const isEpqfiMember = useAppSelector(({ experts }) => experts.isEpqfiMember);
  const isEpdrMember = useAppSelector(({ experts }) => experts.isEpdrMember);
  const isEprsMember = useAppSelector(({ experts }) => experts.isEprsMember);

  const epqfiMembers = useAppSelector(({ experts }) => experts.epqfiMembers);
  const epqfiMembersLoading = useAppSelector(({ experts }) => experts.epqfiMembersLoading);
  const epqfiMembersError = useAppSelector(({ experts }) => experts.epqfiMembersError);

  const epdrMembers = useAppSelector(({ experts }) => experts.epdrMembers);
  const epdrMembersLoading = useAppSelector(({ experts }) => experts.epdrMembersLoading);
  const epdrMembersError = useAppSelector(({ experts }) => experts.epdrMembersError);

  const eprsMembers = useAppSelector(({ experts }) => experts.eprsMembers);
  const eprsMembersLoading = useAppSelector(({ experts }) => experts.eprsMembersLoading);
  const eprsMembersError = useAppSelector(({ experts }) => experts.eprsMembersError);

  async function checkEpdrMembership () {
    try {
      const contract = await getEpdrMembershipInstance();
      const isMember = await contract.isMember(getUserAddress());
      dispatch(setEpdrMember(isMember));
    } catch (error) {
      captureError(error);
    }
  }

  async function checkEpqfiMembership () {
    try {
      const contract = await getEpqfiMembershipInstance();
      const isMember = await contract.isMember(getUserAddress());
      dispatch(setEpqfiMember(isMember));
    } catch (error) {
      captureError(error);
    }
  }

  async function checkEprsMembership () {
    try {
      const contract = await getEprsMembershipInstance();
      const isMember = await contract.isMember(getUserAddress());
      dispatch(setEprsMember(isMember));
    } catch (error) {
      captureError(error);
    }
  }

  async function getEprsMembers () {
    try {
      const contract = await getEprsMembershipInstance();
      const members = await contract.getMembers();
      dispatch(setEprsMembers(members));
    } catch (error) {
      captureError(error);
      dispatch(setEprsMembersError(error));
    }
  }

  async function getEpdrMembers () {
    try {
      const contract = await getEpdrMembershipInstance();
      const members = await contract.getMembers();
      dispatch(setEpdrMembers(members));
    } catch (error) {
      captureError(error);
      dispatch(setEpdrMembersError(error));
    }
  }

  async function getEpqfiMembers () {
    try {
      const contract = await getEpqfiMembershipInstance();
      const members = await contract.getMembers();
      dispatch(setEpqfiMembers(members));
    } catch (error) {
      captureError(error);
      dispatch(setEpqfiMembersError(error));
    }
  }

  return {
    isEpdrMember,
    isEpqfiMember,
    isEprsMember,

    epqfiMembers,
    epqfiMembersLoading,
    epqfiMembersError,

    epdrMembers,
    epdrMembersLoading,
    epdrMembersError,

    eprsMembers,
    eprsMembersLoading,
    eprsMembersError,

    checkEpdrMembership: useCallback(checkEpdrMembership, []),
    checkEpqfiMembership: useCallback(checkEpqfiMembership, []),
    checkEprsMembership: useCallback(checkEprsMembership, []),

    getEprsMembers: useCallback(getEprsMembers, []),
    getEpdrMembers: useCallback(getEpdrMembers, []),
    getEpqfiMembers: useCallback(getEpqfiMembers, [])
  };
}
