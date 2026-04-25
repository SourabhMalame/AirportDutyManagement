import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import AppButton from '../common/AppButton';
import {DUTY_STATUS} from '../../constants/dutyStatus';
import {colors} from '../../theme/colors';


const DutyStatusUpdater = ({duty, onUpdate, loading}) => {
  if (duty.status !== DUTY_STATUS.UPCOMING) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Status</Text>
      <View style={styles.row}>
        <AppButton
          title="Mark Completed"
          onPress={() => onUpdate(DUTY_STATUS.COMPLETED)}
          loading={loading}
          style={styles.btn}
        />
        <AppButton
          title="Mark Cancelled"
          onPress={() => onUpdate(DUTY_STATUS.CANCELLED)}
          variant="danger"
          style={styles.btn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: colors.surface, borderRadius: 10, padding: 16, marginTop: 16, borderWidth: 1, borderColor: colors.border},
  title: {fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12},
  row: {flexDirection: 'row', gap: 10},
  btn: {flex: 1},
});

export default DutyStatusUpdater;
