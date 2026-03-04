import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface DateTimePickerModalProps {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CENTER_OFFSET = 88;

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  value,
  onConfirm,
  onCancel,
}) => {
  const [currentDate, setCurrentDate] = useState(value);
  const [selectedYear, setSelectedYear] = useState(value.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedDay, setSelectedDay] = useState(value.getDate());
  const [selectedHour, setSelectedHour] = useState(value.getHours());
  const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());
  const [step, setStep] = useState<'date' | 'time'>('date');
  
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setCurrentDate(value);
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
      setSelectedDay(value.getDate());
      setSelectedHour(value.getHours());
      setSelectedMinute(value.getMinutes());
      setStep('date');
    }
  }, [visible, value]);

  const [timePickerReady, setTimePickerReady] = useState(false);

  useEffect(() => {
    if (step === 'time') {
      setTimePickerReady(false);
      const timer = setTimeout(() => {
        setTimePickerReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'time' && timePickerReady && hourScrollRef.current && minuteScrollRef.current) {
      const hourY = selectedHour * ITEM_HEIGHT;
      const minuteY = selectedMinute * ITEM_HEIGHT;
      hourScrollRef.current.scrollTo({ y: hourY, animated: false });
      minuteScrollRef.current.scrollTo({ y: minuteY, animated: false });
    }
  }, [step, timePickerReady, selectedHour, selectedMinute]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const today = new Date();
    const isCurrentMonth = 
      selectedYear === today.getFullYear() && 
      selectedMonth === today.getMonth();

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.monthSelector}>
          <TouchableOpacity
            onPress={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
            style={styles.monthArrow}
          >
            <Text style={styles.monthArrowText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {selectedYear}年 {selectedMonth + 1}月
          </Text>
          
          <TouchableOpacity
            onPress={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
            style={styles.monthArrow}
          >
            <Text style={styles.monthArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((day, index) => (
            <Text key={index} style={styles.weekdayText}>{day}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days.map((day, index) => {
            const isToday = day === today.getDate() && isCurrentMonth;
            const isSelected = day === selectedDay;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day === null && styles.emptyDayCell,
                  isSelected && styles.selectedDayCell,
                  isToday && !isSelected && styles.todayCell,
                ]}
                onPress={() => day && handleDaySelect(day)}
                disabled={day === null}
              >
                <View 
                  style={[
                    styles.dayCellInner,
                    isSelected && styles.dayCellInnerSelected,
                    isToday && !isSelected && styles.dayCellInnerToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      day === null && styles.emptyDayText,
                      isToday && !isSelected && styles.todayText,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderTimePicker = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleHourScroll = (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const selectedHour = Math.round(offsetY / ITEM_HEIGHT);
      if (selectedHour >= 0 && selectedHour < 24) {
        setSelectedHour(selectedHour);
      }
    };

    const handleMinuteScroll = (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const selectedMinute = Math.round(offsetY / ITEM_HEIGHT);
      if (selectedMinute >= 0 && selectedMinute < 60) {
        setSelectedMinute(selectedMinute);
      }
    };

    return (
      <View style={styles.timeContainer}>
        <View style={styles.timeHeader}>
          <TouchableOpacity
            onPress={() => setStep('date')}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>‹ 返回日期</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectedDateDisplay}>
          <Text style={styles.selectedDateText}>
            {selectedYear}年 {selectedMonth + 1}月 {selectedDay}日
          </Text>
        </View>

        <View style={styles.pickerRow}>
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>时</Text>
            <ScrollView
              ref={hourScrollRef}
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pickerScrollContent}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleHourScroll}
              onScrollEndDrag={handleHourScroll}
            >
              {hours.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.pickerItem,
                    hour === selectedHour && styles.pickerItemSelected,
                  ]}
                  onPress={() => setSelectedHour(hour)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      hour === selectedHour && styles.pickerItemTextSelected,
                    ]}
                  >
                    {String(hour).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.separatorContainer}>
            <Text style={styles.pickerLabel}> </Text>
            <View style={styles.separatorInner}>
              <Text style={styles.timeSeparator}>:</Text>
            </View>
          </View>

          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>分</Text>
            <ScrollView
              ref={minuteScrollRef}
              style={styles.pickerScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pickerScrollContent}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleMinuteScroll}
              onScrollEndDrag={handleMinuteScroll}
            >
              {minutes.map((minute) => (
                <TouchableOpacity
                  key={minute}
                  style={[
                    styles.pickerItem,
                    minute === selectedMinute && styles.pickerItemSelected,
                  ]}
                  onPress={() => setSelectedMinute(minute)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      minute === selectedMinute && styles.pickerItemTextSelected,
                    ]}
                  >
                    {String(minute).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setStep('time');
  };

  const handleConfirm = () => {
    const newDate = new Date(
      selectedYear,
      selectedMonth,
      selectedDay,
      selectedHour,
      selectedMinute
    );
    onConfirm(newDate);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={styles.header}>
            <View style={styles.headerButton} />
            <Text style={styles.title}>
              {step === 'date' ? '选择日期' : '选择时间'}
            </Text>
            <View style={styles.headerButton} />
          </View>

          {step === 'date' ? renderCalendar() : renderTimePicker()}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerButton: {
    padding: spacing.sm,
    minWidth: 60,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  calendarContainer: {
    padding: spacing.md,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  monthArrow: {
    padding: spacing.sm,
  },
  monthArrowText: {
    fontSize: 28,
    color: colors.accent,
    fontWeight: '300',
  },
  monthText: {
    ...typography.h2,
    color: colors.text.primary,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.text.secondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellInnerSelected: {
    backgroundColor: colors.accent,
  },
  dayCellInnerToday: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  emptyDayCell: {
    opacity: 0,
  },
  selectedDayCell: {},
  todayCell: {},
  dayText: {
    ...typography.body,
    color: colors.text.primary,
  },
  emptyDayText: {
    color: 'transparent',
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: '600',
  },
  todayText: {
    color: colors.accent,
  },
  timeContainer: {
    padding: spacing.md,
  },
  timeHeader: {
    marginBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonText: {
    ...typography.body,
    color: colors.accent,
  },
  selectedDateDisplay: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectedDateText: {
    ...typography.h3,
    color: colors.accent,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerColumn: {
    alignItems: 'center',
    width: 80,
  },
  pickerLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  pickerScroll: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 80,
  },
  pickerScrollContent: {
    paddingTop: ITEM_HEIGHT * 2,
    paddingBottom: ITEM_HEIGHT * 2,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  pickerItemSelected: {
    backgroundColor: colors.accent + '20',
  },
  pickerItemText: {
    ...typography.h3,
    color: colors.text.primary,
  },
  pickerItemTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  separatorContainer: {
    alignItems: 'center',
  },
  separatorInner: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSeparator: {
    fontSize: 32,
    color: colors.text.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});

export default DateTimePickerModal;
