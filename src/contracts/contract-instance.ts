import { MasterDAORegistryInstance } from '@q-dev/gdk-sdk';
import QRC20 from '@q-dev/gdk-sdk/lib/abi/QRC20.json';
import { DAOInstance } from '@q-dev/gdk-sdk/lib/contracts/DAOInstance';
import { AbiItem } from 'web3-utils';

export let daoInstance: DAOInstance | null = null;
export let masterDaoRegistryInstance: MasterDAORegistryInstance | null = null;

export const getDaoInstance = (address: string) => {
  daoInstance = new DAOInstance(window.web3, address);
  return daoInstance;
};

export const getErc20Contract = (address: string) => {
  return new window.web3.eth.Contract(QRC20 as AbiItem[], address);
};

export const getMasterDaoRegistryInstance = (masterDaoFactoryAddress: string) => {
  if (!masterDaoRegistryInstance) {
    masterDaoRegistryInstance = new MasterDAORegistryInstance(window.web3, masterDaoFactoryAddress);
  }

  return masterDaoRegistryInstance;
};
