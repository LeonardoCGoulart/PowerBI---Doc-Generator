// Types para estrutura de arquivos .pbip
export interface PBIPMetadata {
  title: string;
  author?: string;
  createdDate?: Date;
  lastModified?: Date;
  description?: string;
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
