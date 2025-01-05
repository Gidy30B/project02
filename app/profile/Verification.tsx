import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerificationScreen() {
  const router = useRouter();
  const userId = useSelector((state) => state.auth.userId);

  const [profileCompletion, setProfileCompletion] = useState({
    professionalDetails: 0,
    practiceInfo: 0,
    overall: 0,
  });
  const [missingFields, setMissingFields] = useState({
    professionalDetails: [],
    practiceInfo: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileProgress = async () => {
      try {
        const response = await axios.get(`https://medplus-health.onrender.com/api/professionals/progress/${userId}`);
        
        const professionalDetailsProgress = response.data.progress.professionalDetails.missingFields.length === 0 ? 100 : Math.round(response.data.progress.professionalDetails.progress);
        const practiceInfoProgress = response.data.progress.practiceInfo.missingFields.length === 0 ? 100 : Math.round(response.data.progress.practiceInfo.progress);
        const overallProgress = response.data.progress.professionalDetails.missingFields.length === 0 && response.data.progress.practiceInfo.missingFields.length === 0 ? 100 : Math.round(response.data.progress.overall);

        setProfileCompletion({
          professionalDetails: professionalDetailsProgress,
          practiceInfo: practiceInfoProgress,
          overall: overallProgress,
        });
        setMissingFields({
          professionalDetails: response.data.progress.professionalDetails.missingFields,
          practiceInfo: response.data.progress.practiceInfo.missingFields,
        });

        // Send a POST request to update profile completion status
        const profileCompleted = professionalDetailsProgress === 100 && practiceInfoProgress === 100;
        await axios.post(`https://medplus-health.onrender.com/api/professionals/update-profile-completion/${userId}`, { completedProfile: profileCompleted });

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile progress');
        setLoading(false);
      }
    };

    fetchProfileProgress();
  }, [userId]);

  const { professionalDetails, practiceInfo, overall } = profileCompletion;

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" color="#6200ee" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile Verification</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({
          pathname: '/profile/ProfessionalDetailsScreen',
          params: {
            missingFields: JSON.stringify(missingFields.professionalDetails),
            nextScreenMissingFields: JSON.stringify(missingFields.practiceInfo)
          }
        })}
      >
        <Text style={styles.cardTitle}>Professional Details</Text>
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={professionalDetails / 100}
            color="#007BFF"
            style={styles.progressBar}
          />
          <Text style={styles.percentage}>{professionalDetails}%</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({
          pathname: '/profile/PracticeInfoScreen',
          params: { missingFields: JSON.stringify(missingFields.practiceInfo) }
        })}
      >
        <Text style={styles.cardTitle}>Practice Information</Text>
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={practiceInfo / 100}
            color="#28A745"
            style={styles.progressBar}
          />
          <Text style={styles.percentage}>{practiceInfo}%</Text>
        </View>
      </TouchableOpacity>

      {overall === 100 && (
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/doctor/schedule')}
        >
          <Text style={styles.buttonText}>Set Up Schedule</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 40,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  secondaryButton: {
    backgroundColor: '#28A745',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#D9534F',
  },
});
