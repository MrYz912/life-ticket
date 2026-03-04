import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackScreenProps } from '../navigation/types';
import { TicketStorage } from '../services/storage';
import { MovieTicket } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type DetailScreenProps = RootStackScreenProps<'Detail'>;

export const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const insets = useSafeAreaInsets();
  const [ticket, setTicket] = useState<MovieTicket | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);

  useEffect(() => {
    const loadTicket = async () => {
      const data = await TicketStorage.getById(ticketId);
      setTicket(data);
      if (data) {
        const fav = await TicketStorage.isFavorite(ticketId);
        setIsFavorite(fav);
      }
    };
    loadTicket();
  }, [ticketId]);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const dateStrFormatted = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return { date: dateStrFormatted, time: timeStr };
  };

  const handleToggleFavorite = async () => {
    if (!ticket) return;

    if (isFavorite) {
      await TicketStorage.removeFavorite(ticketId);
      setIsFavorite(false);
    } else {
      await TicketStorage.addFavorite(ticket);
      setIsFavorite(true);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '确认删除',
      '确定要删除这条观影记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await TicketStorage.delete(ticketId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('Edit', { ticketId });
  };

  if (!ticket) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { date, time } = formatDateTime(ticket.dateTime);
  const allImages = [ticket.posterUrl, ...ticket.userImages].filter(Boolean);

  const renderImage = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity onPress={() => setSelectedImageIndex(index)} activeOpacity={0.9}>
      <Image source={{ uri: item }} style={styles.pagerImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          {allImages.length > 0 ? (
            <FlatList
              data={allImages}
              renderItem={renderImage}
              keyExtractor={(_item: string, index: number) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.flatList}
            />
          ) : (
            <View style={styles.noImage}>
              <Text style={styles.noImageText}>暂无图片</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.movieTitle}>{ticket.movieTitle}</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>观影日期</Text>
              <Text style={styles.infoValue}>{date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>观影时间</Text>
              <Text style={styles.infoValue}>{time}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>观影地点</Text>
              <Text style={styles.infoValue}>{ticket.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>观影人数</Text>
              <Text style={styles.infoValue}>{ticket.peopleCount}人</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>票价</Text>
              <Text style={styles.infoValue}>¥{ticket.price}</Text>
            </View>
          </View>

          <View style={styles.thoughtsSection}>
            <Text style={styles.sectionTitle}>观影感想</Text>
            <Text style={styles.thoughtsText}>{ticket.thoughts || '暂无感想'}</Text>
          </View>
        </View>

        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.visualizerButton} onPress={() => navigation.navigate('TicketVisualizer', { ticketId })}>
          <Text style={styles.visualizerButtonText}>查看纪念票</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
          onPress={handleToggleFavorite}
        >
          <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>
            {isFavorite ? '已收藏' : '收藏'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>编辑</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>删除</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={selectedImageIndex >= 0}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImageIndex(-1)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedImageIndex(-1)}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedImageIndex(-1)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          {selectedImageIndex >= 0 && (
            <Image 
              source={{ uri: allImages[selectedImageIndex] }} 
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  imageSection: {
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: colors.black,
  },
  flatList: {
    flex: 1,
  },
  pagerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.2,
  },
  noImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[200],
  },
  noImageText: {
    ...typography.body,
    color: colors.gray[500],
  },
  content: {
    padding: spacing.lg,
  },
  movieTitle: {
    ...typography.h1,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoItem: {
    width: '50%',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  thoughtsSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.accent,
    marginBottom: spacing.md,
  },
  thoughtsText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  favoriteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  favoriteButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10',
  },
  favoriteText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  favoriteTextActive: {
    color: colors.accent,
  },
  visualizerButton: {
    flex: 2,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  visualizerButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.accent,
    ...typography.body,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.gray[500],
    ...typography.body,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
});

export default DetailScreen;
