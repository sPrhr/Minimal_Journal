import React from 'react';
import { Tabs, usePathname } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

export default function TabLayout() {
  const { theme, isDarkMode } = useTheme();
  const pathname = usePathname();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? '#000' : theme.background,
        },
        headerTintColor: isDarkMode ? '#fff' : theme.text,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#000' : theme.background,
          borderTopColor: isDarkMode ? '#000' : theme.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: isDarkMode ? '#60a5fa' : '#007AFF',
        tabBarInactiveTintColor: isDarkMode ? '#666' : '#999',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dump your thoughts',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarItemStyle: pathname === '/' ? { display: 'none', width: 0 } : undefined
        }}
      />
      <Tabs.Screen
        name="entries"
        options={{
          title: 'Revisit thoughts',
          tabBarLabel: 'Revisit',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
          tabBarItemStyle: pathname === '/entries' ? { display: 'none', width: 0 } : undefined
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          tabBarItemStyle: pathname === '/settings' ? { display: 'none', width: 0 } : undefined
        }}
      />
    </Tabs>
  );
}
