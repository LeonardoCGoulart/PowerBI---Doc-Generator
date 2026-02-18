// Types para estrutura de arquivos .pbip
export interface BusinessRule {
  id: string;
  title: string;
  description: string;
}

export interface PageExplanation {
  id: string;
  title: string;
  objective: string;
  kpis: string;
  filters: string;
  observations: string;
}

export interface DashboardObjective {
  description: string;
  problemResolved: string;
  decisionHelper: string;
  targetAudience: string;
  mainQuestion: string;
}

export interface PBIPMetadata {
  title: string;
  area?: string; // New: Area do dashboard
  author?: string;
  createdDate?: Date;
  lastModified?: Date;
  description?: string;

  // New Professional Fields
  objective?: DashboardObjective;
  updateFrequency?: string;
  businessRules?: BusinessRule[];
  pageExplanations?: PageExplanation[];
  hasRLS?: boolean;
}

export interface DaxMeasure {
  name: string;
  formula: string;
  table: string;
  description: string;
  formatString?: string;
}

export interface TableInfo {
  name: string;
  columns: string[];
  measureCount: number;
}

export interface Relationship {
  from: string;
  to: string;
  fromColumn: string;
  toColumn: string;
  cardinality: '1:1' | '1:N' | 'N:1' | 'N:N';
  crossFilterDirection: 'Single' | 'Both';
  isActive: boolean;
}

export interface PBIPData {
  metadata: PBIPMetadata;
  measures: DaxMeasure[];
  tables: TableInfo[];
  relationships: Relationship[];
}
