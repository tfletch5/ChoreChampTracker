import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, Transaction } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { fetchWalletBalance, addFunds, withdrawFunds, fetchTransactions } from '../../store/slices/walletSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { createPaymentSheet, presentPaymentSheet } from '../../services/stripe';

const WalletManager: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: AppState) => state.auth);
  const { balance, transactions, loading } = useSelector((state: AppState) => state.wallet);
  const { children } = useSelector((state: AppState) => state.children);
  
  const [amount, setAmount] = useState('');
  const [addingFunds, setAddingFunds] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user?.uid) {
      loadWalletData();
    }
  }, [user?.uid]);

  useEffect(() => {
    setTransactionHistory(Object.values(transactions).sort((a, b) => b.createdAt - a.createdAt));
  }, [transactions]);

  const loadWalletData = () => {
    if (user?.uid) {
      dispatch(fetchWalletBalance(user.uid));
      dispatch(fetchTransactions(user.uid));
    }
  };

  const handleAddFunds = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setPaymentLoading(true);
    try {
      // Convert amount to cents
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      // Initialize Stripe payment
      const { error: initError } = await createPaymentSheet({
        amount: amountInCents,
        description: 'ChoreChamp Wallet Top-up',
      });
      
      if (initError) {
        throw new Error(initError.message);
      }
      
      // Present payment sheet to user
      const { error: paymentError } = await presentPaymentSheet();
      
      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          throw new Error(paymentError.message);
        }
        return; // User canceled payment
      }
      
      // If payment successful, update wallet
      await dispatch(addFunds({
        amount: amountInCents,
        parentId: user!.uid,
        description: 'Wallet top-up',
      }));
      
      setAmount('');
      Alert.alert('Success', 'Funds added successfully');
      
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleWithdrawFunds = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    if (amountInCents > balance) {
      Alert.alert('Insufficient Funds', 'The withdrawal amount exceeds your available balance');
      return;
    }

    setWithdrawing(true);
    try {
      await dispatch(withdrawFunds({
        amount: amountInCents,
        parentId: user!.uid,
        description: 'Wallet withdrawal',
      }));
      
      setAmount('');
      Alert.alert('Success', 'Withdraw request submitted successfully');
    } catch (error: any) {
      Alert.alert('Withdrawal Failed', error.message);
    } finally {
      setWithdrawing(false);
    }
  };

  const getChildNameById = (childId?: string) => {
    if (!childId) return 'N/A';
    return children[childId]?.name || 'Unknown child';
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Feather name="arrow-down" size={20} color={theme.colors.success} />;
      case 'withdrawal':
        return <Feather name="arrow-up" size={20} color={theme.colors.error} />;
      case 'reward':
        return <Feather name="gift" size={20} color={theme.colors.warning} />;
      default:
        return <Feather name="dollar-sign" size={20} color={theme.colors.textSecondary} />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balance / 100)}</Text>
        <Text style={styles.balanceDescription}>
          This is the amount available for cash rewards and payouts to children.
        </Text>
      </Card>
      
      <View style={styles.actionContainer}>
        <View style={styles.fundingSection}>
          <Text style={styles.sectionTitle}>Manage Funds</Text>
          
          <Input
            label="Amount"
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            leftIcon={<Feather name="dollar-sign" size={20} color={theme.colors.textSecondary} />}
          />
          
          <View style={styles.buttonContainer}>
            <Button
              title="Add Funds"
              onPress={() => setAddingFunds(true)}
              type="primary"
              style={styles.actionButton}
              loading={paymentLoading}
              icon={<Feather name="plus" size={18} color="#fff" style={{ marginRight: 8 }} />}
            />
            <Button
              title="Withdraw"
              onPress={() => setWithdrawing(true)}
              type="outline"
              style={styles.actionButton}
              loading={withdrawing}
              icon={<Feather name="minus" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />}
            />
          </View>
        </View>
      </View>
      
      {addingFunds && (
        <Card style={styles.confirmationCard}>
          <Text style={styles.confirmationTitle}>Confirm Add Funds</Text>
          <Text style={styles.confirmationAmount}>{formatCurrency(parseFloat(amount) || 0)}</Text>
          <Text style={styles.confirmationDescription}>
            You are about to add funds to your ChoreChamp wallet. This amount will be available for rewards and payouts.
          </Text>
          
          <View style={styles.confirmationButtons}>
            <Button
              title="Cancel"
              onPress={() => setAddingFunds(false)}
              type="outline"
              style={styles.confirmButton}
            />
            <Button
              title="Confirm"
              onPress={handleAddFunds}
              type="primary"
              style={styles.confirmButton}
              loading={paymentLoading}
            />
          </View>
        </Card>
      )}
      
      {withdrawing && (
        <Card style={styles.confirmationCard}>
          <Text style={styles.confirmationTitle}>Confirm Withdrawal</Text>
          <Text style={styles.confirmationAmount}>{formatCurrency(parseFloat(amount) || 0)}</Text>
          <Text style={styles.confirmationDescription}>
            You are about to withdraw funds from your ChoreChamp wallet. This amount will be transferred to your linked bank account.
          </Text>
          
          <View style={styles.confirmationButtons}>
            <Button
              title="Cancel"
              onPress={() => setWithdrawing(false)}
              type="outline"
              style={styles.confirmButton}
            />
            <Button
              title="Confirm"
              onPress={handleWithdrawFunds}
              type="primary"
              style={styles.confirmButton}
              loading={withdrawing}
            />
          </View>
        </Card>
      )}
      
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {transactionHistory.length === 0 ? (
          <Card style={styles.emptyTransactionsCard}>
            <Feather name="inbox" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTransactionsText}>No transactions yet</Text>
          </Card>
        ) : (
          transactionHistory.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionIcon}>
                  {getTransactionTypeIcon(transaction.type)}
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{formatDate(new Date(transaction.createdAt))}</Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  transaction.type === 'deposit' ? styles.amountPositive : 
                  transaction.type === 'withdrawal' || transaction.type === 'reward' ? styles.amountNegative : null
                ]}>
                  {transaction.type === 'deposit' ? '+' : transaction.type === 'withdrawal' || transaction.type === 'reward' ? '-' : ''}
                  {formatCurrency(transaction.amount / 100)}
                </Text>
              </View>
              
              {transaction.childId && (
                <View style={styles.transactionFooter}>
                  <Text style={styles.childName}>
                    Child: {getChildNameById(transaction.childId)}
                  </Text>
                  <Text style={[
                    styles.transactionStatus,
                    transaction.status === 'completed' ? styles.statusCompleted :
                    transaction.status === 'pending' ? styles.statusPending :
                    styles.statusFailed
                  ]}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Text>
                </View>
              )}
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  balanceCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  balanceDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionContainer: {
    marginBottom: 20,
  },
  fundingSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  confirmationCard: {
    padding: 16,
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  confirmationAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  confirmationDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  transactionsSection: {
    marginTop: 8,
  },
  emptyTransactionsCard: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTransactionsText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  transactionCard: {
    marginBottom: 10,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  transactionDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  amountPositive: {
    color: theme.colors.success,
  },
  amountNegative: {
    color: theme.colors.error,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  childName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: theme.colors.successLight,
    color: theme.colors.success,
  },
  statusPending: {
    backgroundColor: theme.colors.warningLight,
    color: theme.colors.warning,
  },
  statusFailed: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
  },
});

export default WalletManager;
