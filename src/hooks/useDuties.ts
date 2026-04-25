import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {fetchDutiesStart, fetchDutiesSuccess, fetchDutiesFailure, updateDutyInList, addDutyToList, setSelectedDuty} from '../store/slices/dutySlice';
import {getDuties, getDutyById, createDuty, updateDutyStatus} from '../api/dutyApi';

export const useDuties = () => {
  const dispatch = useDispatch();
  const dutyState = useSelector(state => state.duties);

  const fetchDuties = async (filters = {}) => {
    dispatch(fetchDutiesStart());
    try {
      const res = await getDuties(filters);
      dispatch(fetchDutiesSuccess({duties: res.data.duties || res.data, total: res.data.total || 0}));
    } catch (err) {
      dispatch(fetchDutiesFailure(err?.message || 'Failed to fetch duties'));
    }
  };

  const fetchDuty = async id => {
    try {
      const res = await getDutyById(id);
      dispatch(setSelectedDuty(res.data));
      return res.data;
    } catch {
      Toast.show({type: 'error', text1: 'Error', text2: 'Failed to load duty details'});
    }
  };

  const addDuty = async data => {
    try {
      const res = await createDuty(data);
      dispatch(addDutyToList(res.data));
      Toast.show({type: 'success', text1: 'Duty Created', text2: 'Duty has been created successfully'});
      return res.data;
    } catch (err) {
      Toast.show({type: 'error', text1: 'Error', text2: err?.message || 'Failed to create duty'});
      return null;
    }
  };

  const changeStatus = async (id, status) => {
    try {
      const res = await updateDutyStatus(id, status);
      dispatch(updateDutyInList(res.data));
      Toast.show({type: 'success', text1: 'Status Updated', text2: `Duty marked as ${status.toLowerCase()}`});
      return res.data;
    } catch (err) {
      Toast.show({type: 'error', text1: 'Error', text2: err?.message || 'Failed to update status'});
      return null;
    }
  };

  return {...dutyState, fetchDuties, fetchDuty, addDuty, changeStatus};
};
