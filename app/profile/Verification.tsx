import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getProfileCompletion } from '../../utils/progressUtils';

export default function Verification() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchProgress = async () => {
      const completion = await getProfileCompletion();
      setProgress(completion);
    };

    fetchProgress();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f6' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile Completion</Text>
        <ProgressBar progress={progress / 100} color="#6200ee" />
        <Text style={styles.progressText}>{progress.toFixed(2)}%</Text>
        {progress === 100 && (
          <TouchableOpacity style={styles.button} onPress={() => router.push('/doctor/dashboard')}>
            <Text style={styles.buttonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  progressText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  button: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#6200ee',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
