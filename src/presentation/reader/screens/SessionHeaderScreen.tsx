import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Sex } from '../../../core/entities/RegistrationSession';
import { errorMessage } from '../../../infrastructure/api/ApiClient';
import { BatchOption, BreedOption, CatalogApi, CategoryOption } from '../../../infrastructure/api/CatalogApi';
import { ChipGroup } from '../components/ChipGroup';
import { OptionPicker } from '../components/OptionPicker';
import { useReader } from '../ReaderContext';
import { ReaderStackParams } from '../ReaderTab';
import { colors, common } from '../theme';

type Props = NativeStackScreenProps<ReaderStackParams, 'SessionHeader'>;

const today = () => new Date().toISOString().slice(0, 10);
const TEETH = [0, 2, 4, 6, 8].map((n) => ({ value: n, label: n === 0 ? 'Leche' : n === 8 ? 'Boca llena' : `${n}D` }));

/**
 * What the whole troop shares is declared once here; every animal read inherits it.
 * If a session was left half done it is offered first, so nothing read is lost.
 */
export function SessionHeaderScreen({ navigation }: Props) {
  const { auth, session, startSession, closeSession, selectCompany, signOut } = useReader();
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [breeds, setBreeds] = useState<BreedOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [batchId, setBatchId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [breedId, setBreedId] = useState<number | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [teeth, setTeeth] = useState(0);
  const [entryDate, setEntryDate] = useState(today());

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([CatalogApi.batches(), CatalogApi.categories(), CatalogApi.breeds()])
      .then(([b, c, r]) => { setBatches(b); setCategories(c); setBreeds(r); setBatchId(null); })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [auth?.company.id]);

  const category = categories.find((c) => c.id === categoryId);
  // A category that implies the sex (vaquillona, novillo…) sets it; the operator can still change it.
  useEffect(() => {
    if (category?.sex === 'M' || category?.sex === 'H') setSex(category.sex);
  }, [category?.sex]);

  if (session) {
    return (
      <View style={[common.screen, common.content]}>
        <View style={common.card}>
          <Text style={common.label}>Sesión sin terminar</Text>
          <Text style={common.body}>{session.header.batchName} · {session.readings.length} animales leídos</Text>
          <TouchableOpacity style={common.button} onPress={() => navigation.navigate(session.status === 'open' ? 'Connect' : 'Review')}>
            <Text style={common.buttonText}>Retomar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[common.button, common.buttonSecondary]}
            onPress={() => Alert.alert('Descartar sesión', 'Se pierden las lecturas que no se dieron de alta.', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Descartar', style: 'destructive', onPress: closeSession },
            ])}
          >
            <Text style={[common.buttonText, common.buttonSecondaryText]}>Descartar y empezar otra</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const batch = batches.find((b) => b.id === batchId);
  const canStart = batch !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(entryDate);

  const start = () => {
    if (!batch) return;
    startSession({
      batchId: batch.id,
      batchName: batch.name,
      categoryId,
      categoryName: category?.name ?? null,
      subcategoryId: null,
      breedId,
      sex,
      entryDate,
      defaultTeeth: teeth,
    });
    navigation.navigate('Connect');
  };

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <View style={[common.row, { justifyContent: 'space-between' }]}>
        <Text style={common.title}>Alta de animales</Text>
        <TouchableOpacity onPress={signOut}><Text style={{ color: colors.primary }}>Salir</Text></TouchableOpacity>
      </View>

      {auth && auth.companies.length > 1 && (
        <View style={common.card}>
          <Text style={common.label}>Empresa</Text>
          <ChipGroup options={auth.companies.map((c) => ({ value: c.id, label: c.name }))} value={auth.company.id} onChange={selectCompany} />
        </View>
      )}

      {loading && <ActivityIndicator />}
      {error && <Text style={{ color: colors.danger }}>No se pudieron cargar los catálogos: {error}</Text>}

      <View style={common.card}>
        <OptionPicker label="Lote destino" placeholder="Elegí el lote" value={batchId} onChange={setBatchId}
          options={batches.map((b) => ({ id: b.id, label: b.name, detail: b.activity_name }))} />
        <OptionPicker label="Categoría" placeholder="Sin categoría" optional value={categoryId} onChange={setCategoryId}
          options={categories.map((c) => ({ id: c.id, label: c.name }))} />
        <OptionPicker label="Raza" placeholder="Sin raza" optional value={breedId} onChange={setBreedId}
          options={breeds.map((b) => ({ id: b.id, label: b.name }))} />
      </View>

      <View style={common.card}>
        <Text style={common.label}>Sexo de la tropa</Text>
        <ChipGroup
          options={[{ value: 'none', label: 'Por animal' }, { value: 'M', label: 'Machos' }, { value: 'H', label: 'Hembras' }]}
          value={sex ?? 'none'}
          onChange={(v) => setSex(v === 'none' ? null : (v as Sex))}
        />
        <Text style={common.label}>Dentición por defecto</Text>
        <ChipGroup<number> options={TEETH} value={teeth} onChange={setTeeth} />
        <Text style={common.label}>Fecha de ingreso</Text>
        <TextInput style={common.input} value={entryDate} onChangeText={setEntryDate} placeholder="AAAA-MM-DD" />
      </View>

      <TouchableOpacity style={[common.button, !canStart && common.buttonDisabled]} disabled={!canStart} onPress={start}>
        <Text style={common.buttonText}>Continuar: conectar el lector</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
