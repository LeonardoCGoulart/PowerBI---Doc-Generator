import { useState, type ChangeEvent } from 'react';
import './FileUpload.css';

interface FileUploadProps {
    onFilesSelected: (files: FileList) => void;
    isProcessing: boolean;
}

export function FileUpload({ onFilesSelected, isProcessing }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [filesCount, setFilesCount] = useState(0);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const items = e.dataTransfer.items;
        if (items && items.length > 0) {
            // Processar primeira pasta/arquivo
            const item = items[0].webkitGetAsEntry();
            if (item?.isDirectory) {
                // @ts-ignore - webkitdirectory não tem tipagem oficial
                const input = document.createElement('input');
                input.type = 'file';
                // @ts-ignore
                input.webkitdirectory = true;
                input.onchange = (e) => handleFileSelection(e as unknown as React.ChangeEvent<HTMLInputElement>);
                // Não é possível setar files programaticamente por segurança
                alert('Por favor, use o botão "Selecionar Pasta" para fazer upload da pasta .pbip');
            }
        }
    };

    const handleFileSelection = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setFilesCount(files.length);
            onFilesSelected(files);
        }
    };

    return (
        <div className="upload-container">
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {!isProcessing && (
                    <div className="upload-alert">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>Selecione a pasta terminada em <strong>.SemanticModel</strong> para ler o DAX.</span>
                    </div>
                )}

                <div className="upload-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" />
                        <path d="M9 15l3 -3l3 3" />
                        <path d="M12 12l0 9" />
                    </svg>
                </div>

                <h2 className="upload-title">
                    {isProcessing ? 'Processando...' : 'Faça upload da pasta .pbip'}
                </h2>

                <p className="upload-description">
                    {isProcessing
                        ? 'Extraindo medidas DAX, tabelas e relacionamentos'
                        : 'Selecione a pasta descompactada do seu relatório Power BI'}
                </p>

                {filesCount > 0 && !isProcessing && (
                    <p className="files-count">{filesCount} arquivos detectados</p>
                )}

                <label className="upload-button">
                    <input
                        type="file"
                        // @ts-ignore - webkitdirectory é uma extensão do Chrome/Edge
                        webkitdirectory="true"
                        directory="true"
                        onChange={handleFileSelection}
                        disabled={isProcessing}
                        style={{ display: 'none' }}
                    />
                    <span>{isProcessing ? 'Aguarde...' : 'Selecionar Pasta'}</span>
                </label>

                <p className="upload-hint">
                    Pasta recomendada: <strong>[Nome].SemanticModel/</strong>
                </p>
            </div>
        </div>
    );
}
