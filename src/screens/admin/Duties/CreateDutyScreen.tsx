import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import {dutySchema} from '../../../utils/validationSchemas';
import {useDuties} from '../../../hooks/useDuties';
import {fetchOfficersStart, fetchOfficersSuccess, fetchOfficersFailure} from '../../../store/slices/officerSlice';
import {fetchAirportsStart, fetchAirportsSuccess, setTerminals} from '../../../store/slices/airportSlice';
import {getOfficers} from '../../../api/officerApi';
import {getAirports, getTerminals} from '../../../api/airportApi';
import AppInput from '../../../components/common/AppInput';
import AppButton from '../../../components/common/AppButton';
import {colors} from '../../../theme/colors';
import {AIRPORTS, OFFICE_TYPES, ARRIVAL_DEPARTURE, CITIES} from '../../../constants/dutyFormFields';
import {getDayFromDate, toAPIDate, toAPITime} from '../../../utils/dateUtils';
import moment from 'moment';

const CreateDutyScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {addDuty} = useDuties();
  const officers = useSelector(state => state.officers.list);
  const {user: adminUser} = useSelector(state => state.auth);
  const {list: airports, terminals} = useSelector(state => state.airports);

  useEffect(() => {
    dispatch(fetchOfficersStart());
    getOfficers()
      .then(res => dispatch(fetchOfficersSuccess(res.data)))
      .catch(e => dispatch(fetchOfficersFailure(e?.message)));
    dispatch(fetchAirportsStart());
    getAirports()
      .then(res => dispatch(fetchAirportsSuccess(res.data)))
      .catch(() => {});
    dispatch(setTerminals([]));
  }, []);

  // When airport changes, load its terminals and reset terminal selection
  const handleAirportChange = async (airportId) => {
    const airport = airports.find(a => a.id === airportId);
    setValue('airportId', airportId);
    setValue('airportName', airport?.name || '');
    setValue('terminalId', '');
    setValue('terminalName', '');
    dispatch(setTerminals([]));
    if (airportId) {
      try {
        const res = await getTerminals(airportId);
        dispatch(setTerminals(res.data));
      } catch {}
    }
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReportingTimePicker, setShowReportingTimePicker] = useState(false);
  const [showFlightTimePicker, setShowFlightTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reportingTime, setReportingTime] = useState(new Date());
  const [flightTime, setFlightTime] = useState(new Date());

  const [officerOpen, setOfficerOpen] = useState(false);
  const [officeTypeOpen, setOfficeTypeOpen] = useState(false);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [arrDepOpen, setArrDepOpen] = useState(false);
  const [airportOpen, setAirportOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const {control, handleSubmit, setValue, watch, formState: {errors, isSubmitting}} = useForm({
    resolver: yupResolver(dutySchema),
    defaultValues: {
      officerId: '', date: toAPIDate(new Date()), reportingTime: toAPITime(new Date()),
      officeType: '', from: '', to: '', flightNo: '', flightTime: toAPITime(new Date()),
      officerName: '', arrivalDeparture: '',
      airportId: '', airportName: '', terminalId: '', terminalName: '',
    },
  });

  const dateValue = watch('date');
  const selectedOfficerId = watch('officerId');
  const dayValue = dateValue ? getDayFromDate(dateValue) : '';

  // Build dropdown list — admin "myself" first, then active subordinates
  const MYSELF_VALUE = adminUser?.id || adminUser?._id || 'myself';
  const officerItems = [
    {label: `${adminUser?.name} (Myself — Admin)`, value: MYSELF_VALUE},
    ...officers.filter(o => o.isEnabled).map(o => ({label: o.name, value: o.id?.toString()})),
  ];

  // Auto-fill officerName whenever the dropdown selection changes
  useEffect(() => {
    if (!selectedOfficerId) return;
    if (selectedOfficerId === MYSELF_VALUE) {
      setValue('officerName', adminUser?.name || '');
    } else {
      const found = officers.find(o => o.id?.toString() === selectedOfficerId);
      if (found) setValue('officerName', found.name);
    }
  }, [selectedOfficerId]);

  const onSubmit = async data => {
    const result = await addDuty(data);
    if (result) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Create Duty</Text>
        <View style={{width: 60}} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" nestedScrollEnabled>

        <Text style={styles.sectionLabel}>Assign To</Text>
        <Controller control={control} name="officerId" render={({field: {onChange, value}}) => (
          <DropDownPicker open={officerOpen} setOpen={setOfficerOpen} value={value} setValue={cb => onChange(cb(value))}
            items={officerItems} placeholder="Select Subordinate or Myself" style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList} zIndex={6000} listMode="SCROLLVIEW" />
        )} />
        {errors.officerId && <Text style={styles.err}>{errors.officerId.message}</Text>}

        <Text style={styles.sectionLabel}>Date & Day</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.dateBtn, {flex: 2}]} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateBtnText}>{moment(selectedDate).format('DD MMM YYYY')}</Text>
          </TouchableOpacity>
          <View style={[styles.dayBox, {flex: 1}]}>
            <Text style={styles.dayText}>{dayValue}</Text>
          </View>
        </View>
        {showDatePicker && (
          <DateTimePicker value={selectedDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {setShowDatePicker(false); if (d) {setSelectedDate(d); setValue('date', toAPIDate(d));}}} />
        )}

        <Text style={styles.sectionLabel}>Reporting Time at Airport</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowReportingTimePicker(true)}>
          <Text style={styles.dateBtnText}>{moment(reportingTime).format('hh:mm A')}</Text>
        </TouchableOpacity>
        {showReportingTimePicker && (
          <DateTimePicker value={reportingTime} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, t) => {setShowReportingTimePicker(false); if (t) {setReportingTime(t); setValue('reportingTime', toAPITime(t));}}} />
        )}
        {errors.reportingTime && <Text style={styles.err}>{errors.reportingTime.message}</Text>}

        <Text style={styles.sectionLabel}>Office / Holiday Type</Text>
        <Controller control={control} name="officeType" render={({field: {onChange, value}}) => (
          <DropDownPicker open={officeTypeOpen} setOpen={setOfficeTypeOpen} value={value} setValue={cb => onChange(cb(value))}
            items={OFFICE_TYPES} placeholder="Select Type" style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList} zIndex={5000} listMode="SCROLLVIEW" />
        )} />
        {errors.officeType && <Text style={styles.err}>{errors.officeType.message}</Text>}

        <Text style={styles.sectionLabel}>From</Text>
        <Controller control={control} name="from" render={({field: {onChange, value}}) => (
          <DropDownPicker open={fromOpen} setOpen={setFromOpen} value={value} setValue={cb => onChange(cb(value))}
            items={CITIES.map(c => ({label: c, value: c}))} placeholder="Select From City" style={styles.dropdown} searchable
            dropDownContainerStyle={styles.dropdownList} zIndex={4000} listMode="SCROLLVIEW" />
        )} />
        {errors.from && <Text style={styles.err}>{errors.from.message}</Text>}

        <Text style={styles.sectionLabel}>To</Text>
        <Controller control={control} name="to" render={({field: {onChange, value}}) => (
          <DropDownPicker open={toOpen} setOpen={setToOpen} value={value} setValue={cb => onChange(cb(value))}
            items={CITIES.map(c => ({label: c, value: c}))} placeholder="Select To City" style={styles.dropdown} searchable
            dropDownContainerStyle={styles.dropdownList} zIndex={3000} listMode="SCROLLVIEW" />
        )} />
        {errors.to && <Text style={styles.err}>{errors.to.message}</Text>}

        <Controller control={control} name="flightNo" render={({field: {onChange, value}}) => (
          <AppInput label="Flight No" value={value} onChangeText={onChange} placeholder="e.g. 6E 201" autoCapitalize="characters" error={errors.flightNo?.message} />
        )} />

        <Text style={styles.sectionLabel}>Flight Time</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFlightTimePicker(true)}>
          <Text style={styles.dateBtnText}>{moment(flightTime).format('hh:mm A')}</Text>
        </TouchableOpacity>
        {showFlightTimePicker && (
          <DateTimePicker value={flightTime} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, t) => {setShowFlightTimePicker(false); if (t) {setFlightTime(t); setValue('flightTime', toAPITime(t));}}} />
        )}
        {errors.flightTime && <Text style={styles.err}>{errors.flightTime.message}</Text>}

        <Controller control={control} name="officerName" render={({field: {onChange, value}}) => (
          <AppInput label="Name" value={value} onChangeText={onChange} placeholder="Auto-filled on selection" error={errors.officerName?.message} />
        )} />

        <Text style={styles.sectionLabel}>Arrival / Departure</Text>
        <Controller control={control} name="arrivalDeparture" render={({field: {onChange, value}}) => (
          <DropDownPicker open={arrDepOpen} setOpen={setArrDepOpen} value={value} setValue={cb => onChange(cb(value))}
            items={ARRIVAL_DEPARTURE} placeholder="Select Arrival/Departure" style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList} zIndex={2000} listMode="SCROLLVIEW" />
        )} />
        {errors.arrivalDeparture && <Text style={styles.err}>{errors.arrivalDeparture.message}</Text>}

        <Text style={styles.sectionLabel}>Airport</Text>
        <Controller control={control} name="airportId" render={({field: {value}}) => (
          <DropDownPicker
            open={airportOpen} setOpen={setAirportOpen}
            value={value}
            setValue={cb => handleAirportChange(cb(value))}
            items={airports.filter(a => a.isActive).map(a => ({label: `${a.name} (${a.code})`, value: a.id}))}
            placeholder="Select Airport" style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList} zIndex={1200} listMode="SCROLLVIEW"
          />
        )} />
        {errors.airportId && <Text style={styles.err}>{errors.airportId.message}</Text>}

        <Text style={styles.sectionLabel}>Terminal</Text>
        <Controller control={control} name="terminalId" render={({field: {onChange, value}}) => (
          <DropDownPicker
            open={terminalOpen} setOpen={setTerminalOpen}
            value={value}
            setValue={cb => {
              const tId = cb(value);
              const terminal = terminals.find(t => t.id === tId);
              onChange(tId);
              setValue('terminalName', terminal?.name || '');
            }}
            items={terminals.filter(t => t.isActive).map(t => ({label: `${t.name} (${t.code})`, value: t.id}))}
            placeholder={terminals.length === 0 ? 'Select airport first' : 'Select Terminal'}
            disabled={terminals.length === 0}
            style={[styles.dropdown, terminals.length === 0 && styles.dropdownDisabled]}
            dropDownContainerStyle={styles.dropdownList} zIndex={1100} listMode="SCROLLVIEW"
          />
        )} />
        {errors.terminalId && <Text style={styles.err}>{errors.terminalId.message}</Text>}

        <AppButton title="Create Duty" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border},
  back: {color: colors.primary, fontSize: 15},
  title: {fontSize: 18, fontWeight: '700', color: colors.text},
  content: {padding: 16, paddingBottom: 40},
  sectionLabel: {fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 5, marginTop: 8},
  row: {flexDirection: 'row', gap: 10, marginBottom: 8},
  dateBtn: {borderWidth: 1.5, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: colors.surface, marginBottom: 8},
  dateBtnText: {fontSize: 15, color: colors.text},
  dayBox: {borderWidth: 1.5, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: colors.background, justifyContent: 'center'},
  dayText: {fontSize: 14, color: colors.textSecondary},
  dropdown: {borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface, marginBottom: 4},
  dropdownDisabled: {backgroundColor: colors.background, opacity: 0.6},
  dropdownList: {borderColor: colors.border},
  err: {fontSize: 11, color: colors.error, marginBottom: 8},
  btn: {marginTop: 16},
});

export default CreateDutyScreen;
