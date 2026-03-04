import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { RootStackScreenProps } from '../navigation/types';
import { TicketStorage } from '../services/storage';
import { MovieTicket } from '../types';
import TicketCard from '../components/TicketCard';

type TicketVisualizerScreenProps = RootStackScreenProps<'TicketVisualizer'>;

export const TicketVisualizerScreen: React.FC<TicketVisualizerScreenProps> = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState<MovieTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTicket = async () => {
      const data = await TicketStorage.getById(ticketId);
      setTicket(data);
      setLoading(false);
    };
    loadTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>未找到票券</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <TicketCard 
          ticket={ticket} 
          onPress={() => navigation.navigate('Detail', { ticketId })}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.white,
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TicketVisualizerScreen;
