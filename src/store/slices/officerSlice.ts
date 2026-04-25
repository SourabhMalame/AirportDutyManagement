import {createSlice} from '@reduxjs/toolkit';

const officerSlice = createSlice({
  name: 'officers',
  initialState: {
    list: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    fetchOfficersStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchOfficersSuccess(state, action) {
      state.isLoading = false;
      state.list = action.payload;
    },
    fetchOfficersFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    addOfficer(state, action) {
      state.list.push(action.payload);
    },
    updateOfficer(state, action) {
      const idx = state.list.findIndex(o => o.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    removeOfficer(state, action) {
      state.list = state.list.filter(o => o.id !== action.payload);
    },
  },
});

export const {
  fetchOfficersStart, fetchOfficersSuccess, fetchOfficersFailure,
  addOfficer, updateOfficer, removeOfficer,
} = officerSlice.actions;
export default officerSlice.reducer;
