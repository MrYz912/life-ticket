import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { colors, spacing, borderRadius, typography } from '../theme';
import { MovieTicket } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TICKET_WIDTH = SCREEN_WIDTH * 0.75;
const TICKET_HEIGHT = TICKET_WIDTH * 1.6;

interface TicketCardProps {
  ticket: MovieTicket;
  onPress?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onPress }) => {
  const viewShotRef = useRef<ViewShot>(null);
  const [saving, setSaving] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleSaveToGallery = async () => {
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要保存图片的权限');
        return;
      }

      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('保存成功', '已保存到相册');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('保存失败', '请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1 }}
        style={styles.viewShot}
      >
        <View style={styles.ticket}>
          <View style={styles.ticketTop}>
            <Image
              source={{ uri: ticket.posterUrl }}
              style={styles.poster}
              resizeMode="cover"
            />
          </View>
          
          <View style={styles.ticketBottom}>
            <View style={styles.infoSection}>
              <Text style={styles.movieTitle} numberOfLines={2}>{ticket.movieTitle}</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>观影日期</Text>
                  <Text style={styles.infoValue}>{formatDate(ticket.dateTime)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>观影时间</Text>
                  <Text style={styles.infoValue}>{formatTime(ticket.dateTime)}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>观影地点</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{ticket.location}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>票价</Text>
                  <Text style={styles.infoValue}>¥{ticket.price}</Text>
                </View>
              </View>

              {ticket.peopleCount > 1 && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>观影人数</Text>
                    <Text style={styles.infoValue}>{ticket.peopleCount}人</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ViewShot>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSaveToGallery}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? '保存中...' : '保存到相册'}</Text>
        </TouchableOpacity>
        
        {onPress && (
          <TouchableOpacity style={styles.detailButton} onPress={onPress}>
            <Text style={styles.detailButtonText}>查看详情</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  viewShot: {
    width: TICKET_WIDTH,
    height: TICKET_HEIGHT,
  },
  ticket: {
    width: TICKET_WIDTH,
    height: TICKET_HEIGHT,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ticketTop: {
    height: '60%',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  ticketBottom: {
    height: '40%',
    padding: spacing.md,
    justifyContent: 'center',
  },
  infoSection: {
    flex: 1,
  },
  movieTitle: {
    ...typography.h2,
    color: colors.accent,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    ...typography.small,
    color: colors.gray[500],
    marginBottom: 2,
  },
  infoValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 200,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
  detailButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 200,
    alignItems: 'center',
  },
  detailButtonText: {
    color: colors.accent,
    ...typography.body,
    fontWeight: '600',
  },
});

export default TicketCard;
