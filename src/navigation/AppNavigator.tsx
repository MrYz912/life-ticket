import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, MainTabParamList } from './types';
import { colors, typography } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import AddScreen from '../screens/AddScreen';
import AddDetailScreen from '../screens/AddDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TicketVisualizerScreen from '../screens/TicketVisualizerScreen';
import DetailScreen from '../screens/DetailScreen';
import EditScreen from '../screens/EditScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => {
  const icons: Record<string, string> = {
    Home: '🎬',
    Add: '➕',
    Profile: '👤',
  };
  
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icons[name]}
      </Text>
    </View>
  );
};

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: [styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8), height: 60 + Math.max(insets.bottom, 8) }],
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: colors.accent,
      })}
    >
      <Tab.Screen 
        name="Home" 
        options={{ 
          title: '票夹',
          headerTitle: '我的票夹',
        }}
        component={HomeScreen}
      />
      <Tab.Screen 
        name="Add" 
        options={{ 
          title: '添加',
          headerTitle: '添加观影记录',
        }}
        component={AddScreen}
      />
      <Tab.Screen 
        name="Profile" 
        options={{ 
          title: '我的',
          headerTitle: '个人中心',
        }}
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTintColor: colors.accent,
          headerBackTitle: '返回',
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TicketVisualizer" 
          component={TicketVisualizerScreen}
          options={{ 
            title: '纪念票',
            headerTransparent: true,
          }}
        />
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen}
          options={{ 
            title: '详情',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen 
          name="Edit" 
          component={EditScreen}
          options={{ 
            title: '编辑',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen 
          name="AddDetail" 
          component={AddDetailScreen}
          options={{ 
            title: '添加观影记录',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen}
          options={{ 
            title: '我的收藏',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen 
          name="Feedback" 
          component={FeedbackScreen}
          options={{ 
            title: '意见反馈',
            headerBackTitle: '返回',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.gray[200],
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabBarLabel: {
    ...typography.caption,
    marginTop: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
  header: {
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.accent,
  },
});
