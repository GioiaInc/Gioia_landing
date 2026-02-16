import { ComponentType } from 'react';
import TestDocument from './test-document';
import BaloAmbientAIPlan from './balo-ambient-ai-plan';
import ExecutiveMeetingFeb15 from './executive-meeting-feb-15';

// ============================================
// REGISTER DOC CONTENT HERE
// Import your component and add it to the map
// Key must match the slug in docs-config.ts
// ============================================

export const docsContent: Record<string, ComponentType> = {
  'test-document': TestDocument,
  'balo-ambient-ai-plan': BaloAmbientAIPlan,
  'executive-meeting-feb-15': ExecutiveMeetingFeb15,
};
