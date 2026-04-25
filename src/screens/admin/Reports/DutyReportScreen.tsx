import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert} from 'react-native';
import Share from 'react-native-share';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {fetchReportStart, fetchDutyReportSuccess, fetchReportFailure} from '../../../store/slices/reportSlice';
import {getDutyReport} from '../../../api/reportApi';
import {fetchAirportsStart, fetchAirportsSuccess} from '../../../store/slices/airportSlice';
import {getAirports} from '../../../api/airportApi';
import ReportFilterBar from '../../../components/admin/ReportFilterBar';
import StatusBadge from '../../../components/common/StatusBadge';
import EmptyState from '../../../components/common/EmptyState';
import {colors} from '../../../theme/colors';
import {formatDate} from '../../../utils/dateUtils';
import {isIncentiveEligible} from '../../../utils/incentiveUtils';

const DutyReportScreen = () => {
  const dispatch = useDispatch();
  const {dutyReport, isLoading} = useSelector(state => state.reports);
  const airports = useSelector(state => state.airports.list);
  const [filters, setFilters] = useState({status: null, airportId: null});

  useEffect(() => {
    dispatch(fetchAirportsStart());
    getAirports()
      .then(res => dispatch(fetchAirportsSuccess(res.data)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      dispatch(fetchReportStart());
      try {
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.airportId) params.airportId = filters.airportId;
        const res = await getDutyReport(params);
        dispatch(fetchDutyReportSuccess(res.data.duties || []));
      } catch (e) {
        dispatch(fetchReportFailure(e?.message));
      }
    };
    load();
  }, [filters]);

  const handleExport = async () => {
    if (!dutyReport || dutyReport.length === 0) {
      Alert.alert('No Data', 'Nothing to export. Load some duties first.');
      return;
    }
    try {
      const headers = ['SR No', 'Subordinate', 'Date', 'Airport', 'Terminal', 'Flight No', 'From', 'To', 'Office Type', 'Status', 'Incentive'];
      const rows = dutyReport.map((d, i) => [
        d.srNo || i + 1,
        d.officerName || '',
        d.date || '',
        d.airportName || '',
        d.terminalName || '',
        d.flightNo || '',
        d.from || '',
        d.to || '',
        d.officeType || '',
        d.status || '',
        isIncentiveEligible(d.officeType) ? '500' : '0',
      ]);
      const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const base64 = btoa(unescape(encodeURIComponent(csv)));
      await Share.open({
        title: 'Duty Report',
        url: `data:text/csv;base64,${base64}`,
        filename: `duty_report_${new Date().toISOString().slice(0, 10)}.csv`,
        type: 'text/csv',
        failOnCancel: false,
      });
    } catch (e) {
      Alert.alert('Export Failed', e?.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Duty Report</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>
      <ReportFilterBar filters={filters} airports={airports} onChange={f => setFilters(prev => ({...prev, ...f}))} />
      <FlatList
        data={dutyReport}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({item, index}) => (
          <View style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
            <Text style={[styles.cell, {flex: 0.5}]}>{item.srNo || index + 1}</Text>
            <Text style={[styles.cell, {flex: 1.5}]}>{item.officerName}</Text>
            <Text style={[styles.cell, {flex: 1}]}>{formatDate(item.date, 'DD/MM')}</Text>
            <Text style={[styles.cell, {flex: 0.8}]}>{item.airportName || '—'}</Text>
            <StatusBadge status={item.status} small />
            {isIncentiveEligible(item.officeType) && <Text style={styles.incentive}>₹500</Text>}
          </View>
        )}
        ListHeaderComponent={
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.headerCell, {flex: 0.5}]}>#</Text>
            <Text style={[styles.headerCell, {flex: 1.5}]}>Subordinate</Text>
            <Text style={[styles.headerCell, {flex: 1}]}>Date</Text>
            <Text style={[styles.headerCell, {flex: 0.8}]}>Airport</Text>
            <Text style={[styles.headerCell, {flex: 1}]}>Status</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={() => setFilters({...filters})}
        ListEmptyComponent={<EmptyState icon="📊" title="No report data" subtitle="Adjust filters to view duties" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border},
  title: {fontSize: 20, fontWeight: '700', color: colors.text},
  exportBtn: {backgroundColor: colors.secondary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8},
  exportText: {color: colors.white, fontWeight: '600', fontSize: 13},
  list: {padding: 12},
  tableHeader: {backgroundColor: colors.primary},
  tableRow: {flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 6, marginBottom: 2},
  tableRowAlt: {backgroundColor: '#F9FAFB'},
  cell: {fontSize: 12, color: colors.text},
  headerCell: {fontSize: 11, fontWeight: '700', color: colors.white},
  incentive: {fontSize: 10, fontWeight: '700', color: '#92400E', backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4},
});

export default DutyReportScreen;
