import { Network } from 'vis-network';
import type { Relationship, TableInfo } from '../types/powerbi.types';

/**
 * Gerador de diagramas de relacionamento usando vis.js
 * Cria visualização estilo ER (Entity Relationship) das tabelas e relacionamentos
 */
export class DiagramGenerator {
    /**
     * Gera um diagrama de relacionamento e retorna como imagem base64
     * @param tables Lista de tabelas do modelo
     * @param relationships Lista de relacionamentos entre tabelas
     * @returns Promise com imagem em base64 (PNG)
     */
    static async generate(
        tables: TableInfo[],
        relationships: Relationship[]
    ): Promise<string> {
        // Criar container temporário para o diagrama
        const container = document.createElement('div');
        container.style.width = '1200px';
        container.style.height = '800px';
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        document.body.appendChild(container);

        try {
            // Preparar nodes (tabelas)
            const nodes = tables.map((table) => ({
                id: table.name,
                label: `${table.name}\n(${table.columns.length} colunas, ${table.measureCount} medidas)`,
                shape: 'box',
                color: {
                    background: '#E8F4F8',
                    border: '#2B7A9B',
                    highlight: {
                        background: '#D0E8F0',
                        border: '#1A5A7A'
                    }
                },
                font: {
                    size: 14,
                    face: 'Arial',
                    color: '#0F172A'
                },
                margin: { top: 10, right: 10, bottom: 10, left: 10 },
                borderWidth: 2
            }));

            // Preparar edges (relacionamentos)
            const edges = relationships.map(rel => ({
                from: rel.from,
                to: rel.to,
                label: `${rel.fromColumn} → ${rel.toColumn}`,
                arrows: rel.cardinality.includes('N') ? 'to' : { to: { enabled: true, type: 'arrow' } },
                color: {
                    color: '#555',
                    highlight: '#2B7A9B'
                },
                font: {
                    size: 10,
                    align: 'middle'
                },
                smooth: {
                    enabled: true,
                    type: 'cubicBezier',
                    roundness: 0.5
                }
            }));

            // Configuração do vis.js network
            const data = { nodes, edges };
            const options = {
                layout: {
                    hierarchical: {
                        enabled: true,
                        direction: 'UD', // Up-Down
                        sortMethod: 'directed',
                        nodeSpacing: 150,
                        levelSeparation: 200
                    }
                },
                physics: {
                    enabled: false // Desabilitar física para layout estático
                },
                interaction: {
                    dragNodes: false,
                    dragView: false,
                    zoomView: false
                }
            };

            // Criar network
            const network = new Network(container, data, options);

            // Aguardar estabilização com timeout de 3 segundos
            await Promise.race([
                new Promise<void>((resolve) => {
                    network.once('stabilizationIterationsDone', () => {
                        console.log('Diagrama estabilizado');
                        resolve();
                    });
                }),
                new Promise<void>((resolve) => setTimeout(resolve, 3000))
            ]);

            // Converter para canvas e depois para base64
            const canvas = container.querySelector('canvas') as HTMLCanvasElement;
            if (!canvas) {
                throw new Error('Canvas não encontrado');
            }

            // Ajustar para capturar toda a visualização
            network.fit();

            // Aguardar um frame para garantir renderização
            await new Promise(resolve => setTimeout(resolve, 500));

            const base64 = canvas.toDataURL('image/png');

            return base64;
        } finally {
            // Limpar container
            document.body.removeChild(container);
        }
    }

    /**
     * Renderiza o diagrama em um elemento do DOM para preview
     */
    static renderPreview(
        containerId: string,
        tables: TableInfo[],
        relationships: Relationship[]
    ): Network {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container #${containerId} não encontrado`);
        }

        // Preparar nodes
        const nodes = tables.map(table => ({
            id: table.name,
            label: `${table.name}\n(${table.columns.length} cols, ${table.measureCount} measures)`,
            shape: 'box',
            color: {
                background: '#E8F4F8',
                border: '#2B7A9B',
                highlight: {
                    background: '#D0E8F0',
                    border: '#1A5A7A'
                }
            },
            font: {
                size: 14,
                face: 'Arial',
                color: '#0F172A'
            },
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            borderWidth: 2
        }));

        // Preparar edges
        const edges = relationships.map(rel => ({
            from: rel.from,
            to: rel.to,
            label: `${rel.fromColumn} → ${rel.toColumn}`,
            arrows: 'to',
            color: {
                color: '#555',
                highlight: '#2B7A9B'
            },
            font: {
                size: 10,
                align: 'middle'
            }
        }));

        const data = { nodes, edges };
        const options = {
            layout: {
                hierarchical: {
                    enabled: true,
                    direction: 'UD',
                    sortMethod: 'directed',
                    nodeSpacing: 150,
                    levelSeparation: 200
                }
            },
            physics: {
                enabled: true,
                stabilization: {
                    iterations: 200
                }
            },
            interaction: {
                hover: true,
                zoomView: true,
                dragView: true
            }
        };

        return new Network(container, data, options);
    }
}
