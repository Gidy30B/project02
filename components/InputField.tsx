import React from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardTypeOptions } from 'react-native';

interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  inputType: 'text' | 'password';
  keyboardType: KeyboardTypeOptions;
  fieldButtonLabel: string;
  fieldButtonFunction: () => void;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  value: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  inputType,
  keyboardType,
  fieldButtonLabel,
  fieldButtonFunction,
  onChangeText,
  onBlur,
  value,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 25,
      }}>
      {icon}
      <TextInput
        placeholder={label}
        keyboardType={keyboardType}
        style={{ flex: 1, paddingVertical: 0 }}
        secureTextEntry={inputType === 'password'}
        onChangeText={onChangeText}
        onBlur={onBlur}
        value={value}
      />
      <TouchableOpacity onPress={fieldButtonFunction}>
        <Text style={{ color: '#AD40AF', fontWeight: '700' }}>{fieldButtonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default InputField;
