import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDuties} from '../../../hooks/useDuties';
import StatusBadge from '../../../components/common/StatusBadge';
import {STATUS_DESCRIPTIONS} from '../../../constants/dutyStatus';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import {colors} from '../../../theme/colors';
import {shadows} from '../../../theme/spacing';
import {formatDate, formatTime} from '../../../utils/dateUtils';
import {isIncentiveEligible} from '../../../utils/incentiveUtils';

const Row = ({label, value}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

const AdminDutyDetailScreen = () => {
  const navigation = useNavigation();
  const {params: {dutyId}} = useRoute();
  const {selectedDuty: duty, fetchDuty, isLoading} = useDuties();

  useEffect(() => {fetchDuty(dutyId);}, [dutyId]);

  if (!duty) return <LoadingOverlay visible={isLoading} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Duty Detail</Text>
        <View style={{width: 60}} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.srNo}>SR #{duty.srNo || duty.id}</Text>
              <Text style={styles.officerName}>{duty.officerName}</Text>
            </View>
            <StatusBadge status={duty.status} />
          </View>
          <Text style={styles.statusDesc}>{STATUS_DESCRIPTIONS[duty.status]}</Text>
          {isIncentiveEligible(duty.officeType) && (
            <View style={styles.incentiveBadge}><Text style={styles.incentiveText}>₹500 Incentive Eligible</Text></View>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duty Information</Text>
          <Row label="Date" value={formatDate(duty.date)} />
          <Row label="Day" value={duty.day} />
          <Row label="Office Type" value={duty.officeType?.replace('_', ' ')} />
          <Row label="Reporting Time" value={formatTime(duty.reportingTime)} />
          <Row label="Airport" value={duty.airport} />
          <Row label="Arrival/Departure" value={duty.arrivalDeparture} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flight Information</Text>
          <Row label="Flight No" value={duty.flightNo} />
          <Row label="Flight Time" value={formatTime(duty.flightTime)} />
          <Row label="From" value={duty.from} />
          <Row label="To" value={duty.to} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subordinate Details</Text>
          <Row label="Assigned Subordinate ID" value={duty.officerId} />
          <Row label="Name of Subordinate" value={duty.officerName} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border},
  back: {color: colors.primary, fontSize: 15},
  title: {fontSize: 18, fontWeight: '700', color: colors.text},
  content: {padding: 16},
  card: {backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, ...shadows.sm},
  topRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  srNo: {fontSize: 12, color: colors.textSecondary},
  officerName: {fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2},
  incentiveBadge: {backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 10},
  incentiveText: {fontSize: 12, fontWeight: '600', color: '#92400E'},
  statusDesc: {fontSize: 12, color: colors.textSecondary, marginTop: 8, lineHeight: 17},
  section: {backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, ...shadows.sm},
  sectionTitle: {fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 12},
  row: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider},
  rowLabel: {fontSize: 13, color: colors.textSecondary},
  rowValue: {fontSize: 13, fontWeight: '500', color: colors.text, maxWidth: '60%', textAlign: 'right'},
});

export default AdminDutyDetailScreen;
