import React from 'react';
import { LookupStatus } from '../../../core/entities/RegistrationSession';
import { StatusPill, StatusTone } from '../../components/ui/StatusPill';

const LOOK: Record<LookupStatus, { label: string; tone: StatusTone }> = {
  unchecked: { label: 'Sin verificar', tone: 'neutral' },
  not_found: { label: 'Nueva', tone: 'success' },
  own_company: { label: 'Ya registrada', tone: 'warning' },
  other_company: { label: 'De otra empresa', tone: 'danger' },
};

export function StatusChip({ status }: { status: LookupStatus }) {
  const look = LOOK[status];
  return <StatusPill label={look.label} tone={look.tone} />;
}
