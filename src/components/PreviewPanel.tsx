import type { PBIPData } from '../types/powerbi.types';
import './PreviewPanel.css';

interface PreviewPanelProps {
    data: PBIPData;
    onEditMetadata: (field: 'title' | 'description', value: string) => void;
    onDeleteMeasure: (index: number) => void;
    onUpdateMeasureDescription: (index: number, newDescription: string) => void;
    onDeleteRelationship: (index: number) => void;
    onDeleteTable: (index: number) => void;
}

export function PreviewPanel({
    data,
    onEditMetadata,
    onDeleteMeasure,
    onUpdateMeasureDescription,
    onDeleteRelationship,
    onDeleteTable
}: PreviewPanelProps) {
    return (
        <div className="preview-container">
            <div className="preview-header">
                <h2>Preview da Documentação</h2>
                <p>Revise e edite os dados antes de gerar o PDF</p>
            </div>

            {/* Metadados Editáveis */}
            <section className="preview-section">
                <h3>Informações Gerais</h3>
                <div className="form-group">
                    <label htmlFor="title">Título do Relatório</label>
                    <input
                        id="title"
                        type="text"
                        value={data.metadata.title}
                        onChange={(e) => onEditMetadata('title', e.target.value)}
                        className="input-field"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição</label>
                    <textarea
                        id="description"
                        value={data.metadata.description || ''}
                        onChange={(e) => onEditMetadata('description', e.target.value)}
                        className="textarea-field"
                        rows={3}
                        placeholder="Adicione uma descrição resumida do que este relatório faz..."
                    />
                </div>

                <div className="metadata-grid">
                    {data.metadata.author && (
                        <div className="metadata-item">
                            <span className="metadata-label">Autor:</span>
                            <span className="metadata-value">{data.metadata.author}</span>
                        </div>
                    )}
                    {data.metadata.lastModified && (
                        <div className="metadata-item">
                            <span className="metadata-label">Última Modificação:</span>
                            <span className="metadata-value">
                                {data.metadata.lastModified.toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* Estatísticas */}
            <section className="preview-section">
                <h3>Estatísticas</h3>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{data.tables.length}</div>
                        <div className="stat-label">Tabelas</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{data.measures.length}</div>
                        <div className="stat-label">Medidas DAX</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{data.relationships.length}</div>
                        <div className="stat-label">Relacionamentos</div>
                    </div>
                </div>
            </section>

            {/* Medidas DAX */}
            <section className="preview-section">
                <div className="section-header">
                    <h3>Medidas DAX Encontradas</h3>
                    <span className="badge">{data.measures.length}</span>
                </div>
                <div className="measures-list">
                    {data.measures.map((measure, index) => (
                        <div key={index} className="measure-item">
                            <div className="measure-header">
                                <span className="measure-name">{measure.name}</span>
                                <div className="measure-actions">
                                    <span className="measure-table">{measure.table}</span>
                                    <button
                                        onClick={() => onDeleteMeasure(index)}
                                        className="btn-icon btn-delete"
                                        title="Excluir medida"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="measure-formula">{measure.formula}</div>
                            <div className="measure-edit-description">
                                <label>Descrição:</label>
                                <textarea
                                    value={measure.description}
                                    onChange={(e) => onUpdateMeasureDescription(index, e.target.value)}
                                    rows={2}
                                    placeholder="Descreva o que esta medida calcula..."
                                />
                            </div>
                        </div>
                    ))}
                    {data.measures.length === 0 && (
                        <p className="empty-state">Nenhuma medida encontrada</p>
                    )}
                </div>
            </section>

            {/* Tabelas */}
            <section className="preview-section">
                <h3>Tabelas do Modelo</h3>
                <div className="tables-list">
                    {data.tables.map((table, index) => (
                        <div key={index} className="table-item">
                            <div className="table-header">
                                <div className="table-name">{table.name}</div>
                                <button
                                    onClick={() => onDeleteTable(index)}
                                    className="btn-icon btn-delete"
                                    title="Excluir tabela e dependências"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                            <div className="table-info">
                                {table.columns.length} colunas • {table.measureCount} medidas
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Relacionamentos */}
            <section className="preview-section">
                <h3>Relacionamentos</h3>
                {data.relationships.length > 0 ? (
                    <div className="relationships-list">
                        {data.relationships.map((rel, index) => (
                            <div key={index} className="relationship-item">
                                <div className="rel-info">
                                    <span className="rel-from">{rel.from}</span>
                                    <span className="rel-arrow">→</span>
                                    <span className="rel-to">{rel.to}</span>
                                    <span className="rel-cardinality">({rel.cardinality})</span>
                                </div>
                                <button
                                    onClick={() => onDeleteRelationship(index)}
                                    className="btn-icon btn-delete"
                                    title="Excluir relacionamento"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-state">Nenhum relacionamento definido</p>
                )}
            </section>
        </div>
    );
}
