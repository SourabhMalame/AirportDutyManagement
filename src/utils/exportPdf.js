import { Alert, Linking } from 'react-native';
import { store } from '../store';

const BASE_URL = 'http://localhost:5000/api/v1';

const buildPdfUrl = (path, filters = {}) => {
  const token = store.getState().auth.token;
  const params = new URLSearchParams({ token });
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
  return `${BASE_URL}${path}?${params.toString()}`;
};

export const exportDutyReportPDF = async (duties, filters = {}) => {
  if (!duties || duties.length === 0) {
    Alert.alert('No Data', 'Nothing to export. Load some duties first.');
    return;
  }
  try {
    const url = buildPdfUrl('/reports/duties/pdf', {
      status: filters.status,
      airportId: filters.airportId,
      officerId: filters.officerId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert('Export Failed', e?.message || 'Could not open PDF');
  }
};

export const exportSubordinateReportPDF = async (subordinates, filters = {}) => {
  if (!subordinates || subordinates.length === 0) {
    Alert.alert('No Data', 'Nothing to export.');
    return;
  }
  try {
    const url = buildPdfUrl('/reports/subordinates/pdf', {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert('Export Failed', e?.message || 'Could not open PDF');
  }
};
