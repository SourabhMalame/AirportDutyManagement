import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useDuties} from '../../../hooks/useDuties';
import DutyCard from '../../../components/common/DutyCard';
import EmptyState from '../../../components/common/EmptyState';
import ReportFilterBar from '../../../components/admin/ReportFilterBar';
import {colors} from '../../../theme/colors';

const AllDutiesScreen = () => {
  const navigation = useNavigation();
  const {list: duties, fetchDuties, loadMore, isLoading, filters, setFilters, pagination} = useDuties();
  const [search, setSearch] = useState('');

  useEffect(() => {fetchDuties(filters);}, [filters]);

  const filtered = duties.filter(d =>
    !search ||
    d.officerName?.toLowerCase().includes(search.toLowerCase()) ||
    d.flightNo?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>All Duties</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateDuty')}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.search}
          placeholder="Search subordinate, flight no..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textDisabled}
        />
      </View>
      <ReportFilterBar filters={filters} onChange={f => setFilters(f)} />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id?.toString()}
        renderItem={({item}) => (
          <DutyCard duty={item} onPress={() => navigation.navigate('DutyDetail', {dutyId: item.id})} />
        )}
        contentContainerStyle={styles.list}
        refreshing={isLoading && pagination.page === 1}
        onRefresh={() => fetchDuties(filters)}
        onEndReached={() => !search && loadMore(filters)}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isLoading && pagination.page > 1 ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null}
        ListEmptyComponent={<EmptyState icon="📋" title="No duties found" subtitle="Try adjusting your filters" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border},
  title: {fontSize: 20, fontWeight: '700', color: colors.text},
  addBtn: {backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8},
  addBtnText: {color: colors.white, fontWeight: '600', fontSize: 14},
  searchBox: {padding: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border},
  search: {backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.text},
  list: {padding: 12},
  footer: {paddingVertical: 16},
});

export default AllDutiesScreen;
