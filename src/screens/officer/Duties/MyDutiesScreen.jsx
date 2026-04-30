import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useDuties} from '../../../hooks/useDuties';
import DutyCard from '../../../components/common/DutyCard';
import EmptyState from '../../../components/common/EmptyState';
import AppButton from '../../../components/common/AppButton';
import {colors} from '../../../theme/colors';
import {DUTY_STATUS} from '../../../constants/dutyStatus';

const TABS = ['ALL', ...Object.values(DUTY_STATUS)];

const MyDutiesScreen = () => {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);
  const {list: duties, fetchDuties, loadMore, changeStatus, isLoading, pagination} = useDuties();
  const [activeTab, setActiveTab] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatusUpdate = async (dutyId, status) => {
    setUpdatingId(dutyId);
    await changeStatus(dutyId, status);
    setUpdatingId(null);
    setActiveTab('ALL');
    fetchDuties({officerId: user?.id});
  };

  useEffect(() => {
    fetchDuties({officerId: user?.id});
  }, []);

  const filtered = activeTab === 'ALL' ? duties : duties.filter(d => d.status === activeTab);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Duties</Text>
      </View>
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id?.toString()}
        renderItem={({item}) => (
          <View>
            <DutyCard duty={item} onPress={() => navigation.navigate('DutyDetail', {dutyId: item.id})} />
            {item.status === DUTY_STATUS.UPCOMING && (
              <View style={styles.actionRow}>
                <AppButton
                  title="Completed"
                  style={styles.actionBtn}
                  loading={updatingId === item.id}
                  onPress={() => handleStatusUpdate(item.id, DUTY_STATUS.COMPLETED)}
                />
                <AppButton
                  title="Cancelled"
                  variant="danger"
                  style={styles.actionBtn}
                  loading={updatingId === item.id}
                  onPress={() => handleStatusUpdate(item.id, DUTY_STATUS.CANCELLED)}
                />
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshing={isLoading && pagination.page === 1}
        onRefresh={() => fetchDuties({officerId: user?.id})}
        onEndReached={() => activeTab === 'ALL' && loadMore({officerId: user?.id})}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isLoading && pagination.page > 1 ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null}
        ListEmptyComponent={<EmptyState icon="📋" title={activeTab === 'ALL' ? 'No duties assigned' : `No ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} duties`} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  header: {padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border},
  title: {fontSize: 20, fontWeight: '700', color: colors.text},
  tabBar: {backgroundColor: colors.white, paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border},
  tab: {paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginRight: 8, marginTop: 8, borderWidth: 1, borderColor: colors.border},
  tabActive: {backgroundColor: colors.primary, borderColor: colors.primary},
  tabText: {fontSize: 13, color: colors.textSecondary},
  tabTextActive: {color: colors.white, fontWeight: '600'},
  list: {padding: 12},
  footer: {paddingVertical: 16},
  actionRow: {flexDirection: 'row', gap: 10, marginTop: -4, marginBottom: 10, paddingHorizontal: 2},
  actionBtn: {flex: 1, minHeight: 38, paddingVertical: 8},
});

export default MyDutiesScreen;
