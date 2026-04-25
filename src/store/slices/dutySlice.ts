import {createSlice} from '@reduxjs/toolkit';

const dutySlice = createSlice({
  name: 'duties',
  initialState: {
    list: [],
    selectedDuty: null,
    isLoading: false,
    error: null,
    filters: {
      status: null,
      officerId: null,
      airport: null,
      dateFrom: null,
      dateTo: null,
    },
    pagination: {page: 1, total: 0, hasMore: true},
  },
  reducers: {
    fetchDutiesStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchDutiesSuccess(state, action) {
      state.isLoading = false;
      state.list = action.payload.duties;
      state.pagination.total = action.payload.total;
      state.pagination.hasMore = action.payload.hasMore ?? false;
    },
    fetchDutiesFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedDuty(state, action) {
      state.selectedDuty = action.payload;
    },
    setFilters(state, action) {
      state.filters = {...state.filters, ...action.payload};
    },
    clearFilters(state) {
      state.filters = {status: null, officerId: null, airport: null, dateFrom: null, dateTo: null};
    },
    updateDutyInList(state, action) {
      const idx = state.list.findIndex(d => d.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    addDutyToList(state, action) {
      state.list.unshift(action.payload);
    },
  },
});

export const {
  fetchDutiesStart, fetchDutiesSuccess, fetchDutiesFailure,
  setSelectedDuty, setFilters, clearFilters, updateDutyInList, addDutyToList,
} = dutySlice.actions;
export default dutySlice.reducer;
