import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../theme';
import { RootStackScreenProps } from '../navigation/types';
import { TicketStorage } from '../services/storage';
import { Feedback } from '../types';

type FeedbackScreenProps = RootStackScreenProps<'Feedback'>;

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请填写反馈内容');
      return;
    }

    setSubmitting(true);

    try {
      const feedback: Feedback = {
        id: Date.now().toString(),
        content: content.trim(),
        createdAt: Date.now(),
      };

      await TicketStorage.saveFeedback(feedback);
      
      Alert.alert('提交成功', '感谢您的反馈！', [
        { text: '确定', onPress: () => {
          setContent('');
          navigation.goBack();
        }}
      ]);
    } catch (error) {
      Alert.alert('提交失败', '请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>意见反馈</Text>
            <Text style={styles.subtitle}>请告诉我们您的建议和意见</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.textInput}
              placeholder="请输入您的意见或建议..."
              placeholderTextColor={colors.gray[400]}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? '提交中...' : '提交反馈'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  form: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    height: 200,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
});

export default FeedbackScreen;
