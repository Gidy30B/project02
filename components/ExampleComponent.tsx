
import React from 'react';
import { Button, View } from 'react-native';
import { useTheme } from '../context/theme.context';

const ExampleComponent = () => {
  const { clearTheme } = useTheme();

  return (
    <View>
      <Button title="Clear Theme" onPress={clearTheme} />
    </View>
  );
};

export default ExampleComponent;