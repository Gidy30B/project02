import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import moment from 'moment';
import Colors from '../../components/Shared/Colors';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Transaction {
  id: string;
  patientName: string;
  date: string;
  amount: number;
}

const IncomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Fetch transactions from API or state
    const fetchedTransactions: Transaction[] = [
      { id: '1', patientName: 'John Doe', date: '2023-10-01', amount: 100 },
      { id: '2', patientName: 'Jane Smith', date: '2023-10-02', amount: 150 },
      // ...more transactions
    ];
    setTransactions(fetchedTransactions);
    calculateTotalIncome(fetchedTransactions);
  }, []);

  const calculateTotalIncome = (transactions: Transaction[]) => {
    const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    setTotalIncome(total);
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.transactionText}>{item.patientName}</Text>
      <Text style={styles.transactionText}>{moment(item.date).format('YYYY-MM-DD')}</Text>
      <Text style={styles.transactionText}>${item.amount}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Income Overview</Text>
      <Text style={styles.totalIncome}>Total Income: ${totalIncome}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by patient name"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noTransactionsText}>No transactions found.</Text>}
      />
      <TouchableOpacity style={styles.exportButton}>
        <Text style={styles.exportButtonText}>Export Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  totalIncome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  transactionText: {
    fontSize: 16,
    color: '#333',
  },
  noTransactionsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  exportButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1,
  },
});

export default IncomeScreen;
