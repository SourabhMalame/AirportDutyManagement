import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import {colors} from '../../theme/colors';
import {shadows} from '../../theme/spacing';

const OfficerCard = ({officer, onEdit, onToggle}) => (
  <View style={styles.card}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{officer.name?.charAt(0)?.toUpperCase()}</Text>
    </View>
    <View style={styles.info}>
      <Text style={styles.name}>{officer.name}</Text>
      <Text style={styles.detail}>{officer.employeeId} • {officer.phone}</Text>
      <Text style={styles.email}>{officer.email}</Text>
    </View>
    <View style={styles.actions}>
      <Switch
        value={officer.isEnabled}
        onValueChange={val => onToggle && onToggle(officer.id, val)}
        trackColor={{false: colors.border, true: colors.success + '80'}}
        thumbColor={officer.isEnabled ? colors.success : colors.textDisabled}
      />
      <TouchableOpacity onPress={() => onEdit && onEdit(officer)} style={styles.editBtn}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {flexDirection: 'row', backgroundColor: colors.white, borderRadius: 10, padding: 12, marginBottom: 10, alignItems: 'center', ...shadows.sm},
  avatar: {width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12},
  avatarText: {color: colors.white, fontSize: 18, fontWeight: '700'},
  info: {flex: 1},
  name: {fontSize: 15, fontWeight: '600', color: colors.text},
  detail: {fontSize: 12, color: colors.textSecondary, marginTop: 2},
  email: {fontSize: 12, color: colors.textSecondary},
  actions: {alignItems: 'center', gap: 6},
  editBtn: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: colors.primary},
  editText: {fontSize: 12, color: colors.primary, fontWeight: '500'},
});

export default OfficerCard;
