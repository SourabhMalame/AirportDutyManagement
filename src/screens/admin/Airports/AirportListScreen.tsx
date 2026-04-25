import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert, TextInput} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {fetchAirportsStart, fetchAirportsSuccess, fetchAirportsFailure, updateAirport} from '../../../store/slices/airportSlice';
import {getAirports, toggleAirport} from '../../../api/airportApi';
import {colors} from '../../../theme/colors';
import {shadows} from '../../../theme/spacing';

const AirportListScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {list: airports, isLoading} = useSelector(state => state.airports);
  const [search, setSearch] = useState('');

  const load = () => {
    dispatch(fetchAirportsStart());
    getAirports()
      .then(res => dispatch(fetchAirportsSuccess(res.data)))
      .catch(e => dispatch(fetchAirportsFailure(e?.message)));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = (airport, val) => {
    Alert.alert(
      val ? 'Activate Airport' : 'Deactivate Airport',
      `Are you sure you want to ${val ? 'activate' : 'deactivate'} ${airport.name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', onPress: async () => {
          try {
            const res = await toggleAirport(airport.id, val);
            dispatch(updateAirport(res.data));
          } catch {}
        }},
      ]
    );
  };

  const filtered = airports.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    a.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Airports</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AirportForm', {airport: null})}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.search}
          placeholder="Search by name, code or city..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={load}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{item.code}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.city}>{item.city}</Text>
              </View>
              <Switch
                value={item.isActive}
                onValueChange={val => handleToggle(item, val)}
                trackColor={{false: colors.border, true: colors.success + '80'}}
                thumbColor={item.isActive ? colors.success : colors.textDisabled}
              />
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AirportForm', {airport: item})}>
                <Text style={styles.actionText}>Edit Airport</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.terminalBtn]} onPress={() => navigation.navigate('TerminalList', {airport: item})}>
                <Text style={styles.terminalText}>Manage Terminals →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No airports found. Tap + Add to create one.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border},
  title: {fontSize: 20, fontWeight: '700', color: colors.text},
  addBtn: {backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8},
  addBtnText: {color: colors.white, fontWeight: '600', fontSize: 14},
  searchBox: {backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border},
  search: {backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: colors.text},
  list: {padding: 16, gap: 12},
  card: {backgroundColor: colors.white, borderRadius: 12, padding: 14, ...shadows.sm},
  cardTop: {flexDirection: 'row', alignItems: 'center', gap: 12},
  codeBadge: {backgroundColor: colors.primary + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: 52, alignItems: 'center'},
  codeText: {fontSize: 13, fontWeight: '700', color: colors.primary},
  info: {flex: 1},
  name: {fontSize: 14, fontWeight: '600', color: colors.text},
  city: {fontSize: 12, color: colors.textSecondary, marginTop: 2},
  cardActions: {flexDirection: 'row', marginTop: 12, gap: 8},
  actionBtn: {flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: 8, alignItems: 'center'},
  actionText: {fontSize: 13, color: colors.text, fontWeight: '500'},
  terminalBtn: {borderColor: colors.primary, backgroundColor: colors.primary + '08'},
  terminalText: {fontSize: 13, color: colors.primary, fontWeight: '600'},
  empty: {textAlign: 'center', color: colors.textSecondary, marginTop: 40},
});

export default AirportListScreen;
