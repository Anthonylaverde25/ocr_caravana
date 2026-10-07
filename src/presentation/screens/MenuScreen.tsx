import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ClipboardList, Truck, ChevronRight, LucideIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, radius, shadow } from '../reader/theme';
import { AppHeader } from '../components/AppHeader';
import { MenuFooter } from '../components/menu/MenuFooter';
import { SectionHeader } from '../components/ui/SectionHeader';

interface MenuModule {
  route: string;
  icon: LucideIcon;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  action: string;
}

const MODULES: MenuModule[] = [
  {
    route: 'OperationsScreen',
    icon: ClipboardList,
    tag: 'Actividades de campo',
    title: 'Operaciones',
    subtitle: 'Manga, reproducción, sanidad y logística',
    description: 'Pesadas, condición corporal, tacto, ecografía, partos y planes de vacunación.',
    action: 'Ver catálogo de operaciones',
  },
  {
    route: 'DteScreen',
    icon: Truck,
    tag: 'SENASA y guías',
    title: 'DTe / Recepciones',
    subtitle: 'Control de hacienda y guías de tránsito',
    description: 'Hacienda en tránsito, compras externas, verificación de caravanas y recepción con DTe.',
    action: 'Ver tropas y documentos',
  },
];

export function MenuScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.screenWrapper}>
      <AppHeader title="Menú" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionHeader
          title="Módulos principales"
          meta={<Text style={styles.sectionSubtitle}>Elegí la actividad o consulta a realizar en la manga.</Text>}
        />

        {MODULES.map(({ route, icon: Icon, tag, title, subtitle, description, action }) => (
          <TouchableOpacity
            key={route}
            style={styles.card}
            onPress={() => navigation.navigate(route)}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <View style={styles.iconCircle}>
                <Icon size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.tag}>{tag}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
              <Text style={styles.cardDescription}>{description}</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.footerAction}>{action}</Text>
              <View style={styles.chevronCircle}>
                <ChevronRight size={16} color={colors.onPrimary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <MenuFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },
  sectionSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, gap: 14, ...shadow.card },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  cardBody: { gap: 3 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 20, color: colors.text },
  cardSubtitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  cardDescription: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  footerAction: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
