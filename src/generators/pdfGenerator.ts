import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import type { PBIPData } from '../types/powerbi.types';

// Inicializar fontes - Correção para Vite/React
// @ts-ignore
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const fonts = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
    }
};
pdfMake.fonts = fonts;

/**
 * Gerador de PDF profissional para documentação Power BI
 * Foco em estética moderna e tipografia consistente.
 */
export class PDFGenerator {
    static async generate(data: PBIPData, diagramBase64?: string): Promise<void> {
        console.log('Iniciando geração de PDF para:', data.metadata.title);

        try {
            const docDefinition = this.createDocumentDefinition(data, diagramBase64);
            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.download(`${(data.metadata.title || 'Report').replace(/\s+/g, '_')}_Documentacao.pdf`);
            console.log('Comando de download enviado');
        } catch (error) {
            console.error('Erro detalhado na geração do PDF:', error);
            throw error;
        }
    }

    private static createDocumentDefinition(
        data: PBIPData,
        diagramBase64?: string
    ): TDocumentDefinitions {
        const currentDate = new Date().toLocaleDateString('pt-BR');
        const content: Content[] = [this.generateCover(data)];

        // 1. Identificação - Sempre presente
        content.push(
            this.generateSectionHeader('1. Identificação do Projeto'),
            this.generateProjectID(data)
        );

        // 2. Objetivo - Ocultar se vazio
        if (data.metadata.objective?.description || data.metadata.objective?.problemResolved) {
            content.push(
                this.generateSectionHeader('2. Objetivo do Dashboard'),
                this.generateObjective(data)
            );
        }

        // 3. Fonte de Dados - Ocultar se não houver tabelas
        if (data.tables.length > 0) {
            content.push(
                this.generateSectionHeader('3. Fonte de Dados', true),
                this.generateDataSource(data)
            );
        }

        // 4. Modelo de Dados - Ocultar se não houver diagrama nem relacionamentos
        if (diagramBase64 || data.relationships.length > 0) {
            content.push(
                this.generateSectionHeader('4. Modelo de Dados', true),
                this.generateDataModel(data, diagramBase64)
            );
        }

        // 5. Dicionário de Dados - Ocultar se não houver tabelas
        if (data.tables.length > 0) {
            content.push(
                this.generateSectionHeader('5. Dicionário de Dados', true),
                this.generateDataDictionary(data)
            );
        }

        // 6. Medidas - Ocultar se não houver medidas
        if (data.measures.length > 0) {
            content.push(
                this.generateSectionHeader('6. Medidas (DAX)', true),
                ...this.generateMeasuresContent(data.measures)
            );
        }

        // 7. Regras de Negócio - Ocultar se vazio
        if (data.metadata.businessRules && data.metadata.businessRules.length > 0) {
            content.push(
                this.generateSectionHeader('7. Regras de Negócio', true),
                this.generateBusinessRules(data)
            );
        }

        // 8. Explicação das Páginas - Ocultar se vazio
        if (data.metadata.pageExplanations && data.metadata.pageExplanations.length > 0) {
            content.push(
                this.generateSectionHeader('8. Explicação das Páginas', true),
                this.generatePageExplanations(data)
            );
        }

        // 9. Segurança - Sempre presente
        content.push(
            this.generateSectionHeader('9. Segurança', true),
            this.generateSecurity(data)
        );

        return {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            defaultStyle: {
                fontSize: 10,
                color: '#1E293B', // Slate 800
                lineHeight: 1.2
            },
            header: {
                margin: [40, 20, 40, 10],
                columns: [
                    { text: 'Dicionário de Dados Power BI', style: 'headerText' },
                    { text: currentDate, style: 'headerDate', alignment: 'right' }
                ]
            },
            footer: (currentPage, pageCount) => ({
                margin: [40, 20],
                columns: [
                    { text: data.metadata.title, style: 'footerText' },
                    { text: `Página ${currentPage} de ${pageCount}`, style: 'footerText', alignment: 'right' }
                ]
            }),
            content: content,
            styles: {
                title: { fontSize: 26, bold: true, color: '#0F172A' },
                subtitle: { fontSize: 14, color: '#64748B' },
                coverBadge: { fontSize: 10, bold: true, color: '#FFFFFF', background: '#2C7A9B', margin: [0, 5, 0, 5] },
                sectionTitle: { fontSize: 15, bold: true, color: '#2C7A9B', margin: [0, 10, 0, 12] },
                subsectionTitle: { fontSize: 11, bold: true, color: '#334155', margin: [0, 8, 0, 6] },
                tableLabel: { fontSize: 10, bold: true, color: '#475569', fillColor: '#F8FAFC' },
                tableValue: { fontSize: 10, color: '#1E293B' },
                formula: { fontSize: 8.5, color: '#0F172A', background: '#F1F5F9', italics: true, margin: [0, 4, 0, 4] },
                description: { fontSize: 9, color: '#64748B', italics: true },
                headerText: { fontSize: 9, color: '#94A3B8' },
                headerDate: { fontSize: 9, color: '#94A3B8' },
                footerText: { fontSize: 8, color: '#94A3B8' },
                smallNote: { fontSize: 9, color: '#94A3B8', italics: true }
            }
        };
    }

