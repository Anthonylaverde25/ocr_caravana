import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogIn } from 'lucide-react-native';
import { API_URL, errorMessage } from '../../../infrastructure/api/ApiClient';
import { login } from '../../../infrastructure/api/AuthApi';
import { ErpLogo } from '../../components/ErpLogo';
import { PillButton } from '../../components/ui/PillButton';
import { useReader } from '../ReaderContext';
import { colors, common, fonts, radius, shadow } from '../theme';

export function LoginScreen() {
  const { signIn } = useReader();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn(await login(email.trim(), password));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.hero}>
        <ErpLogo size={84} color={colors.onPrimary} strokeWidth={3.4} />
        <Text style={styles.brand}>RXNA Ganadero</Text>
        <Text style={styles.tagline}>Lector de caravanas para la manga</Text>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled" style={styles.sheet}>
          <Text style={common.title}>Ingresá</Text>
          <Text style={common.muted}>Usá tu usuario del sistema para dar de alta animales desde la manga.</Text>

          <View style={styles.fields}>
            <TextInput style={common.input} placeholder="Email" placeholderTextColor={colors.subtle} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={common.input} placeholder="Contraseña" placeholderTextColor={colors.subtle} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="password" value={password} onChangeText={setPassword} onSubmitEditing={submit} />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <PillButton label="Ingresar" icon={LogIn} loading={busy} disabled={!email || !password} onPress={submit} />

          <Text style={[common.muted, styles.server]}>Servidor: {API_URL || 'sin configurar (EXPO_PUBLIC_API_URL)'}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  hero: { alignItems: 'center', paddingTop: 32, paddingBottom: 40, gap: 6 },
  brand: { fontFamily: fonts.semibold, fontSize: 26, color: colors.onPrimary, marginTop: 8 },
  tagline: { fontFamily: fonts.regular, fontSize: 14, color: colors.onPrimaryMuted },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.raised,
  },
  sheetContent: { padding: 24, gap: 12 },
  fields: { gap: 10, marginTop: 8 },
  error: { fontFamily: fonts.regular, fontSize: 14, color: colors.danger },
  server: { textAlign: 'center', marginTop: 8 },
});
