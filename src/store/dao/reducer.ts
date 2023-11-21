import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SupportedDaoNetwork } from 'typings/dao';

interface DAOState {
  daoAddress: string;
  supportedNetworks: SupportedDaoNetwork[];
  canDAOSupportExternalLinks: boolean;
};

const initialState: DAOState = {
  daoAddress: '',
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
    setSupportedNetworks: (state, { payload }: PayloadAction<SupportedDaoNetwork[]>) => {
      state.supportedNetworks = payload;
    },
    setCanDAOSupportExternalLinks: (state, { payload }: PayloadAction<boolean>) => {
      state.canDAOSupportExternalLinks = payload;
    },
  }
});

export const { setDaoAddress, setSupportedNetworks, setCanDAOSupportExternalLinks } = expertsSlice.actions;
export default expertsSlice.reducer;
