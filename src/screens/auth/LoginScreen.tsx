import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {loginSchema} from '../../utils/validationSchemas';
import {useAuth} from '../../hooks/useAuth';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import {colors} from '../../theme/colors';
import {ROLES} from '../../constants/roles';

const LoginScreen = () => {
  const navigation = useNavigation();
  const {sendOTP, isLoading, error, clearError} = useAuth();
  const [selectedRole, setSelectedRole] = useState(ROLES.OFFICER);

  useEffect(() => {
    clearError();
  }, []);

  const {control, handleSubmit, formState: {errors}} = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {identifier: '', password: ''},
  });

  const onSubmit = async data => {
    const success = await sendOTP({...data, role: selectedRole});
    if (success) {
      navigation.navigate('OTP');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>✈️</Text>
            </View>
            <Text style={styles.appName}>Airport Duty</Text>
            <Text style={styles.appSub}>Management System</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>

            {/* Role Selector */}
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleBtn, selectedRole === ROLES.ADMIN && styles.roleBtnActive]}
                onPress={() => setSelectedRole(ROLES.ADMIN)}>
                <Text style={[styles.roleText, selectedRole === ROLES.ADMIN && styles.roleTextActive]}>
                  Admin
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleBtn, selectedRole === ROLES.OFFICER && styles.roleBtnActive]}
                onPress={() => setSelectedRole(ROLES.OFFICER)}>
                <Text style={[styles.roleText, selectedRole === ROLES.OFFICER && styles.roleTextActive]}>
                  Subordinate
                </Text>
              </TouchableOpacity>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="identifier"
              render={({field: {onChange, value}}) => (
                <AppInput
                  label="Username / Email / Phone"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter username, email or phone"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={errors.identifier?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({field: {onChange, value}}) => (
                <AppInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter your password"
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />
            <AppButton
              title="Send OTP"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.btn}
            />
          </View>

          <Text style={styles.footer}>GTT DATA • Airport Duty Management v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.primary},
  flex: {flex: 1},
  scroll: {flexGrow: 1, justifyContent: 'center', padding: 24},
  header: {alignItems: 'center', marginBottom: 32},
  logoBox: {width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12},
  logoIcon: {fontSize: 40},
  appName: {fontSize: 26, fontWeight: '700', color: colors.white},
  appSub: {fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4},
  card: {backgroundColor: colors.white, borderRadius: 16, padding: 24},
  cardTitle: {fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16},
  roleContainer: {flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 10, padding: 4, marginBottom: 20},
  roleBtn: {flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center'},
  roleBtnActive: {backgroundColor: colors.primary, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2},
  roleText: {fontSize: 14, fontWeight: '600', color: colors.textSecondary},
  roleTextActive: {color: colors.white},
  errorBox: {backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 16},
  errorText: {fontSize: 13, color: colors.error},
  btn: {marginTop: 8},
  footer: {textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 24},
});

export default LoginScreen;
