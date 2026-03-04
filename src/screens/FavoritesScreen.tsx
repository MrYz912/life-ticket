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
import { RootStackScreenProps } from '../navigation/types';
import { TicketStorage } from '../services/storage';
import { MovieTicket } from '../types';

type FavoritesScreenProps = RootStackScreenProps<'Favorites'>;

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const [favorites, setFavorites] = useState<MovieTicket[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    const data = await TicketStorage.getFavorites();
    setFavorites(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
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
        <Text style={styles.ticketDate}>{formatDate(item.dateTime)}</Text>
        <Text style={styles.location}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={favorites}
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
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyTitle}>还没有收藏</Text>
            <Text style={styles.emptySubtitle}>在票夹中点击收藏按钮来添加收藏</Text>
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
  ticketDate: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.small,
    color: colors.gray[500],
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

export default FavoritesScreen;
