import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Colors from './Shared/Colors'

interface AcceptedInsuranceSectionProps {
  insuranceProviders: string[];
}

const AcceptedInsuranceSection: React.FC<AcceptedInsuranceSectionProps> = ({ insuranceProviders }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Accepted Insurance Providers</Text>
      <View style={styles.insuranceContainer}>
        {insuranceProviders.map((provider, index) => (
          <Pressable key={index} style={styles.card}>
            <Text style={styles.cardText}>{provider}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  insuranceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    marginRight: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#f9f9f9',
  },
});

export default AcceptedInsuranceSection;
