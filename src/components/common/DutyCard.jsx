import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors} from '../../theme/colors';
import {shadows} from '../../theme/spacing';
import StatusBadge from './StatusBadge';
import {formatDate, formatTime} from '../../utils/dateUtils';
import {isIncentiveEligible} from '../../utils/incentiveUtils';

const DutyCard = ({duty, onPress}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.row}>
      <View style={styles.flex}>
        <Text style={styles.srno}>SR #{duty.srNo || duty.id}</Text>
        <Text style={styles.officer}>{duty.officerName || duty.officer?.name}</Text>
      </View>
      <StatusBadge status={duty.status} />
    </View>
    <View style={styles.divider} />
    <View style={styles.infoRow}>
      <InfoItem label="Date" value={formatDate(duty.date)} />
      <InfoItem label="Airport" value={duty.airportName || duty.airport} />
      <InfoItem label="Terminal" value={duty.terminalName} />
    </View>
    <View style={styles.infoRow}>
      <InfoItem label="Flight" value={duty.flightNo} />
      <InfoItem label="From" value={duty.from} />
      <InfoItem label="To" value={duty.to} />
      <InfoItem label="Type" value={duty.officeType?.replace('_', ' ')} />
    </View>
    {isIncentiveEligible(duty.officeType) && (
      <View style={styles.incentiveBadge}>
        <Text style={styles.incentiveText}>₹500 Incentive</Text>
      </View>
    )}
  </TouchableOpacity>
);

const InfoItem = ({label, value}) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {backgroundColor: colors.white, borderRadius: 10, padding: 14, marginBottom: 10, ...shadows.sm},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  flex: {flex: 1, marginRight: 8},
  srno: {fontSize: 11, color: colors.textSecondary, marginBottom: 2},
  officer: {fontSize: 15, fontWeight: '600', color: colors.text},
  divider: {height: 1, backgroundColor: colors.border, marginVertical: 10},
  infoRow: {flexDirection: 'row', marginBottom: 6},
  infoItem: {flex: 1},
  infoLabel: {fontSize: 11, color: colors.textSecondary},
  infoValue: {fontSize: 13, fontWeight: '500', color: colors.text, marginTop: 1},
  incentiveBadge: {backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6},
  incentiveText: {fontSize: 11, fontWeight: '600', color: '#92400E'},
});

export default DutyCard;
