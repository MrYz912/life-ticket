import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../theme';
import { MainTabScreenProps } from '../navigation/types';
import { TicketStorage } from '../services/storage';

type ProfileScreenProps = MainTabScreenProps<'Profile'>;

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [ticketCount, setTicketCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const loadStats = async () => {
    const tickets = await TicketStorage.getCount();
    const favorites = await TicketStorage.getFavoriteCount();
    setTicketCount(tickets);
    setFavoriteCount(favorites);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const menuItems = [
    { 
      icon: '❤️', 
      title: '我的收藏', 
      value: `${favoriteCount} 张`,
      onPress: () => navigation.navigate('Favorites'),
    },
    { 
      icon: '💬', 
      title: '意见反馈', 
      value: '',
      onPress: () => navigation.navigate('Feedback'),
    },
    { 
      icon: 'ℹ️', 
      title: '关于应用', 
      value: 'v1.0.0',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>👤</Text>
        </View>
        <Text style={styles.nickname}>电影爱好者</Text>
        <Text style={styles.bio}>记录每一次观影的美好时光</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{ticketCount}</Text>
          <Text style={styles.statLabel}>票券</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{favoriteCount}</Text>
          <Text style={styles.statLabel}>收藏</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            {item.value ? <Text style={styles.menuValue}>{item.value}</Text> : <Text style={styles.menuArrow}>›</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.md,
  },
  avatar: {
    fontSize: 40,
  },
  nickname: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bio: {
    ...typography.body,
    color: colors.text.secondary,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h1,
    color: colors.accent,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.xs,
  },
  menu: {
    backgroundColor: colors.white,
    margin: spacing.md,
    marginTop: 0,
    borderRadius: borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuTitle: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  menuValue: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  menuArrow: {
    fontSize: 20,
    color: colors.gray[400],
  },
});

export default ProfileScreen;
