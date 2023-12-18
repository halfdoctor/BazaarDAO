import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SupportedDaoNetwork } from 'typings/dao';

interface DAOState {
  daoAddress: string;
  supportedNetworks: SupportedDaoNetwork[];
  canDAOSupportExternalLinks: boolean;
  daoName: string;
};

const initialState: DAOState = {
  daoAddress: '',
  daoName: '',
  supportedNetworks: [],
  canDAOSupportExternalLinks: false,
};

const expertsSlice = createSlice({
  name: 'dao',
  initialState,
  reducers: {
    setDaoAddress: (state, { payload }: PayloadAction<string>) => {
      state.daoAddress = payload;
    },
    setDAOName: (state, { payload }: PayloadAction<string>) => {
      state.daoName = payload;
    },
    setSupportedNetworks: (state, { payload }: PayloadAction<SupportedDaoNetwork[]>) => {
      state.supportedNetworks = payload;
    },
    setCanDAOSupportExternalLinks: (state, { payload }: PayloadAction<boolean>) => {
      state.canDAOSupportExternalLinks = payload;
    },
  }
});

export const { setDaoAddress, setDAOName, setSupportedNetworks, setCanDAOSupportExternalLinks } = expertsSlice.actions;
export default expertsSlice.reducer;
