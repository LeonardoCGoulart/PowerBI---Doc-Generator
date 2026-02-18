import type { PBIPData, PBIPMetadata, DaxMeasure, TableInfo } from '../types/powerbi.types';

/**
 * Parser principal para arquivos .pbip descompactados
 * Responsável por ler a estrutura de pastas e extrair metadados
 */
export class PBIPParser {
    /**
     * Parse a estrutura de pastas .pbip
     * @param files Lista de arquivos do FileList (de um input type="file" com webkitdirectory)
     * @returns Dados extraídos do .pbip
     */
    static async parse(files: FileList): Promise<PBIPData> {
        // Validação
        if (!files || files.length === 0) {
            throw new Error('Nenhum arquivo fornecido');
        }

        // Converter FileList para array
        const fileArray = Array.from(files);

        // Encontrar arquivo de metadados (Case-insensitive)
        const metadataFile = fileArray.find(f => f.name.toLowerCase() === 'item.metadata.json');

        // Logs de debug para ajudar o usuário
        console.log('Total de arquivos:', fileArray.length);
        console.log('Estrutura detectada:', fileArray.slice(0, 10).map(f => f.webkitRelativePath).join(', '));

        if (!metadataFile) {
            // Tentar encontrar qualquer arquivo .tmdl como fallback para confirmar que é uma pasta de modelo
            const hasTmdl = fileArray.some(f => f.name.toLowerCase().endsWith('.tmdl'));

            if (hasTmdl) {
                console.log('item.metadata.json não encontrado, mas arquivos .tmdl detectados. Continuando...');
            } else {
                throw new Error('Metadados não encontrados. Certifique-se de selecionar a pasta ".SemanticModel" do seu projeto Power BI.');
            }
        }

        // Extrair metadados
        const metadata = await this.extractMetadata(metadataFile, fileArray);

        // Extrair medidas DAX dos arquivos .tmdl
        const measures = await this.extractMeasures(fileArray);

        // Extrair informações de tabelas
        const tables = await this.extractTables(fileArray);

        // Extrair relacionamentos
        const relationships = await this.extractRelationships(fileArray);

        return {
            metadata,
            measures,
            tables,
            relationships
        };
    }

    /**
     * Extrai metadados principais do relatório
     */
    private static async extractMetadata(metadataFile: File | undefined, allFiles: File[]): Promise<PBIPMetadata> {
        const metadata: PBIPMetadata = {
            title: 'Relatório Power BI',
            description: ''
        };

        if (metadataFile) {
            try {
                const content = await metadataFile.text();
                const json = JSON.parse(content);

                metadata.title = json.displayName || json.name || metadata.title;
                metadata.author = json.createdBy?.displayName || json.author;
                metadata.lastModified = json.lastModified ? new Date(json.lastModified) : undefined;
                metadata.createdDate = json.created ? new Date(json.created) : undefined;
            } catch (error) {
                console.warn('Erro ao ler metadados:', error);
            }
        }

        // Se não tiver metadata file, tentar extrair da estrutura de pastas
        if (!metadataFile) {
            const folderName = allFiles[0]?.webkitRelativePath?.split('/')[0];
            if (folderName) {
                metadata.title = folderName.replace(/\.Report$/, '');
            }
        }

        return metadata;
    }

