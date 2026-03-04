import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from '../components/DateTimePickerModal';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackScreenProps } from '../navigation/types';
import { TicketStorage } from '../services/storage';
import { MovieTicket } from '../types';

type EditScreenProps = RootStackScreenProps<'Edit'>;

export const EditScreen: React.FC<EditScreenProps> = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const insets = useSafeAreaInsets();
  const [ticket, setTicket] = useState<MovieTicket | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    location: '',
    peopleCount: 1,
    price: '',
    thoughts: '',
    dateTime: new Date(),
    userImages: [] as string[],
  });

  useEffect(() => {
    const loadTicket = async () => {
      const data = await TicketStorage.getById(ticketId);
      if (data) {
        setTicket(data);
        setFormData({
          location: data.location,
          peopleCount: data.peopleCount,
          price: data.price.toString(),
          thoughts: data.thoughts,
          dateTime: new Date(data.dateTime),
          userImages: data.userImages || [],
        });
      }
    };
    loadTicket();
  }, [ticketId]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dateTime: selectedDate });
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('权限不足', '需要访问相册的权限');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({
        ...formData,
        userImages: [...formData.userImages, result.assets[0].uri],
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.userImages];
    newImages.splice(index, 1);
    setFormData({ ...formData, userImages: newImages });
  };

  const handleSave = async () => {
    if (!ticket) return;

    const updatedTicket: MovieTicket = {
      ...ticket,
      location: formData.location,
      peopleCount: formData.peopleCount,
      price: parseFloat(formData.price) || 0,
      thoughts: formData.thoughts,
      dateTime: formData.dateTime.toISOString(),
      userImages: formData.userImages,
    };

    try {
      await TicketStorage.update(updatedTicket);
      Alert.alert('保存成功', '已更新观影记录', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('保存失败', '请稍后重试');
    }
  };

  const formatDateTime = (date: Date) => {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>观影信息</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>观影时间</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateInputText}>{formatDateTime(formData.dateTime)}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              visible={showDatePicker}
              value={formData.dateTime}
              onConfirm={(date) => {
                setFormData({ ...formData, dateTime: date });
                setShowDatePicker(false);
              }}
              onCancel={() => setShowDatePicker(false)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>地点</Text>
            <TextInput
              style={styles.textInput}
              placeholder="在哪儿看的？"
              placeholderTextColor={colors.gray[400]}
              value={formData.location}
              onChangeText={(text: string) => setFormData({ ...formData, location: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>人数</Text>
            <View style={styles.stepper}>
              <TouchableOpacity 
                style={styles.stepperButton}
                onPress={() => setFormData({ ...formData, peopleCount: Math.max(1, formData.peopleCount - 1) })}
              >
                <Text style={styles.stepperButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{formData.peopleCount}</Text>
              <TouchableOpacity 
                style={styles.stepperButton}
                onPress={() => setFormData({ ...formData, peopleCount: formData.peopleCount + 1 })}
              >
                <Text style={styles.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>价格 (元)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="花了多少钱？"
              placeholderTextColor={colors.gray[400]}
              value={formData.price}
              onChangeText={(text: string) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>感想</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="写下你的观影感受..."
              placeholderTextColor={colors.gray[400]}
              value={formData.thoughts}
              onChangeText={(text: string) => setFormData({ ...formData, thoughts: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>上传照片</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImage}>
              <Text style={styles.imagePickerText}>+ 添加照片</Text>
            </TouchableOpacity>
            {formData.userImages.length > 0 && (
              <View style={styles.imageList}>
                {formData.userImages.map((uri: string, index: number) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.userImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={{ height: insets.bottom + 80 }} />
      </ScrollView>

      <View style={[styles.submitButtonContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
          <Text style={styles.submitButtonText}>保存修改</Text>
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  formSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text.primary,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
  },
  dateInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  dateInputText: {
    ...typography.body,
    color: colors.text.primary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignSelf: 'flex-start',
  },
  stepperButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonText: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: '600',
  },
  stepperValue: {
    ...typography.h3,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    minWidth: 40,
    textAlign: 'center',
  },
  imagePickerButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
    padding: spacing.md,
    alignItems: 'center',
  },
  imagePickerText: {
    ...typography.body,
    color: colors.accent,
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  imageContainer: {
    position: 'relative',
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingTop: 0,
    backgroundColor: colors.background,
  },
  submitButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
});

export default EditScreen;
