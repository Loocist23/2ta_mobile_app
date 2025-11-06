import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { companies, partnerCompanies } from '@/constants/companies';
import { Colors } from '@/constants/theme';

export default function CompaniesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <IconSymbol name="chevron.left" size={20} color={Colors.light.tint} />
        </Pressable>
        <Text style={styles.title}>Entreprises partenaires</Text>
      </View>

      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.highlight}>
            <IconSymbol name="sparkles" size={22} color={Colors.light.tint} />
            <Text style={styles.highlightText}>
              {partnerCompanies.length} entreprises mises en avant cette semaine
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/companies/[id]', params: { id: item.id } })}>
            <View style={styles.cardHeader}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>{item.name.slice(0, 1)}</Text>
              </View>
              <View style={styles.cardTitle}>
                <Text style={styles.companyName}>{item.name}</Text>
                <Text style={styles.companyLocation}>{item.location}</Text>
              </View>
            </View>
            <Text style={styles.companyDescription} numberOfLines={3}>
              {item.description}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <IconSymbol name="building.2.fill" size={18} color={Colors.light.tint} />
                <Text style={styles.metaText}>{item.industry}</Text>
              </View>
              <View style={styles.metaItem}>
                <IconSymbol name="person.3.fill" size={18} color={Colors.light.tint} />
                <Text style={styles.metaText}>{item.employees} collaborateurs</Text>
              </View>
            </View>
            <View style={styles.footer}>
              <View style={styles.openRoles}>
                <IconSymbol name="briefcase.fill" size={18} color={Colors.light.tint} />
                <Text style={styles.openRolesText}>{item.openRoles} offre{item.openRoles > 1 ? 's' : ''}</Text>
              </View>
              <Text style={styles.cta}>Voir les offres</Text>
            </View>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
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
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  list: {
    gap: 16,
    paddingBottom: 32,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E7F0FF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF3FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  cardTitle: {
    flex: 1,
    gap: 4,
  },
  companyName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
  },
  companyLocation: {
    fontSize: 14,
    color: '#59636A',
  },
  companyDescription: {
    fontSize: 14,
    color: '#444C54',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#59636A',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openRoles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openRolesText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  cta: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