    /**
     * Extrai medidas DAX dos arquivos .tmdl
     */
    private static async extractMeasures(files: File[]): Promise<DaxMeasure[]> {
        const measures: DaxMeasure[] = [];

        // Buscar arquivos .tmdl em tables/ (Case-insensitive e suporte a subpastas)
        const tmdlFiles = files.filter(f =>
            f.name.toLowerCase().endsWith('.tmdl') &&
            (f.webkitRelativePath?.toLowerCase().includes('/tables/') ||
                f.webkitRelativePath?.toLowerCase().includes('\\tables\\') ||
                f.webkitRelativePath?.toLowerCase().includes('/definition/tables/'))
        );

        for (const file of tmdlFiles) {
            try {
                const content = await file.text();
                const tableName = file.name.replace('.tmdl', '');

                // Parser simples de medidas DAX do formato TMDL
                const measureMatches = content.matchAll(/measure\s+['"]?(\w+)['"]?\s*=\s*([\s\S]*?)(?=\n\s*(?:measure|column|$))/gi);

                for (const match of measureMatches) {
                    const measureName = match[1];
                    let formula = match[2].trim();

                    // Remover metadados extras (formatString, lineageTag, annotations)
                    formula = formula.split('\n').filter(line => {
                        const trimmed = line.trim();
                        return !trimmed.startsWith('formatString') &&
                            !trimmed.startsWith('lineageTag') &&
                            !trimmed.startsWith('annotation');
                    }).join('\n').trim();

                    measures.push({
                        name: measureName,
                        formula: formula,
                        table: tableName,
                        description: this.generateDescription(measureName, formula)
                    });
                }
            } catch (error) {
                console.warn(`Erro ao processar ${file.name}:`, error);
            }
        }

        return measures;
    }

    /**
     * Extrai informações das tabelas
     */
    private static async extractTables(files: File[]): Promise<TableInfo[]> {
        const tables: TableInfo[] = [];
        const tmdlFiles = files.filter(f =>
            f.name.endsWith('.tmdl') &&
            (f.webkitRelativePath?.includes('/tables/') || f.webkitRelativePath?.includes('\\tables\\'))
        );

        for (const file of tmdlFiles) {
            try {
                const content = await file.text();
                const tableName = file.name.replace('.tmdl', '');

                // Extrair colunas
                const columnMatches = content.matchAll(/column\s+['"]?(\w+)['"]?/gi);
                const columns = Array.from(columnMatches).map(m => m[1]);

                // Contar medidas
                const measureMatches = content.matchAll(/measure\s+/gi);
                const measureCount = Array.from(measureMatches).length;

                tables.push({
                    name: tableName,
                    columns: columns,
                    measureCount: measureCount
                });
            } catch (error) {
                console.warn(`Erro ao processar tabela ${file.name}:`, error);
            }
        }

        return tables;
    }

    /**
     * Extrai relacionamentos entre tabelas
     */
    private static async extractRelationships(files: File[]) {
        const relationships = [];

        // Buscar arquivo de relacionamentos (Case-insensitive)
        const relFile = files.find(f =>
            f.name.toLowerCase() === 'relationships.tmdl' ||
            (f.webkitRelativePath?.toLowerCase().includes('relationships') && f.name.toLowerCase().endsWith('.tmdl'))
        );

        if (relFile) {
            try {
                const content = await relFile.text();

                // Parser mais flexível de relacionamentos do formato TMDL
                // Suporta aspas e diferentes tipos de quebra de linha
                // Ex: fromColumn: 'Tabela'.'Coluna' ou fromColumn: Tabela.Coluna
                const relMatches = content.matchAll(/relationship\s+[\w-]+\s*[\r\n]+[\s\S]*?fromColumn:\s*(?:'([^']+)'|([\w]+))\.(?:'([^']+)'|([\w]+))\s*[\r\n]+[\s\S]*?toColumn:\s*(?:'([^']+)'|([\w]+))\.(?:'([^']+)'|([\w]+))/gi);

                for (const match of relMatches) {
                    // O match captura opcionalmente entre aspas ou direto
                    const fromTable = match[1] || match[2];
                    const fromColumn = match[3] || match[4];
                    const toTable = match[5] || match[6];
                    const toColumn = match[7] || match[8];

                    if (fromTable && toTable) {
                        relationships.push({
                            from: fromTable,
                            to: toTable,
                            fromColumn: fromColumn || '?',
                            toColumn: toColumn || '?',
                            cardinality: '1:N' as const,
                            crossFilterDirection: 'Single' as const,
                            isActive: true
                        });
                    }
                }
            } catch (error) {
                console.warn('Erro ao processar relacionamentos:', error);
            }
        }

        return relationships;
    }

    /**
     * Gera uma descrição resumida baseada no nome e fórmula da medida
     */
    private static generateDescription(name: string, formula: string): string {
        // Análise simples do nome
        const lowerName = name.toLowerCase();

        if (lowerName.includes('total') || formula.toUpperCase().includes('SUM(')) {
            return `Calcula o total de ${name.replace(/total/i, '').trim()}`;
        }
        if (lowerName.includes('count') || formula.toUpperCase().includes('COUNT')) {
            return `Conta o número de ${name.replace(/count/i, '').trim()}`;
        }
        if (lowerName.includes('avg') || lowerName.includes('media') || formula.toUpperCase().includes('AVERAGE')) {
            return `Calcula a média de ${name.replace(/avg|media/i, '').trim()}`;
        }
        if (formula.toUpperCase().includes('CALCULATE(')) {
            return `Cálculo condicional para ${name}`;
        }

        return `Medida calculada: ${name}`;
    }
}
