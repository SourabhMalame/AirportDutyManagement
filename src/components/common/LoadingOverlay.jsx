import React from 'react';
import {View, ActivityIndicator, StyleSheet, Modal, Text} from 'react-native';
import {colors} from '../../theme/colors';

const LoadingOverlay = ({visible, message = 'Loading...'}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center'},
  box: {backgroundColor: colors.white, borderRadius: 12, padding: 28, alignItems: 'center', gap: 12, minWidth: 140},
  text: {fontSize: 14, color: colors.textSecondary, marginTop: 8},
});

export default LoadingOverlay;
