import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {fetchOfficersStart, fetchOfficersSuccess, fetchOfficersFailure, updateOfficer} from '../../../store/slices/officerSlice';
import {getOfficers, toggleOfficerAccess} from '../../../api/officerApi';
import OfficerCard from '../../../components/admin/OfficerCard';
import EmptyState from '../../../components/common/EmptyState';
import {colors} from '../../../theme/colors';

const OfficerListScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {list: officers, isLoading} = useSelector(state => state.officers);
  const [search, setSearch] = useState('');

  const filtered = officers.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.employeeId?.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const load = async () => {
      dispatch(fetchOfficersStart());
      try {
        const res = await getOfficers();
        dispatch(fetchOfficersSuccess(res.data));
      } catch (e) {
        dispatch(fetchOfficersFailure(e?.message));
      }
    };
    load();
  }, []);

  const handleToggle = async (id, isEnabled) => {
    try {
      const res = await toggleOfficerAccess(id, isEnabled);
      dispatch(updateOfficer(res.data));
    } catch {
      Alert.alert('Error', 'Failed to update subordinate access');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Subordinates</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddOfficer')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.search}
          placeholder="Search subordinate by name or ID..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textDisabled}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id?.toString()}
        renderItem={({item}) => (
          <OfficerCard
            officer={item}
            onEdit={o => navigation.navigate('EditOfficer', {officer: o})}
            onToggle={handleToggle}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="👮" title="No subordinates found" />}
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
});

export default OfficerListScreen;
