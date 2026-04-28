import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import {dutySchema} from '../../../utils/validationSchemas';
import {useDuties} from '../../../hooks/useDuties';
import {fetchAirportsStart, fetchAirportsSuccess, setTerminals} from '../../../store/slices/airportSlice';
import {getAirports, getTerminals} from '../../../api/airportApi';
import AppInput from '../../../components/common/AppInput';
import AppButton from '../../../components/common/AppButton';
import {colors} from '../../../theme/colors';
import {OFFICE_TYPES, ARRIVAL_DEPARTURE, CITIES} from '../../../constants/dutyFormFields';
import {getDayFromDate, toAPIDate, toAPITime} from '../../../utils/dateUtils';
import moment from 'moment';

const OfficerCreateDutyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const prefill = route.params?.prefill || null;
  const dispatch = useDispatch();
  const {addDuty} = useDuties();
  const {user} = useSelector(state => state.auth);
  const {list: airports, terminals} = useSelector(state => state.airports);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReportingTimePicker, setShowReportingTimePicker] = useState(false);
  const [showFlightTimePicker, setShowFlightTimePicker] = useState(false);

  const initDate = prefill?.date ? new Date(prefill.date) : new Date();
  const initFlightTime = prefill?.flightTime
    ? moment(prefill.flightTime, 'HH:mm').toDate()
    : new Date();

  const [selectedDate, setSelectedDate] = useState(initDate);
  const [reportingTime, setReportingTime] = useState(new Date());
  const [flightTime, setFlightTime] = useState(initFlightTime);

  const [officeTypeOpen, setOfficeTypeOpen] = useState(false);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [arrDepOpen, setArrDepOpen] = useState(false);
  const [airportOpen, setAirportOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const {control, handleSubmit, setValue, watch, formState: {errors, isSubmitting}} = useForm({
    resolver: yupResolver(dutySchema),
    defaultValues: {
      officerId: user?.id?.toString() || '',
      officerName: user?.name || '',
      date: prefill?.date || toAPIDate(new Date()),
      reportingTime: toAPITime(new Date()),
      officeType: '',
      from: prefill?.from || '',
      to: prefill?.to || '',
      flightNo: prefill?.flightNo || '',
      flightTime: prefill?.flightTime || toAPITime(new Date()),
      arrivalDeparture: prefill?.arrivalDeparture || '',
      airportId: '', airportName: '', terminalId: '', terminalName: '',
    },
  });

  const dateValue = watch('date');
  const dayValue = dateValue ? getDayFromDate(dateValue) : '';

  useEffect(() => {
    if (!prefill) return;
    if (prefill.date) {
      const d = new Date(prefill.date);
      setSelectedDate(d);
      setValue('date', prefill.date);
    }
    if (prefill.flightTime) {
      setFlightTime(moment(prefill.flightTime, 'HH:mm').toDate());
      setValue('flightTime', prefill.flightTime);
    }
    if (prefill.from) setValue('from', prefill.from);
    if (prefill.to) setValue('to', prefill.to);
    if (prefill.flightNo) setValue('flightNo', prefill.flightNo);
    if (prefill.arrivalDeparture) setValue('arrivalDeparture', prefill.arrivalDeparture);
  }, [prefill]);

  useEffect(() => {
    dispatch(fetchAirportsStart());
    getAirports()
      .then(res => dispatch(fetchAirportsSuccess(res.data)))
      .catch(() => {});
    dispatch(setTerminals([]));
  }, []);

  const handleAirportChange = async airportId => {
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

  const onSubmit = async data => {
    const result = await addDuty(data);
    if (result) navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Duty</Text>
        <TouchableOpacity style={styles.scanHeaderBtn} onPress={() => navigation.navigate('BoardingPassScan')}>
          <Text style={styles.scanHeaderText}>📷 Scan Pass</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" nestedScrollEnabled>

        <AppInput label="Subordinate Name" value={user?.name || ''} editable={false} style={styles.readOnly} />

        <Text style={styles.lbl}>Date & Day</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.dateBtn, {flex: 2}]} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateBtnText}>{moment(selectedDate).format('DD MMM YYYY')}</Text>
          </TouchableOpacity>
          <View style={[styles.dayBox, {flex: 1}]}><Text style={styles.dayText}>{dayValue}</Text></View>
        </View>
        {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(_, d) => {setShowDatePicker(false); if (d) {setSelectedDate(d); setValue('date', toAPIDate(d));}}} />}

        <Text style={styles.lbl}>Reporting Time</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowReportingTimePicker(true)}>
          <Text style={styles.dateBtnText}>{moment(reportingTime).format('HH:mm')}</Text>
        </TouchableOpacity>
        {showReportingTimePicker && <DateTimePicker value={reportingTime} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(_, t) => {setShowReportingTimePicker(false); if (t) {setReportingTime(t); setValue('reportingTime', toAPITime(t));}}} />}

        <Text style={styles.lbl}>Office / Holiday Type</Text>
        <Controller control={control} name="officeType" render={({field: {onChange, value}}) => (
          <DropDownPicker open={officeTypeOpen} setOpen={setOfficeTypeOpen} value={value} setValue={cb => onChange(cb(value))} items={OFFICE_TYPES} placeholder="Select Type" style={styles.dropdown} dropDownContainerStyle={styles.dropdownList} zIndex={5000} listMode="SCROLLVIEW" />
        )} />
        {errors.officeType && <Text style={styles.err}>{errors.officeType.message}</Text>}

        <Text style={styles.lbl}>From</Text>
        <Controller control={control} name="from" render={({field: {onChange, value}}) => (
          <DropDownPicker open={fromOpen} setOpen={setFromOpen} value={value} setValue={cb => onChange(cb(value))} items={CITIES.map(c => ({label: c, value: c}))} placeholder="Select From City" style={styles.dropdown} searchable dropDownContainerStyle={styles.dropdownList} zIndex={4000} listMode="SCROLLVIEW" />
        )} />
        {errors.from && <Text style={styles.err}>{errors.from.message}</Text>}

        <Text style={styles.lbl}>To</Text>
        <Controller control={control} name="to" render={({field: {onChange, value}}) => (
          <DropDownPicker open={toOpen} setOpen={setToOpen} value={value} setValue={cb => onChange(cb(value))} items={CITIES.map(c => ({label: c, value: c}))} placeholder="Select To City" style={styles.dropdown} searchable dropDownContainerStyle={styles.dropdownList} zIndex={3000} listMode="SCROLLVIEW" />
        )} />
        {errors.to && <Text style={styles.err}>{errors.to.message}</Text>}

        <Controller control={control} name="flightNo" render={({field: {onChange, value}}) => (
          <AppInput label="Flight No" value={value} onChangeText={onChange} placeholder="e.g. 6E 201" autoCapitalize="characters" error={errors.flightNo?.message} />
        )} />

        <Text style={styles.lbl}>Flight Time</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFlightTimePicker(true)}>
          <Text style={styles.dateBtnText}>{moment(flightTime).format('HH:mm')}</Text>
        </TouchableOpacity>
        {showFlightTimePicker && <DateTimePicker value={flightTime} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(_, t) => {setShowFlightTimePicker(false); if (t) {setFlightTime(t); setValue('flightTime', toAPITime(t));}}} />}

        <Text style={styles.lbl}>Arrival / Departure</Text>
        <Controller control={control} name="arrivalDeparture" render={({field: {onChange, value}}) => (
          <DropDownPicker open={arrDepOpen} setOpen={setArrDepOpen} value={value} setValue={cb => onChange(cb(value))} items={ARRIVAL_DEPARTURE} placeholder="Select" style={styles.dropdown} dropDownContainerStyle={styles.dropdownList} zIndex={2000} listMode="SCROLLVIEW" />
        )} />
        {errors.arrivalDeparture && <Text style={styles.err}>{errors.arrivalDeparture.message}</Text>}

        <Text style={styles.lbl}>Airport</Text>
        <Controller control={control} name="airportId" render={({field: {value}}) => (
          <DropDownPicker open={airportOpen} setOpen={setAirportOpen} value={value}
            setValue={cb => handleAirportChange(cb(value))}
            items={airports.filter(a => a.isActive).map(a => ({label: `${a.name} (${a.code})`, value: a.id}))}
            placeholder="Select Airport" style={styles.dropdown} dropDownContainerStyle={styles.dropdownList} zIndex={1400} listMode="SCROLLVIEW" />
        )} />
        {errors.airportId && <Text style={styles.err}>{errors.airportId.message}</Text>}

        <Text style={styles.lbl}>Terminal</Text>
        <Controller control={control} name="terminalId" render={({field: {onChange, value}}) => (
          <DropDownPicker open={terminalOpen} setOpen={setTerminalOpen} value={value}
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
            dropDownContainerStyle={styles.dropdownList} zIndex={1300} listMode="SCROLLVIEW" />
        )} />
        {errors.terminalId && <Text style={styles.err}>{errors.terminalId.message}</Text>}

        <AppButton title="Submit Duty" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border},
  title: {fontSize: 20, fontWeight: '700', color: colors.text},
  scanHeaderBtn: {backgroundColor: colors.primary + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.primary + '40'},
  scanHeaderText: {fontSize: 13, color: colors.primary, fontWeight: '600'},
  content: {padding: 16, paddingBottom: 40},
  lbl: {fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 5, marginTop: 8},
  row: {flexDirection: 'row', gap: 10, marginBottom: 8},
  dateBtn: {borderWidth: 1.5, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: colors.surface, marginBottom: 8},
  dateBtnText: {fontSize: 15, color: colors.text},
  dayBox: {borderWidth: 1.5, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: colors.background, justifyContent: 'center'},
  dayText: {fontSize: 14, color: colors.textSecondary},
  dropdown: {borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface, marginBottom: 4},
  dropdownDisabled: {backgroundColor: colors.background, opacity: 0.6},
  dropdownList: {borderColor: colors.border},
  err: {fontSize: 11, color: colors.error, marginBottom: 8},
  readOnly: {backgroundColor: '#F3F4F6'},
  btn: {marginTop: 16},
});

export default OfficerCreateDutyScreen;
