import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { PBIPData } from '../types/powerbi.types';

// Inicializar fontes - Correção para Vite/React
// @ts-ignore
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// Usar apenas as fontes padrão que vêm no vfs_fonts.js (geralmente apenas Roboto)
// Remover a definição manual de Courier para evitar erros de arquivos .afm ausentes
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
 * Utiliza PDFMake para criar documentos formatados
 */
export class PDFGenerator {
    /**
     * Gera e faz download do PDF de documentação
     * @param data Dados extraídos do .pbip
     * @param diagramBase64 Imagem do diagrama em base64
     */
    static async generate(data: PBIPData, diagramBase64?: string): Promise<void> {
        console.log('Iniciando geração de PDF para:', data.metadata.title);

        try {
            const docDefinition = this.createDocumentDefinition(data, diagramBase64);

            // Gerar o PDF
            const pdfDocGenerator = pdfMake.createPdf(docDefinition);

            // No browser, isso deve disparar o download
            pdfDocGenerator.download(`${data.metadata.title.replace(/\s+/g, '_')}_Documentacao.pdf`);

            console.log('Comando de download enviado');
        } catch (error) {
            console.error('Erro detalhado na geração do PDF:', error);
            throw error;
        }
    }

    /**
     * Cria a definição do documento PDF
     */
    private static createDocumentDefinition(
        data: PBIPData,
        diagramBase64?: string
    ): TDocumentDefinitions {
        const currentDate = new Date().toLocaleDateString('pt-BR');

        return {
            pageSize: 'A4',
            pageMargins: [40, 80, 40, 60],

            // Header
            header: {
                margin: [40, 20, 40, 10],
                columns: [
                    { text: 'Documentação Power BI', style: 'headerText' },
                    { text: currentDate, style: 'headerDate', alignment: 'right' }
                ]
            },

            // Footer
            footer: (currentPage, pageCount) => ({
                margin: [40, 20],
                columns: [
                    { text: data.metadata.title, style: 'footerText' },
                    { text: `Página ${currentPage} de ${pageCount}`, style: 'footerText', alignment: 'right' }
                ]
            }),

            // Conteúdo
            content: [
                // Capa
                {
                    text: data.metadata.title,
                    style: 'title',
                    margin: [0, 0, 0, 10]
                },
                {
                    text: data.metadata.description || 'Documentação técnica do relatório Power BI',
                    style: 'subtitle',
                    margin: [0, 0, 0, 30]
                },

                // Medidas DAX
                {
                    text: 'Medidas DAX',
                    style: 'sectionTitle',
                    pageBreak: 'before',
                    margin: [0, 0, 0, 10]
                },
                ...this.generateMeasuresTables(data.measures),

                // Diagrama de Relacionamentos
                ...(diagramBase64 ? [
                    {
                        text: 'Diagrama de Relacionamentos',
                        style: 'sectionTitle',
                        pageBreak: 'before',
                        margin: [0, 0, 0, 10]
                    },
                    {
                        image: diagramBase64,
                        width: 500,
                        alignment: 'center',
                        margin: [0, 10, 0, 10]
                    },
                    {
                        text: 'Legenda: As setas indicam a direção do relacionamento entre as tabelas.',
                        style: 'caption',
                        alignment: 'center',
                        margin: [0, 5, 0, 20]
                    }
                ] : []),

                // Tabela de Relacionamentos Detalhada
                {
                    text: 'Detalhamento de Relacionamentos',
                    style: 'sectionTitle',
                    margin: [0, 20, 0, 10]
                },
                ...this.generateRelationshipsTable(data.relationships),

                // Informações gerais (MOVIDO PARA O FINAL)
                {
                    text: 'Informações Gerais e Estatísticas',
                    style: 'sectionTitle',
                    pageBreak: 'before',
                    margin: [0, 40, 0, 10]
                },
                {
                    table: {
                        widths: ['30%', '70%'],
                        body: [
                            [
                                { text: 'Título:', style: 'tableLabel' },
                                { text: data.metadata.title, style: 'tableValue' }
                            ],
                            ...(data.metadata.author ? [[
                                { text: 'Autor:', style: 'tableLabel' },
                                { text: data.metadata.author, style: 'tableValue' }
                            ]] : []),
                            ...(data.metadata.lastModified ? [[
                                { text: 'Última Modificação:', style: 'tableLabel' },
                                { text: data.metadata.lastModified.toLocaleDateString('pt-BR'), style: 'tableValue' }
                            ]] : []),
                            [
                                { text: 'Tabelas:', style: 'tableLabel' },
                                { text: data.tables.length.toString(), style: 'tableValue' }
                            ],
                            [
                                { text: 'Medidas DAX:', style: 'tableLabel' },
                                { text: data.measures.length.toString(), style: 'tableValue' }
                            ],
                            [
                                { text: 'Relacionamentos:', style: 'tableLabel' },
                                { text: data.relationships.length.toString(), style: 'tableValue' }
                            ]
                        ]
                    },
                    layout: {
                        hLineColor: '#E2E8F0',
                        vLineColor: '#E2E8F0',
                        paddingLeft: () => 10,
                        paddingRight: () => 10,
                        paddingTop: () => 8,
                        paddingBottom: () => 8
                    },
                    margin: [0, 0, 0, 20]
                }
            ],

            // Estilos
            styles: {
                title: {
                    fontSize: 28,
                    bold: true,
                    color: '#0F172A',
                    alignment: 'center'
                },
                subtitle: {
                    fontSize: 14,
                    color: '#64748B',
                    alignment: 'center'
                },
                sectionTitle: {
                    fontSize: 18,
                    bold: true,
                    color: '#2B7A9B',
                    margin: [0, 15, 0, 10]
                },
                subsectionTitle: {
                    fontSize: 14,
                    bold: true,
                    color: '#475569',
                    margin: [0, 10, 0, 5]
                },
                tableLabel: {
                    fontSize: 10,
                    bold: true,
                    color: '#475569'
                },
                tableValue: {
                    fontSize: 10,
                    color: '#0F172A'
                },
                measureName: {
                    fontSize: 11,
                    bold: true,
                    color: '#0F172A'
                },
                formula: {
                    fontSize: 8.5,
                    color: '#1E293B',
                    background: '#F1F5F9',
                    italics: true
                },
                description: {
                    fontSize: 9,
                    color: '#64748B',
                    italics: true
                },
                headerText: {
                    fontSize: 10,
                    color: '#64748B'
                },
                headerDate: {
                    fontSize: 9,
                    color: '#94A3B8'
                },
                footerText: {
                    fontSize: 8,
                    color: '#94A3B8'
                },
                caption: {
                    fontSize: 9,
                    color: '#64748B',
                    italics: true
                }
            }
        };
    }

