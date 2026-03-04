import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme';
import { MainTabScreenProps } from '../navigation/types';
import { TicketStorage } from '../services/storage';
import { MovieTicket } from '../types';

type HomeScreenProps = MainTabScreenProps<'Home'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [tickets, setTickets] = useState<MovieTicket[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = useCallback(async () => {
    const data = await TicketStorage.getAll();
    const sorted = data.sort((a, b) => 
      new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
    setTickets(sorted);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [loadTickets])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  }, [loadTickets]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const renderTicket = ({ item }: { item: MovieTicket }) => (
    <TouchableOpacity 
      style={styles.ticketCard}
      onPress={() => navigation.navigate('Detail', { ticketId: item.id })}
    >
      <Image 
        source={{ uri: item.posterUrl }} 
        style={styles.poster} 
      />
      <View style={styles.ticketInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>{item.movieTitle}</Text>
        <Text style={styles.ticketDateTime}>{formatDate(item.dateTime)} {formatTime(item.dateTime)}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.thoughts} numberOfLines={2}>{item.thoughts}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderTicket}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyTitle}>还没有票券</Text>
            <Text style={styles.emptySubtitle}>点击下方添加按钮，记录你的观影之旅</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  ticketCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[200],
  },
  ticketInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  movieTitle: {
    ...typography.h3,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  ticketDateTime: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.small,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  thoughts: {
    ...typography.small,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl * 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export default HomeScreen;
