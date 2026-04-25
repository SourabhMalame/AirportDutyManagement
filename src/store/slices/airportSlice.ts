import {createSlice} from '@reduxjs/toolkit';

const airportSlice = createSlice({
  name: 'airports',
  initialState: {
    list: [],
    terminals: [],   // terminals for currently selected airport
    isLoading: false,
    error: null,
  },
  reducers: {
    fetchAirportsStart(state) { state.isLoading = true; state.error = null; },
    fetchAirportsSuccess(state, action) { state.isLoading = false; state.list = action.payload; },
    fetchAirportsFailure(state, action) { state.isLoading = false; state.error = action.payload; },
    setTerminals(state, action) { state.terminals = action.payload; },
    addAirport(state, action) { state.list.push(action.payload); },
    updateAirport(state, action) {
      const idx = state.list.findIndex(a => a.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    addTerminal(state, action) { state.terminals.push(action.payload); },
    updateTerminal(state, action) {
      const idx = state.terminals.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.terminals[idx] = action.payload;
    },
  },
});

export const {
  fetchAirportsStart, fetchAirportsSuccess, fetchAirportsFailure,
  setTerminals, addAirport, updateAirport, addTerminal, updateTerminal,
} = airportSlice.actions;
export default airportSlice.reducer;
