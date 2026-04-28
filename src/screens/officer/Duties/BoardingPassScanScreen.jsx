import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, Alert, Platform, PermissionsAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import {parseBoardingPass} from '../../../utils/parseBoardingPass';
import {colors} from '../../../theme/colors';
import {shadows} from '../../../theme/spacing';
import AppButton from '../../../components/common/AppButton';
import AppInput from '../../../components/common/AppInput';

const FIELD_LABELS = {
  flightNo: 'Flight No',
  from: 'From (City)',
  to: 'To (City)',
  date: 'Date (YYYY-MM-DD)',
  flightTime: 'Flight Time (HH:mm)',
  arrivalDeparture: 'Arrival / Departure',
};

const BoardingPassScanScreen = () => {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [rawText, setRawText] = useState('');

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs camera access to scan boarding passes.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert(
        'Camera Permission Denied',
        'Please enable camera permission in Settings → Apps → AirportDutyManagement → Permissions.',
      );
      return false;
    }
    return true;
  };

  const pickImage = async (fromCamera) => {
    if (fromCamera) {
      const ok = await requestCameraPermission();
      if (!ok) return;
    }
    const options = {
      mediaType: 'photo',
      quality: 1.0,
      includeBase64: false,
    };
    const picker = fromCamera ? launchCamera : launchImageLibrary;
    picker(options, response => {
      if (response.didCancel || response.errorCode) return;
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setImageUri(uri);
        setParsed(null);
        setRawText('');
        runOCR(uri);
      }
    });
  };

  const runOCR = async (uri) => {
    setScanning(true);
    try {
      const result = await TextRecognition.recognize(uri);
      const allText = result.blocks.map(b => b.text).join('\n');
      setRawText(allText);
      const fields = parseBoardingPass(allText);
      setParsed(fields);
    } catch (e) {
      Alert.alert('Scan Failed', 'Could not read text from the image. Try a clearer photo.');
    } finally {
      setScanning(false);
    }
  };

  const updateField = (key, value) => {
    setParsed(prev => ({...prev, [key]: value}));
  };

  const handleProceed = () => {
    if (!parsed) return;
    // Navigate to CreateDuty with pre-filled data
    navigation.navigate('CreateDuty', {prefill: parsed});
  };

  const showSourcePicker = () => {
    Alert.alert(
      'Select Image Source',
      'Choose how to add the boarding pass',
      [
        {text: 'Camera', onPress: () => pickImage(true)},
        {text: 'Gallery', onPress: () => pickImage(false)},
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  };

  const hasAnyField = parsed && Object.values(parsed).some(v => v);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan Boarding Pass</Text>
        <View style={{width: 60}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Instructions */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Works with all Indian airlines</Text>
          <Text style={styles.infoText}>
            IndiGo · Air India · Vistara · SpiceJet · Akasa · GoFirst{'\n'}
            Take a clear photo or pick from gallery. Keep the pass flat and well-lit.
          </Text>
        </View>

        {/* Scan button */}
        <TouchableOpacity style={styles.scanBtn} onPress={showSourcePicker}>
          <Text style={styles.scanIcon}>📷</Text>
          <Text style={styles.scanBtnText}>
            {imageUri ? 'Rescan / Change Image' : 'Scan Boarding Pass'}
          </Text>
        </TouchableOpacity>

        {/* Image preview */}
        {imageUri && (
          <View style={styles.previewBox}>
            <Image source={{uri: imageUri}} style={styles.preview} resizeMode="contain" />
          </View>
        )}

        {/* OCR in progress */}
        {scanning && (
          <View style={styles.scanningBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.scanningText}>Reading boarding pass...</Text>
          </View>
        )}

        {/* Extracted fields */}
        {parsed && !scanning && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Extracted Details</Text>
            <Text style={styles.resultSub}>Review and edit before creating duty</Text>

            {Object.entries(FIELD_LABELS).map(([key, label]) => (
              <AppInput
                key={key}
                label={label}
                value={parsed[key] || ''}
                onChangeText={v => updateField(key, v)}
                placeholder={parsed[key] ? '' : 'Not detected — enter manually'}
                style={parsed[key] ? styles.fieldFilled : styles.fieldEmpty}
              />
            ))}

            {!hasAnyField && (
              <View style={styles.noDataBox}>
                <Text style={styles.noDataText}>
                  No fields detected. The image may be unclear.{'\n'}
                  Try a better-lit photo with the pass held flat.
                </Text>
              </View>
            )}

            <AppButton
              title="Use These Details to Create Duty"
              onPress={handleProceed}
              style={styles.proceedBtn}
              disabled={!hasAnyField}
            />
          </View>
        )}

        {/* Raw OCR text (debug helper) */}
        {rawText.length > 0 && !scanning && (
          <TouchableOpacity
            style={styles.rawToggle}
            onPress={() => Alert.alert('OCR Raw Text', rawText)}>
            <Text style={styles.rawToggleText}>View raw OCR text</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: {color: colors.primary, fontSize: 15},
  title: {fontSize: 18, fontWeight: '700', color: colors.text},
  content: {padding: 16, paddingBottom: 40},

  infoBox: {
    backgroundColor: '#EFF6FF', borderRadius: 10, padding: 14,
    marginBottom: 16, borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  infoTitle: {fontSize: 13, fontWeight: '700', color: colors.primary, marginBottom: 4},
  infoText: {fontSize: 12, color: colors.textSecondary, lineHeight: 18},

  scanBtn: {
    backgroundColor: colors.primary, borderRadius: 10, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, gap: 10, ...shadows.sm,
  },
  scanIcon: {fontSize: 22},
  scanBtnText: {color: colors.white, fontSize: 16, fontWeight: '600'},

  previewBox: {
    backgroundColor: colors.white, borderRadius: 10, padding: 8,
    marginBottom: 16, ...shadows.sm, alignItems: 'center',
  },
  preview: {width: '100%', height: 200, borderRadius: 8},

  scanningBox: {
    alignItems: 'center', padding: 24, backgroundColor: colors.white,
    borderRadius: 10, marginBottom: 16, ...shadows.sm,
  },
  scanningText: {marginTop: 12, fontSize: 14, color: colors.textSecondary},

  resultCard: {
    backgroundColor: colors.white, borderRadius: 10, padding: 16,
    marginBottom: 16, ...shadows.sm,
  },
  resultTitle: {fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2},
  resultSub: {fontSize: 12, color: colors.textSecondary, marginBottom: 14},
  fieldFilled: {backgroundColor: '#F0FDF4'},
  fieldEmpty: {backgroundColor: '#FFF7ED'},
  noDataBox: {
    backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12, marginBottom: 12,
  },
  noDataText: {fontSize: 13, color: '#DC2626', textAlign: 'center', lineHeight: 20},
  proceedBtn: {marginTop: 8},

  rawToggle: {alignItems: 'center', paddingVertical: 8},
  rawToggleText: {fontSize: 12, color: colors.primary, textDecorationLine: 'underline'},
});

export default BoardingPassScanScreen;
