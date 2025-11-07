import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

type FilterValue = 'all' | 'unread' | 'application' | 'alert';

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Non lues', value: 'unread' },
  { label: 'Candidatures', value: 'application' },
  { label: 'Alertes', value: 'alert' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { user, markNotificationRead, markAllNotificationsRead, removeNotification } = useAuth();
  const [filter, setFilter] = useState<FilterValue>('all');
  const { showToast } = useToast();
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  const notifications = useMemo(() => {
    if (!user) {
      return [];
    }

    return user.notifications.filter((notification) => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !notification.read;
      return notification.type === filter;
    });
  }, [filter, user]);

  if (!user) {
    return null;
  }

  const pendingNotification = notificationToDelete
    ? user.notifications.find((item) => item.id === notificationToDelete)
    : null;

  const handleNotificationPress = (notificationId: string) => {
    const notification = user.notifications.find((item) => item.id === notificationId);
    if (!notification) {
      return;
    }

    markNotificationRead(notificationId);

    if (!notification.link) {
      return;
    }

    switch (notification.link.type) {
      case 'application':
        router.push({ pathname: '/(tabs)/applications/[id]', params: { id: notification.link.applicationId } });
        break;
      case 'alert':
        router.push({ pathname: '/search', params: { alertId: notification.link.alertId } });
        break;
      case 'job':
        router.push({ pathname: '/jobs/[id]', params: { id: notification.link.jobId } });
        break;
      default:
        break;
    }
  };

  const requestDelete = (notificationId: string) => {
    setNotificationToDelete(notificationId);
  };

  const closeDialog = () => setNotificationToDelete(null);

  const confirmDelete = () => {
    if (!notificationToDelete) {
      return;
    }

    removeNotification(notificationToDelete);
    showToast({ message: 'Notification supprimée.', type: 'success' });
    setNotificationToDelete(null);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <IconSymbol name="tray.full.fill" size={22} color={Colors.light.tint} />;
      case 'alert':
        return <IconSymbol name="bell.badge.fill" size={22} color={Colors.light.tint} />;
      default:
        return <IconSymbol name="star.fill" size={22} color={Colors.light.tint} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Pressable
          onPress={markAllNotificationsRead}
          style={({ pressed }) => [styles.markAll, pressed && styles.pressed]}
          accessibilityRole="button">
          <IconSymbol name="checkmark.seal.fill" size={18} color={Colors.light.tint} />
          <Text style={styles.markAllText}>Tout marquer comme lu</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((item) => {
          const isActive = item.value === filter;
          return (
            <Pressable
              key={item.value}
              onPress={() => setFilter(item.value)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              accessibilityRole="button">
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isUnread = !item.read;
          return (
            <Pressable
              onPress={() => handleNotificationPress(item.id)}
              style={[styles.notificationCard, isUnread && styles.notificationUnread]}
              accessibilityRole="button">
              <View style={styles.iconContainer}>{renderIcon(item.type)}</View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationDate}>{item.date}</Text>
                </View>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                {isUnread && <Text style={styles.unreadBadge}>Nouvelle</Text>}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={(event: GestureResponderEvent) => {
                  event.stopPropagation();
                  requestDelete(item.id);
                }}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                hitSlop={8}>
                <IconSymbol name="trash" size={18} color="#D13C3C" />
              </Pressable>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="bell.badge.fill" size={36} color={Colors.light.tint} />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySubtitle}>
              Revenez bientôt, de nouvelles opportunités arrivent chaque jour.
            </Text>
          </View>
        }
      />

      <ConfirmationDialog
        visible={Boolean(notificationToDelete)}
        title="Supprimer la notification"
        description={
          pendingNotification
            ? `Voulez-vous retirer la notification « ${pendingNotification.title} » ?`
            : 'Voulez-vous retirer cette notification ?'
        }
        confirmLabel="Supprimer"
        destructive
        onCancel={closeDialog}
        onConfirm={confirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  markAllText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E9ECF3',
  },
  filterChipActive: {
    backgroundColor: Colors.light.tint,
  },
  filterChipText: {
    fontSize: 14,
    color: '#5B6670',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  list: {
    gap: 12,
    paddingBottom: 32,
  },
  notificationCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    alignItems: 'flex-start',
  },
  notificationUnread: {
    borderWidth: 1,
    borderColor: '#D7E5FF',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 6,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#FFE6E6',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
    paddingRight: 12,
  },
  notificationDate: {
    fontSize: 12,
    color: '#8A929A',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4A545E',
    lineHeight: 20,
  },
  unreadBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#FFE4D8',
    color: '#FF7844',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    marginTop: 80,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#5B6670',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.85,
  },
});
