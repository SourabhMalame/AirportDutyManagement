import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useAuth} from '../../../hooks/useAuth';
import {colors} from '../../../theme/colors';
import {shadows} from '../../../theme/spacing';

const AdminProfileScreen = () => {
  const {user} = useSelector(state => state.auth);
  const {signOut} = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: signOut},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'A'}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Administrator</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="Employee ID" value={user?.employeeId} />
          <InfoRow label="Phone" value={user?.phone} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Role" value="Admin" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({label, value}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  header: {padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border},
  title: {fontSize: 20, fontWeight: '700', color: colors.text},
  card: {alignItems: 'center', backgroundColor: colors.white, margin: 16, borderRadius: 16, padding: 24, ...shadows.sm},
  avatar: {width: 80, height: 80, borderRadius: 40, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', marginBottom: 12},
  avatarText: {color: colors.white, fontSize: 32, fontWeight: '700'},
  name: {fontSize: 20, fontWeight: '700', color: colors.text},
  email: {fontSize: 14, color: colors.textSecondary, marginTop: 4},
  badge: {backgroundColor: '#F3E8FF', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 10},
  badgeText: {color: '#7C3AED', fontWeight: '600', fontSize: 13},
  infoCard: {backgroundColor: colors.white, marginHorizontal: 16, borderRadius: 12, padding: 16, ...shadows.sm},
  row: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider},
  rowLabel: {fontSize: 14, color: colors.textSecondary},
  rowValue: {fontSize: 14, fontWeight: '500', color: colors.text},
  logoutBtn: {margin: 16, borderWidth: 1.5, borderColor: colors.error, borderRadius: 10, padding: 15, alignItems: 'center'},
  logoutText: {color: colors.error, fontWeight: '600', fontSize: 15},
});

export default AdminProfileScreen;
