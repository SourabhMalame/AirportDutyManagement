import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {STATUS_COLORS, STATUS_LABELS} from '../../constants/dutyStatus';

const StatusBadge = ({status, small = false}) => {
  const color = STATUS_COLORS[status] || '#9CA3AF';
  const label = STATUS_LABELS[status] || status;
  return (
    <View style={[styles.badge, {backgroundColor: color + '20', borderColor: color}, small && styles.small]}>
      <Text style={[styles.text, {color}, small && styles.smallText]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start'},
  small: {paddingHorizontal: 7, paddingVertical: 2},
  text: {fontSize: 12, fontWeight: '600'},
  smallText: {fontSize: 10},
});

export default StatusBadge;
