import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ModalsState {
  reportModal: {
    isOpen: boolean;
    insightId: string | null;
  };
  repostModal: {
    isOpen: boolean;
    insightId: string | null;
  };
  editModal: {
    isOpen: boolean;
    insightId: string | null;
  };
}

const initialState: ModalsState = {
  reportModal: { isOpen: false, insightId: null },
  repostModal: { isOpen: false, insightId: null },
  editModal: { isOpen: false, insightId: null },
};

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    openReportModal: (state, action: PayloadAction<string>) => {
      state.reportModal.isOpen = true;
      state.reportModal.insightId = action.payload;
    },
    closeReportModal: (state) => {
      state.reportModal.isOpen = false;
      state.reportModal.insightId = null;
    },
    openRepostModal: (state, action: PayloadAction<string>) => {
      state.repostModal.isOpen = true;
      state.repostModal.insightId = action.payload;
    },
    closeRepostModal: (state) => {
      state.repostModal.isOpen = false;
      state.repostModal.insightId = null;
    },
    openEditModal: (state, action: PayloadAction<string>) => {
      state.editModal.isOpen = true;
      state.editModal.insightId = action.payload;
    },
    closeEditModal: (state) => {
      state.editModal.isOpen = false;
      state.editModal.insightId = null;
    },
  },
});

export const {
  openReportModal,
  closeReportModal,
  openRepostModal,
  closeRepostModal,
  openEditModal,
  closeEditModal,
} = modalsSlice.actions;

export default modalsSlice.reducer;
