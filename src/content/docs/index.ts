import { ComponentType } from 'react';
import TestDocument from './test-document';
import BaloAmbientAIPlan from './balo-ambient-ai-plan';
import ExecutiveMeetingFeb15 from './executive-meeting-feb-15';
import ExecutiveMeetingFeb17 from './executive-meeting-feb-17';
import ExecutiveMeetingFeb19 from './executive-meeting-feb-19';
import ExecutiveMeetingFeb20 from './executive-meeting-feb-20';
import ExecutiveMeetingFeb23 from './executive-meeting-feb-23';

// ============================================
// REGISTER DOC CONTENT HERE
// Import your component and add it to the map
// Key must match the slug in docs-config.ts
// ============================================

export const docsContent: Record<string, ComponentType> = {
  'executive-meeting-feb-23': ExecutiveMeetingFeb23,
  'test-document': TestDocument,
  'balo-ambient-ai-plan': BaloAmbientAIPlan,
  'executive-meeting-feb-15': ExecutiveMeetingFeb15,
  'executive-meeting-feb-17': ExecutiveMeetingFeb17,
  'executive-meeting-feb-19': ExecutiveMeetingFeb19,
  'executive-meeting-feb-20': ExecutiveMeetingFeb20,
};
