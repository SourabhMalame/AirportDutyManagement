import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useDuties} from '../../../hooks/useDuties';
import DutyCard from '../../../components/common/DutyCard';
import EmptyState from '../../../components/common/EmptyState';
import {colors} from '../../../theme/colors';
import {DUTY_STATUS} from '../../../constants/dutyStatus';

const TABS = ['ALL', ...Object.values(DUTY_STATUS)];

const MyDutiesScreen = () => {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.auth);
  const {list: duties, fetchDuties, isLoading} = useDuties();
  const [activeTab, setActiveTab] = useState('ALL');

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
          <DutyCard duty={item} onPress={() => navigation.navigate('DutyDetail', {dutyId: item.id})} />
        )}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={() => fetchDuties({officerId: user?.id})}
        ListEmptyComponent={<EmptyState icon="📋" title={`No ${activeTab.toLowerCase()} duties`} />}
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
});

export default MyDutiesScreen;
