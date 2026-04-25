import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {colors} from '../../theme/colors';
import {DUTY_STATUS} from '../../constants/dutyStatus';

const FilterChip = ({label, active, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const ReportFilterBar = ({filters, airports = [], onChange}) => (
  <View style={styles.container}>
    <Text style={styles.label}>Status</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      <FilterChip label="All" active={!filters.status} onPress={() => onChange({status: null})} />
      {Object.values(DUTY_STATUS).map(s => (
        <FilterChip key={s} label={s} active={filters.status === s} onPress={() => onChange({status: s})} />
      ))}
    </ScrollView>
    <Text style={styles.label}>Airport</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      <FilterChip label="All" active={!filters.airportId} onPress={() => onChange({airportId: null})} />
      {airports.filter(a => a.isActive).map(a => (
        <FilterChip
          key={a.id}
          label={`${a.name} (${a.code})`}
          active={filters.airportId === a.id}
          onPress={() => onChange({airportId: a.id})}
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border},
  label: {fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase'},
  row: {marginBottom: 10},
  chip: {paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginRight: 8, backgroundColor: colors.white},
  chipActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  chipText: {fontSize: 12, color: colors.textSecondary},
  chipTextActive: {color: colors.white, fontWeight: '600'},
});

export default ReportFilterBar;
