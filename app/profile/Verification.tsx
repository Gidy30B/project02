import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { getProfileCompletion } from '../../utils/progressUtils';

export default function Verification() {
  const [progress, setProgress] = useState(0);

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
});
