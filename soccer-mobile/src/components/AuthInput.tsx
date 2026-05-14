import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, ...props }: AuthInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#102033',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C8D5E3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#102033',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
