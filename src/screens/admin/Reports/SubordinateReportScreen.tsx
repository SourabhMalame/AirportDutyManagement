import React, {useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {fetchReportStart, fetchSubordinateReportSuccess, fetchReportFailure} from '../../../store/slices/reportSlice';
import {getSubordinateReport} from '../../../api/reportApi';
import EmptyState from '../../../components/common/EmptyState';
import {colors} from '../../../theme/colors';
import {DUTY_STATUS} from '../../../constants/dutyStatus';
import {INCENTIVE_AMOUNT} from '../../../constants/dutyFormFields';

const SubordinateReportScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {subordinateReport, isLoading} = useSelector(state => state.reports);

  useEffect(() => {
    const load = async () => {
      dispatch(fetchReportStart());
      try {
        const res = await getSubordinateReport();
        dispatch(fetchSubordinateReportSuccess(res.data));
      } catch (e) {
        dispatch(fetchReportFailure(e?.message));
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('DutyReport')}><Text style={styles.tab}>Duty Report</Text></TouchableOpacity>
        <Text style={[styles.tab, styles.activeTab]}>Subordinate Report</Text>
      </View>
      <FlatList
        data={subordinateReport}
        keyExtractor={item => item.officerId?.toString()}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.charAt(0)}</Text></View>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.empId}>{item.employeeId}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <StatBox label="Upcoming" value={item.upcoming || 0} color={colors.warning} />
              <StatBox label="Completed" value={item.completed || 0} color={colors.success} />
              <StatBox label="Cancelled" value={item.cancelled || 0} color={colors.error} />
              <StatBox label="Incentive" value={`₹${(item.incentiveDuties || 0) * INCENTIVE_AMOUNT}`} color={colors.secondary} />
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        ListEmptyComponent={<EmptyState icon="👮" title="No subordinate data" />}
      />
    </SafeAreaView>
  );
};

const StatBox = ({label, value, color}) => (
  <View style={styles.statBox}>
    <Text style={[styles.statValue, {color}]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  header: {flexDirection: 'row', padding: 16, gap: 20, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border},
  tab: {fontSize: 15, color: colors.textSecondary, paddingBottom: 4},
  activeTab: {color: colors.primary, fontWeight: '700', borderBottomWidth: 2, borderBottomColor: colors.primary},
  list: {padding: 12},
  card: {backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 10},
  avatarRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  avatar: {width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12},
  avatarText: {color: colors.white, fontSize: 16, fontWeight: '700'},
  name: {fontSize: 15, fontWeight: '600', color: colors.text},
  empId: {fontSize: 12, color: colors.textSecondary},
  statsRow: {flexDirection: 'row', gap: 8},
  statBox: {flex: 1, backgroundColor: colors.background, borderRadius: 8, padding: 10, alignItems: 'center'},
  statValue: {fontSize: 16, fontWeight: '700'},
  statLabel: {fontSize: 10, color: colors.textSecondary, marginTop: 2, textAlign: 'center'},
});

export default SubordinateReportScreen;
