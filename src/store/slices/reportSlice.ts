import {createSlice} from '@reduxjs/toolkit';

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    dutyReport: [],
    subordinateReport: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    fetchReportStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchDutyReportSuccess(state, action) {
      state.isLoading = false;
      state.dutyReport = action.payload;
    },
    fetchSubordinateReportSuccess(state, action) {
      state.isLoading = false;
      state.subordinateReport = action.payload;
    },
    fetchReportFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchReportStart, fetchDutyReportSuccess, fetchSubordinateReportSuccess, fetchReportFailure,
} = reportSlice.actions;
export default reportSlice.reducer;
