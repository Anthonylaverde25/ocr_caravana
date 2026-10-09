import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimalRecord, MovementEntry, WeightEntry } from '../../../core/caravans/AnimalRecord';
import { formatEid } from '../../reader/theme';
import { FactGrid } from './FactGrid';
import { RecordHero } from './RecordHero';
import { RecordHistory } from './RecordHistory';
import { RecordReproduction } from './RecordReproduction';
import { formatDay, formatKg } from './format';

interface Props {
  record: AnimalRecord;
  weights: WeightEntry[];
  movements: MovementEntry[];
}

/** The whole record, top to bottom: who the animal is, its state, its family and its history. */
export function RecordView({ record, weights, movements }: Props) {
  const lastWeighing = weights.length > 0 ? [...weights].sort((a, b) => b.date.localeCompare(a.date))[0] : null;

  return (
    <>
      <RecordHero record={record} />
      <View style={styles.cards}>
        <FactGrid
          title="Datos clave"
          facts={[
            { label: 'Peso actual', value: formatKg(record.currentWeight), hint: lastWeighing && `Pesada del ${formatDay(lastWeighing.date)}` },
            { label: 'Dentición', value: record.teeth === null ? null : `${record.teeth} dientes` },
            { label: 'Ingreso', value: record.entryMonth },
            { label: 'Peso de ingreso', value: formatKg(record.entryWeight) },
            { label: 'Proveedor', value: record.providerName },
            { label: 'RENSPA', value: record.renspa },
          ]}
        />
        <RecordReproduction record={record} />
        {record.lineage && (
          <FactGrid
            title="Linaje"
            facts={[
              { label: 'Madre', value: record.lineage.mother && formatEid(record.lineage.mother), numeric: true },
              { label: 'Padre', value: record.lineage.father && formatEid(record.lineage.father), numeric: true },
              { label: 'Nacimiento', value: formatDay(record.lineage.birthDate) },
              ...(record.sex === 'H' ? [{ label: 'Natimortos', value: String(record.stillbornCount) }] : []),
            ]}
          />
        )}
        <RecordHistory record={record} weights={weights} movements={movements} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cards: { padding: 16, gap: 14 },
});
