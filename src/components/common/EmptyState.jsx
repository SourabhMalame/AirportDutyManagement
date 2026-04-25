import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../../theme/colors';

const EmptyState = ({icon = '📋', title = 'No data found', subtitle}) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60},
  icon: {fontSize: 48, marginBottom: 12},
  title: {fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center'},
  subtitle: {fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 6, maxWidth: 260},
});

export default EmptyState;