    /**
     * Gera tabelas de medidas agrupadas por tabela
     */
    private static generateMeasuresTables(measures: any[]): any[] {
        const content: any[] = [];

        // Agrupar medidas por tabela
        const measuresByTable: Record<string, any[]> = {};
        measures.forEach(m => {
            if (!measuresByTable[m.table]) {
                measuresByTable[m.table] = [];
            }
            measuresByTable[m.table].push(m);
        });

        Object.keys(measuresByTable).sort().forEach(tableName => {
            const tableMeasures = measuresByTable[tableName];

            content.push(
                {
                    text: `Tabela: ${tableName}`,
                    style: 'subsectionTitle',
                    margin: [0, 15, 0, 8]
                },
                {
                    table: {
                        widths: ['25%', '50%', '25%'],
                        headerRows: 1,
                        body: [
                            [
                                { text: 'Medida', style: 'tableLabel', fillColor: '#E8F4F8' },
                                { text: 'Fórmula DAX', style: 'tableLabel', fillColor: '#E8F4F8' },
                                { text: 'Descrição', style: 'tableLabel', fillColor: '#E8F4F8' }
                            ],
                            ...tableMeasures.map((m: any) => [
                                { text: m.name, style: 'measureName' },
                                { text: m.formula, style: 'formula' },
                                { text: m.description, style: 'description' }
                            ])
                        ]
                    },
                    layout: {
                        hLineColor: '#E2E8F0',
                        vLineColor: '#E2E8F0',
                        paddingLeft: () => 8,
                        paddingRight: () => 8,
                        paddingTop: () => 6,
                        paddingBottom: () => 6
                    },
                    margin: [0, 0, 0, 15]
                }
            );
        });

        return content;
    }

    /**
     * Gera tabela de relacionamentos
     */
    private static generateRelationshipsTable(relationships: any[]): any[] {
        if (relationships.length === 0) {
            return [{
                text: 'Nenhum relacionamento definido.',
                style: 'description',
                margin: [0, 5, 0, 10]
            }];
        }

        return [{
            table: {
                widths: ['20%', '20%', '20%', '20%', '20%'],
                headerRows: 1,
                body: [
                    [
                        { text: 'Tabela Origem', style: 'tableLabel', fillColor: '#E8F4F8' },
                        { text: 'Coluna', style: 'tableLabel', fillColor: '#E8F4F8' },
                        { text: 'Tabela Destino', style: 'tableLabel', fillColor: '#E8F4F8' },
                        { text: 'Coluna', style: 'tableLabel', fillColor: '#E8F4F8' },
                        { text: 'Cardinalidade', style: 'tableLabel', fillColor: '#E8F4F8' }
                    ],
                    ...relationships.map(r => [
                        { text: r.from, style: 'tableValue' },
                        { text: r.fromColumn, style: 'tableValue' },
                        { text: r.to, style: 'tableValue' },
                        { text: r.toColumn, style: 'tableValue' },
                        { text: r.cardinality, style: 'tableValue' }
                    ])
                ]
            },
            layout: {
                hLineColor: '#E2E8F0',
                vLineColor: '#E2E8F0',
                paddingLeft: () => 8,
                paddingRight: () => 8,
                paddingTop: () => 6,
                paddingBottom: () => 6
            },
            margin: [0, 0, 0, 10]
        }];
    }
}
