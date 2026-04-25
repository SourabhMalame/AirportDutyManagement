import React, {useState} from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';
import {colors} from '../../theme/colors';
import {spacing as sp} from '../../theme/spacing';

const AppInput = ({label, error, style, ...props}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, focused && styles.focused, !!error && styles.error, style]}
        placeholderTextColor={colors.textDisabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {marginBottom: 14},
  label: {fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 5},
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15,
    color: colors.text, backgroundColor: colors.surface,
  },
  focused: {borderColor: colors.primary},
  error: {borderColor: colors.error},
  errorText: {fontSize: 11, color: colors.error, marginTop: 3},
});

export default AppInput;