    private static generateCover(data: PBIPData): Content {
        return [
            { text: '\n\n\n\n\n\n\n\n', fontSize: 10 },
            {
                stack: [
                    {
                        table: {
                            widths: ['auto'],
                            body: [[{ text: 'DOCUMENTAÇÃO TÉCNICA', style: 'coverBadge' }]]
                        },
                        layout: 'noBorders',
                        alignment: 'center',
                        margin: [0, 0, 0, 15]
                    },
                    { text: data.metadata.title.toUpperCase(), style: 'title', alignment: 'center' },
                    { canvas: [{ type: 'line', x1: 150, y1: 15, x2: 350, y2: 15, lineWidth: 2, lineColor: '#2C7A9B' }], margin: [0, 5, 0, 15] },
                    { text: data.metadata.area ? `Área: ${data.metadata.area}` : '', style: 'subtitle', alignment: 'center', margin: [0, 5, 0, 10] },
                    { text: data.metadata.description || '', style: 'subtitle', alignment: 'center', italics: true }
                ]
            },
            { text: '', pageBreak: 'after' }
        ];
    }

    private static generateSectionHeader(title: string, breakPage: boolean = false): Content {
        return {
            text: title.toUpperCase(),
            style: 'sectionTitle',
            pageBreak: breakPage ? 'before' : undefined
        };
    }

    private static generateProjectID(data: PBIPData): Content {
        return {
            table: {
                widths: ['35%', '65%'],
                body: [
                    [{ text: 'Campo', style: 'tableLabel' }, { text: 'Informação', style: 'tableLabel' }],
                    [{ text: 'Nome do Dashboard', style: 'tableLabel' }, { text: data.metadata.title, style: 'tableValue' }],
                    [{ text: 'Área', style: 'tableLabel' }, { text: data.metadata.area || '-', style: 'tableValue' }],
                    [{ text: 'Autor', style: 'tableLabel' }, { text: data.metadata.author || '-', style: 'tableValue' }],
                    [{ text: 'Última Modificação', style: 'tableLabel' }, { text: data.metadata.lastModified?.toLocaleDateString('pt-BR') || '-', style: 'tableValue' }]
                ]
            },
            layout: {
                hLineColor: '#E2E8F0',
                vLineColor: '#E2E8F0',
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                paddingLeft: () => 10,
                paddingRight: () => 10,
                paddingTop: () => 8,
                paddingBottom: () => 8
            },
            margin: [0, 0, 0, 15]
        };
    }

    private static generateObjective(data: PBIPData): Content {
        const obj = data.metadata.objective || {
            description: '',
            problemResolved: '',
            decisionHelper: '',
            targetAudience: '',
            mainQuestion: ''
        };

        const hasSpecificFields = obj.problemResolved || obj.decisionHelper || obj.targetAudience || obj.mainQuestion;

        if (!hasSpecificFields) {
            return [
                { text: 'RESUMO / OBJETIVO', style: 'subsectionTitle' },
                { text: obj.description || 'Não informado', style: 'tableValue', margin: [0, 0, 0, 10] }
            ];
        }

        const items = [
            { l: 'O que é?', v: obj.description },
            { l: 'Problema resolvido', v: obj.problemResolved },
            { l: 'Apoio à decisão', v: obj.decisionHelper },
            { l: 'Público-alvo', v: obj.targetAudience },
            { l: 'Pergunta principal', v: obj.mainQuestion }
        ];

        return [
            { text: 'CONTEXTO E FINALIDADE', style: 'subsectionTitle' },
            {
                table: {
                    widths: ['35%', '65%'],
                    body: items.map(i => [
                        { text: i.l, style: 'tableLabel' },
                        { text: i.v || '-', style: 'tableValue' }
                    ])
                },
                layout: 'headerLineOnly'
            }
        ];
    }

    private static generateDataSource(data: PBIPData): Content {
        return {
            table: {
                widths: ['35%', '65%'],
                body: [
                    [{ text: 'Tabelas Utilizadas', style: 'tableLabel' }, { text: data.tables.map(t => t.name).join(', '), style: 'tableValue' }],
                    [{ text: 'Frequência de Atualização', style: 'tableLabel' }, { text: data.metadata.updateFrequency || 'Não informada', style: 'tableValue' }]
                ]
            },
            layout: 'lightHorizontalLines'
        };
    }

