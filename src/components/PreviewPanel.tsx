import type { PBIPData, DashboardObjective, BusinessRule, PageExplanation } from '../types/powerbi.types';
import './PreviewPanel.css';

interface PreviewPanelProps {
    data: PBIPData;
    onEditMetadata: (field: 'title' | 'description', value: string) => void;
    onUpdateGeneralInfo: (field: 'area' | 'updateFrequency', value: string) => void;
    onToggleRLS: (value: boolean) => void;
    onUpdateObjective: (field: keyof DashboardObjective, value: string) => void;
    onUpdateBusinessRules: (rules: BusinessRule[]) => void;
    onUpdatePageExplanations: (pages: PageExplanation[]) => void;
    onDeleteMeasure: (index: number) => void;
    onUpdateMeasureDescription: (index: number, newDescription: string) => void;
    onDeleteRelationship: (index: number) => void;
    onDeleteTable: (index: number) => void;
}

export function PreviewPanel({
    data,
    onEditMetadata,
    onUpdateGeneralInfo,
    onToggleRLS,
    onUpdateObjective,
    onUpdateBusinessRules,
    onUpdatePageExplanations,
    onDeleteMeasure,
    onUpdateMeasureDescription,
    onDeleteRelationship,
    onDeleteTable
}: PreviewPanelProps) {

    const handleAddBusinessRule = () => {
        const newRule: BusinessRule = {
            id: Date.now().toString(),
            title: '',
            description: ''
        };
        onUpdateBusinessRules([...(data.metadata.businessRules || []), newRule]);
    };

    const handleUpdateBusinessRule = (index: number, field: keyof BusinessRule, value: string) => {
        const rules = [...(data.metadata.businessRules || [])];
        rules[index] = { ...rules[index], [field]: value };
        onUpdateBusinessRules(rules);
    };

    const handleDeleteBusinessRule = (index: number) => {
        const rules = [...(data.metadata.businessRules || [])];
        rules.splice(index, 1);
        onUpdateBusinessRules(rules);
    };

    const handleAddPageExplanation = () => {
        const newPage: PageExplanation = {
            id: Date.now().toString(),
            title: '',
            objective: '',
            kpis: '',
            filters: '',
            observations: ''
        };
        onUpdatePageExplanations([...(data.metadata.pageExplanations || []), newPage]);
    };

    const handleUpdatePageExplanation = (index: number, field: keyof PageExplanation, value: string) => {
        const pages = [...(data.metadata.pageExplanations || [])];
        pages[index] = { ...pages[index], [field]: value };
        onUpdatePageExplanations(pages);
    };

    const handleDeletePageExplanation = (index: number) => {
        const pages = [...(data.metadata.pageExplanations || [])];
        pages.splice(index, 1);
        onUpdatePageExplanations(pages);
    };

    return (
        <div className="preview-container">
            <div className="preview-header">
                <h2>Preview da Documentação</h2>
                <p>Preencha as informações para gerar um PDF profissional</p>
            </div>

            {/* 1. Identificação do Projeto */}
            <section className="preview-section">
                <h3>1. Identificação do Projeto</h3>
                <div className="form-row">
                    <div className="form-group flex-2">
                        <label htmlFor="title">Nome do Dashboard</label>
                        <input
                            id="title"
                            type="text"
                            value={data.metadata.title}
                            onChange={(e) => onEditMetadata('title', e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="form-group flex-1">
                        <label htmlFor="area">Área do Dashboard</label>
                        <input
                            id="area"
                            type="text"
                            value={data.metadata.area || ''}
                            onChange={(e) => onUpdateGeneralInfo('area', e.target.value)}
                            className="input-field"
                            placeholder="Ex: Comercial, RH..."
                        />
                    </div>
                </div>
            </section>

            {/* 2. Objetivo do Dashboard */}
            <section className="preview-section">
                <h3>2. Objetivo do Dashboard (Parte MAIS Importante)</h3>
                <p className="section-help">Escreva um resumo que descreva o propósito deste dashboard.</p>

                <div className="form-group">
                    <label>RESUMO</label>
                    <textarea
                        value={data.metadata.objective?.description || ''}
                        onChange={(e) => onUpdateObjective('description', e.target.value)}
                        className="textarea-field"
                        rows={6}
                        placeholder="Descreva aqui o objetivo do dashboard..."
                    />
                    <div className="input-hints">
                        <strong>Dicas do que incluir:</strong>
                        <ul>
                            <li><strong>O que é?</strong> (Ex: Receita, atendimentos e peças vendidas)</li>
                            <li><strong>Problema resolvido</strong> (Ex: Falta de visão de performance por loja)</li>
                            <li><strong>Apoio à decisão</strong> (Ex: Ações baseadas em insights de vendas)</li>
                            <li><strong>Público-alvo</strong> (Ex: Franqueados, Gerentes)</li>
                            <li><strong>Pergunta principal</strong> (Ex: Qual o meu atingimento de meta hoje?)</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 3. Fonte de Dados */}
            <section className="preview-section">
                <h3>3. Fonte de Dados</h3>
                <div className="form-group">
                    <label>Frequência de atualização</label>
                    <input
                        type="text"
                        value={data.metadata.updateFrequency || ''}
                        onChange={(e) => onUpdateGeneralInfo('updateFrequency', e.target.value)}
                        className="input-field"
                        placeholder="Ex: Diária, Mensal, Real-time..."
                    />
                </div>
                <div className="stats-grid compact">
                    <div className="stat-card">
                        <div className="stat-value">{data.tables.length}</div>
                        <div className="stat-label">Tabelas Identificadas</div>
                    </div>
                </div>
            </section>

            {/* 7. Regras de Negócio */}
            <section className="preview-section">
                <div className="section-header">
                    <h3>7. Regras de Negócio</h3>
                    <button onClick={handleAddBusinessRule} className="btn-add">
                        + Adicionar Regra
                    </button>
                </div>
                <p className="section-help">Ex: Cliente ativo = compra nos últimos 90 dias.</p>

                <div className="dynamic-list">
                    {data.metadata.businessRules?.map((rule, index) => (
                        <div key={rule.id} className="dynamic-item">
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <input
                                        type="text"
                                        value={rule.title}
                                        onChange={(e) => handleUpdateBusinessRule(index, 'title', e.target.value)}
                                        className="input-field"
                                        placeholder="Nome da Regra (ex: Cliente Ativo)"
                                    />
                                </div>
                                <button onClick={() => handleDeleteBusinessRule(index)} className="btn-icon btn-delete">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="form-group">
                                <textarea
                                    value={rule.description}
                                    onChange={(e) => handleUpdateBusinessRule(index, 'description', e.target.value)}
                                    className="textarea-field"
                                    rows={2}
                                    placeholder="Definição técnica/negocial da regra..."
                                />
                            </div>
                        </div>
                    ))}
                    {(!data.metadata.businessRules || data.metadata.businessRules.length === 0) && (
                        <p className="empty-state">Nenhuma regra de negócio adicionada.</p>
                    )}
                </div>
            </section>

            {/* 8. Explicação das Páginas */}
            <section className="preview-section">
                <div className="section-header">
                    <h3>8. Explicação das Páginas</h3>
                    <button onClick={handleAddPageExplanation} className="btn-add">
                        + Adicionar Página
                    </button>
                </div>

                <div className="dynamic-list">
                    {data.metadata.pageExplanations?.map((page, index) => (
                        <div key={page.id} className="dynamic-item page-item">
                            <div className="form-row">
                                <div className="form-group flex-2">
                                    <label>Nome da Página</label>
                                    <input
                                        type="text"
                                        value={page.title}
                                        onChange={(e) => handleUpdatePageExplanation(index, 'title', e.target.value)}
                                        className="input-field"
                                        placeholder="Ex: Visão Executiva"
                                    />
                                </div>
                                <button onClick={() => handleDeletePageExplanation(index)} className="btn-icon btn-delete" style={{ marginTop: '24px' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="form-group">
                                <label>Objetivo da página</label>
                                <textarea
                                    value={page.objective}
                                    onChange={(e) => handleUpdatePageExplanation(index, 'objective', e.target.value)}
                                    className="textarea-field"
                                    rows={2}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Principais KPIs</label>
                                    <textarea
                                        value={page.kpis}
                                        onChange={(e) => handleUpdatePageExplanation(index, 'kpis', e.target.value)}
                                        className="textarea-field"
                                        rows={2}
                                        placeholder="Listar KPIs principais..."
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Filtros disponíveis</label>
                                    <textarea
                                        value={page.filters}
                                        onChange={(e) => handleUpdatePageExplanation(index, 'filters', e.target.value)}
                                        className="textarea-field"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!data.metadata.pageExplanations || data.metadata.pageExplanations.length === 0) && (
                        <p className="empty-state">Nenhuma página documentada.</p>
                    )}
                </div>
            </section>

            {/* 9. Segurança */}
            <section className="preview-section">
                <h3>9. Segurança</h3>
                <div className="checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={data.metadata.hasRLS || false}
                            onChange={(e) => onToggleRLS(e.target.checked)}
                        />
                        Existe RLS (Row Level Security) aplicado neste relatório?
                    </label>
                </div>
            </section>

            {/* Medidas DAX - Restaurado funcionalidade completa */}
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

            {/* Tabelas e Relacionamentos */}
            <div className="grid-2-col">
                <section className="preview-section">
                    <h3>Tabelas ({data.tables.length})</h3>
                    <div className="tables-list">
                        {data.tables.map((table, index) => (
                            <div key={index} className="table-item">
                                <div className="table-header">
                                    <div className="table-name">{table.name}</div>
                                    <button
                                        onClick={() => onDeleteTable(index)}
                                        className="btn-icon btn-delete"
                                        title="Excluir tabela"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="table-info">
                                    {table.columns.length} colunas • {table.measureCount} medidas
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="preview-section">
                    <h3>Relacionamentos ({data.relationships.length})</h3>
                    {data.relationships.length > 0 ? (
                        <div className="relationships-list">
                            {data.relationships.map((rel, index) => (
                                <div key={index} className="relationship-item">
                                    <div className="rel-info">
                                        <span className="rel-from">{rel.from}</span>
                                        <span className="rel-arrow">→</span>
                                        <span className="rel-to">{rel.to}</span>
                                    </div>
                                    <button
                                        onClick={() => onDeleteRelationship(index)}
                                        className="btn-icon btn-delete"
                                        title="Excluir relacionamento"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-state">Nenhum relacionamento definido</p>
                    )}
                </section>
            </div>
        </div>
    );
}
