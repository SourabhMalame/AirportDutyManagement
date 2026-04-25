import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {colors, typography, borderRadius, spacing} from '../../theme/colors';
import {spacing as sp, borderRadius as br} from '../../theme/spacing';

const AppButton = ({title, onPress, variant = 'primary', loading = false, disabled = false, style}) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} size="small" />
        : <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {paddingVertical: 13, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minHeight: 48},
  primary: {backgroundColor: colors.primary},
  outline: {backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary},
  danger: {backgroundColor: colors.error},
  ghost: {backgroundColor: 'transparent'},
  disabled: {opacity: 0.55},
  text: {fontSize: 15, fontWeight: '600'},
  primaryText: {color: colors.white},
  outlineText: {color: colors.primary},
  dangerText: {color: colors.white},
  ghostText: {color: colors.primary},
});

export default AppButton;
