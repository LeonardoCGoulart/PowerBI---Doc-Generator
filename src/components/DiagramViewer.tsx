import { useEffect, useRef } from 'react';
import { DiagramGenerator } from '../generators/diagramGenerator';
import type { TableInfo, Relationship } from '../types/powerbi.types';
import './DiagramViewer.css';

interface DiagramViewerProps {
    tables: TableInfo[];
    relationships: Relationship[];
}

export function DiagramViewer({ tables, relationships }: DiagramViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && tables.length > 0) {
            try {
                DiagramGenerator.renderPreview(
                    containerRef.current.id,
                    tables,
                    relationships
                );
            } catch (error) {
                console.error('Erro ao renderizar diagrama:', error);
            }
        }
    }, [tables, relationships]);

    if (tables.length === 0) {
        return (
            <div className="diagram-empty">
                <p>Nenhuma tabela disponível para visualização</p>
            </div>
        );
    }

    return (
        <div className="diagram-container">
            <div className="diagram-header">
                <h3>Preview do Diagrama de Relacionamentos</h3>
                <p>Este diagrama será incluído no PDF</p>
            </div>
            <div
                id="diagram-visualization"
                ref={containerRef}
                className="diagram-canvas"
            />
            <div className="diagram-legend">
                <p><strong>Legenda:</strong> As setas indicam o fluxo de relacionamento entre as tabelas</p>
            </div>
        </div>
    );
}