    private static generateDataModel(data: PBIPData, diagramBase64?: string): Content {
        const content: Content[] = [];

        if (diagramBase64) {
            content.push({
                image: diagramBase64,
                width: 500,
                alignment: 'center',
                margin: [0, 10, 0, 20]
            });
        }

        if (data.relationships.length > 0) {
            content.push(
                { text: 'RELACIONAMENTOS ENTRE TABELAS', style: 'subsectionTitle' },
                {
                    table: {
                        widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
                        headerRows: 1,
                        body: [
                            [
                                { text: 'De Tabela', style: 'tableLabel' },
                                { text: 'Coluna', style: 'tableLabel' },
                                { text: 'Para Tabela', style: 'tableLabel' },
                                { text: 'Coluna', style: 'tableLabel' },
                                { text: 'Card.', style: 'tableLabel' }
                            ],
                            ...data.relationships.map(r => [
                                { text: r.from, style: 'tableValue' },
                                { text: r.fromColumn, style: 'tableValue' },
                                { text: r.to, style: 'tableValue' },
                                { text: r.toColumn, style: 'tableValue' },
                                { text: r.cardinality, style: 'tableValue' }
                            ])
                        ]
                    },
                    layout: 'lightHorizontalLines'
                }
            );
        }

        return content;
    }

    private static generateDataDictionary(data: PBIPData): Content {
        const content: Content[] = [];

        data.tables.forEach(table => {
            content.push({
                table: {
                    widths: ['100%'],
                    headerRows: 1,
                    body: [
                        [{ text: `TABELA: ${table.name.toUpperCase()}`, style: 'tableLabel', fillColor: '#E2E8F0' }],
                        ...table.columns.map(col => [
                            { text: col, style: 'tableValue' }
                        ])
                    ]
                },
                layout: 'lightHorizontalLines',
                margin: [0, 0, 0, 12]
            });
        });

        return content;
    }

    private static generateMeasuresContent(measures: any[]): Content[] {
        if (!measures || measures.length === 0) return [];

        const measuresByTable: Record<string, any[]> = {};
        measures.forEach(m => {
            const tableName = m.table || 'Geral';
            if (!measuresByTable[tableName]) measuresByTable[tableName] = [];
            measuresByTable[tableName].push(m);
        });

        const content: Content[] = [];
        Object.keys(measuresByTable).sort().forEach(tableName => {
            content.push(
                { text: `Tabela: ${tableName}`, style: 'subsectionTitle', margin: [0, 10, 0, 5] },
                {
                    table: {
                        widths: ['25%', '50%', '25%'],
                        headerRows: 1,
                        body: [
                            [
                                { text: 'Medida', style: 'tableLabel' },
                                { text: 'Fórmula DAX', style: 'tableLabel' },
                                { text: 'Descrição', style: 'tableLabel' }
                            ],
                            ...measuresByTable[tableName].map(m => [
                                { text: m.name || '-', style: 'tableValue', bold: true },
                                { text: m.formula || '-', style: 'formula' },
                                { text: m.description || '-', style: 'description' }
                            ])
                        ]
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 15]
                }
            );
        });

        return content;
    }

    private static generateBusinessRules(data: PBIPData): Content {
        const rules = data.metadata.businessRules || [];
        if (rules.length === 0) return [];

        return {
            table: {
                widths: ['35%', '65%'],
                body: [
                    [{ text: 'Regra', style: 'tableLabel' }, { text: 'Definição/Lógica', style: 'tableLabel' }],
                    ...rules.map(r => [
                        { text: r.title, style: 'tableValue', bold: true },
                        { text: r.description, style: 'tableValue' }
                    ])
                ]
            },
            layout: 'lightHorizontalLines'
        };
    }

    private static generatePageExplanations(data: PBIPData): Content {
        const pages = data.metadata.pageExplanations || [];
        if (pages.length === 0) return [];

        return pages.map(page => ({
            stack: [
                { text: page.title, style: 'subsectionTitle' },
                {
                    table: {
                        widths: ['25%', '75%'],
                        body: [
                            [{ text: 'Objetivo', style: 'tableLabel' }, { text: page.objective, style: 'tableValue' }],
                            [{ text: 'KPIs', style: 'tableLabel' }, { text: page.kpis, style: 'tableValue' }],
                            [{ text: 'Filtros', style: 'tableLabel' }, { text: page.filters, style: 'tableValue' }],
                            ...(page.observations ? [[{ text: 'Obs.', style: 'tableLabel' }, { text: page.observations, style: 'tableValue' }]] : [])
                        ]
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 15]
                }
            ],
            unbreakable: true
        }));
    }

    private static generateSecurity(data: PBIPData): Content {
        return {
            text: [
                { text: 'Row Level Security (RLS): ', style: 'tableLabel', background: '#F8FAFC' },
                { text: data.metadata.hasRLS ? ' SIM (Aplicado) ' : ' NÃO (Público) ', style: 'tableValue', bold: true }
            ],
            margin: [0, 10, 0, 0]
        };
    }
}
