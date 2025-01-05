import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useSelector } from 'react-redux';

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
        const response = await axios.get(
          `https://medplus-health.onrender.com/api/professionals/progress/${userId}`
        );

        const professionalDetailsProgress =
          response.data.progress.professionalDetails.missingFields.length === 0
            ? 100
            : Math.round(response.data.progress.professionalDetails.progress);
        const practiceInfoProgress =
          response.data.progress.practiceInfo.missingFields.length === 0
            ? 100
            : Math.round(response.data.progress.practiceInfo.progress);
        const overallProgress =
          response.data.progress.professionalDetails.missingFields.length === 0 &&
          response.data.progress.practiceInfo.missingFields.length === 0
            ? 100
            : Math.round(response.data.progress.overall);

        setProfileCompletion({
          professionalDetails: professionalDetailsProgress,
          practiceInfo: practiceInfoProgress,
          overall: overallProgress,
        });
        setMissingFields({
          professionalDetails: response.data.progress.professionalDetails.missingFields,
          practiceInfo: response.data.progress.practiceInfo.missingFields,
        });

        // Update profile completion status
        const profileCompleted = professionalDetailsProgress === 100 && practiceInfoProgress === 100;
        await axios.post(
          `https://medplus-health.onrender.com/api/professionals/update-profile-completion/${userId}`,
          { completedProfile: profileCompleted }
        );

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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Professional Details</Text>
        <ProgressBar
          progress={professionalDetails / 100}
          color="#007BFF"
          style={styles.progressBar}
        />
        <Text style={styles.percentage}>{professionalDetails}% Completed</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: '/profile/ProfessionalDetailsScreen',
              params: {
                missingFields: JSON.stringify(missingFields.professionalDetails),
              },
            })
          }
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Practice Information</Text>
        <ProgressBar
          progress={practiceInfo / 100}
          color="#28A745"
          style={styles.progressBar}
        />
        <Text style={styles.percentage}>{practiceInfo}% Completed</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: '/profile/PracticeInfoScreen',
              params: { missingFields: JSON.stringify(missingFields.practiceInfo) },
            })
          }
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>

      {overall === 100 && (
        <TouchableOpacity
          style={[styles.button, styles.successButton]}
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
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#222',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    textAlign: 'right',
  },
  actionButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  successButton: {
    backgroundColor: '#28A745',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#D9534F',
  },
});
