import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL, errorMessage } from '../../../infrastructure/api/ApiClient';
import { login } from '../../../infrastructure/api/AuthApi';
import { useReader } from '../ReaderContext';
import { colors, common } from '../theme';

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
    <SafeAreaView style={common.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[common.content, { flex: 1, justifyContent: 'center' }]}>
        <Text style={common.title}>Lector de caravanas</Text>
        <Text style={common.muted}>Ingresá con tu usuario del sistema para dar de alta animales desde la manga.</Text>
        <View style={common.card}>
          <TextInput style={common.input} placeholder="Email" autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={common.input} placeholder="Contraseña" secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="password" value={password} onChangeText={setPassword} onSubmitEditing={submit} />
          {error && <Text style={{ color: colors.danger }}>{error}</Text>}
          <TouchableOpacity style={[common.button, (busy || !email || !password) && common.buttonDisabled]} disabled={busy || !email || !password} onPress={submit}>
            {busy ? <ActivityIndicator color="white" /> : <Text style={common.buttonText}>Ingresar</Text>}
          </TouchableOpacity>
        </View>
        <Text style={common.muted}>Servidor: {API_URL || 'sin configurar (EXPO_PUBLIC_API_URL)'}</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
