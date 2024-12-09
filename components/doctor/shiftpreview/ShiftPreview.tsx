import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Shift {
  name: string;
  startTime: string;
  endTime: string;
  breaks: string;
}

interface ShiftPreviewProps {
  shifts: Shift[];
}

const ShiftPreview: React.FC<ShiftPreviewProps> = ({ shifts }) => {
  return (
    <View style={styles.shiftPreviewContainer}>
      <Text style={styles.previewTitle}>Added Shifts:</Text>
      <ScrollView style={styles.scrollableShifts}>
        {shifts.map((shift, index) => (
          <Card key={index} style={styles.shiftPreviewCard}>
            <Card.Content>
              <View style={styles.shiftHeader}>
                <Ionicons name="briefcase" size={20} color="#555" />
                <Text style={styles.shiftName}>{shift.name}</Text>
              </View>
              <View style={styles.shiftDetails}>
                <Text style={styles.shiftDetailText}>Start: {shift.startTime}</Text>
                <Text style={styles.shiftDetailText}>End: {shift.endTime}</Text>
                <Text style={styles.shiftDetailText}>Breaks: {shift.breaks}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

export default ShiftPreview;

const styles = StyleSheet.create({
  shiftPreviewContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollableShifts: {
    flex: 1,
  },
  shiftPreviewCard: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    padding: 10,
    width: '100%',
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  shiftName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  shiftDetails: {
    marginTop: 5,
  },
  shiftDetailText: {
    fontSize: 14,
    color: '#555',
  },
});