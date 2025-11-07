import { Stack } from 'expo-router';
import React from 'react';

export default function ApplicationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitleVisible: false,
        headerTintColor: '#1B6AE5',
        headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        contentStyle: { backgroundColor: '#F5F6F8' },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Nouvelle candidature' }} />
      <Stack.Screen name="[id]" options={{ title: 'Suivi de candidature' }} />
    </Stack>
  );
}
