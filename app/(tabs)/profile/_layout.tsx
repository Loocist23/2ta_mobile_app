import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitleVisible: false,
        headerTintColor: '#1B6AE5',
        headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        contentStyle: { backgroundColor: '#F5F6F8' },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Modifier mon profil' }} />
      <Stack.Screen name="documents" options={{ title: 'Mes CV & documents' }} />
      <Stack.Screen name="alerts" options={{ title: 'Mes alertes' }} />
      <Stack.Screen name="alert-editor" options={{ title: 'Éditer une alerte' }} />
      <Stack.Screen name="security" options={{ title: 'Sécurité & mot de passe' }} />
    </Stack>
  );
}
