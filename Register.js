
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import axios from 'axios';

const Register = ({ navigation }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const registerUser = async () => {
    try {
      const patient = {
        resourceType: 'Patient',
        name: [{ text: name }],
        gender: gender,
        birthDate: birthDate
      };
      const response = await axios.post('http://localhost:3000/fhir/Patient', patient);
      console.log('User registered:', response.data);
      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <Text>Register</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Gender" value={gender} onChangeText={setGender} />
      <TextInput placeholder="Birth Date" value={birthDate} onChangeText={setBirthDate} />
      <Button title="Register" onPress={registerUser} />
    </View>
  );
};

export default Register;