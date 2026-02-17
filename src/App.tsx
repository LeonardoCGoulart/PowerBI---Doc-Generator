import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { PreviewPanel } from './components/PreviewPanel';
import { DiagramViewer } from './components/DiagramViewer';
import { PBIPParser } from './parsers/pbipParser';
import { DiagramGenerator } from './generators/diagramGenerator';
import { PDFGenerator } from './generators/pdfGenerator';
import type { PBIPData } from './types/powerbi.types';
import './App.css';

type AppStep = 'upload' | 'preview' | 'diagram';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [pbipData, setPbipData] = useState<PBIPData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: FileList) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Parser de arquivos .pbip
      const data = await PBIPParser.parse(files);
      setPbipData(data);
      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivos');
      console.error('Erro no parsing:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMetadataEdit = (field: 'title' | 'description', value: string) => {
    if (!pbipData) return;
    setPbipData({
      ...pbipData,
      metadata: {
        ...pbipData.metadata,
        [field]: value
      }
    });
  };

  const handleDeleteMeasure = (index: number) => {
    if (!pbipData) return;
    const newMeasures = [...pbipData.measures];
    newMeasures.splice(index, 1);
    setPbipData({ ...pbipData, measures: newMeasures });
  };

  const handleUpdateMeasureDescription = (index: number, newDescription: string) => {
    if (!pbipData) return;
    const newMeasures = [...pbipData.measures];
    newMeasures[index] = { ...newMeasures[index], description: newDescription };
    setPbipData({ ...pbipData, measures: newMeasures });
  };

  const handleDeleteRelationship = (index: number) => {
    if (!pbipData) return;
    const newRelationships = [...pbipData.relationships];
    newRelationships.splice(index, 1);
    setPbipData({ ...pbipData, relationships: newRelationships });
  };

  const handleDeleteTable = (index: number) => {
    if (!pbipData) return;

    const tableToDelete = pbipData.tables[index].name;

    // 1. Remover a tabela
    const newTables = [...pbipData.tables];
    newTables.splice(index, 1);

    // 2. Remover medidas associadas (Cascata)
    const newMeasures = pbipData.measures.filter(m => m.table !== tableToDelete);

    // 3. Remover relacionamentos associados (Cascata)
    const newRelationships = pbipData.relationships.filter(r =>
      r.from !== tableToDelete && r.to !== tableToDelete
    );

    setPbipData({
      ...pbipData,
      tables: newTables,
      measures: newMeasures,
      relationships: newRelationships
    });
  };

  const handleGeneratePDF = async () => {
    if (!pbipData) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Gerar diagrama como imagem base64
      let diagramBase64: string | undefined;

      if (pbipData.tables.length > 0 && pbipData.relationships.length > 0) {
        diagramBase64 = await DiagramGenerator.generate(
          pbipData.tables,
          pbipData.relationships
        );
      }

      // Gerar PDF
      await PDFGenerator.generate(pbipData, diagramBase64);

      // Sucesso - pode resetar ou mostrar mensagem
      setTimeout(() => {
        setIsGenerating(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar PDF');
      console.error('Erro ao gerar PDF:', err);
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setPbipData(null);
    setError(null);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            <span className="title-main">PowerBI</span>
            <span className="title-accent">Doc Generator</span>
          </h1>
          <p className="app-subtitle">
            Documentação automática de relatórios Power BI em PDF
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          {/* Progress Indicator */}
          <div className="progress-bar">
            <div className={`progress-step ${currentStep === 'upload' ? 'active' : 'completed'}`}>
              <div className="step-number">1</div>
              <div className="step-label">Upload</div>
            </div>
            <div className="progress-line" />
            <div className={`progress-step ${currentStep === 'preview' ? 'active' : currentStep === 'diagram' ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Preview</div>
            </div>
            <div className="progress-line" />
            <div className={`progress-step ${currentStep === 'diagram' ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Gerar PDF</div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="error-close">×</button>
            </div>
          )}

          {/* Step 1: Upload */}
          {currentStep === 'upload' && (
            <FileUpload
              onFilesSelected={handleFilesSelected}
              isProcessing={isProcessing}
            />
          )}

          {/* Step 2: Preview */}
          {currentStep === 'preview' && pbipData && (
            <div className="preview-layout">
              <PreviewPanel
                data={pbipData}
                onEditMetadata={handleMetadataEdit}
                onDeleteMeasure={handleDeleteMeasure}
                onUpdateMeasureDescription={handleUpdateMeasureDescription}
                onDeleteRelationship={handleDeleteRelationship}
                onDeleteTable={handleDeleteTable}
              />

              <div className="action-buttons">
                <button onClick={handleReset} className="btn btn-secondary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9 -9a9.75 9.75 0 0 0 -6.74 2.74L3 8" />
                    <path d="M3 4v4h4" />
                  </svg>
                  Recomeçar
                </button>

                <button
                  onClick={() => setCurrentStep('diagram')}
                  className="btn btn-primary"
                >
                  Visualizar Diagrama
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Diagram & Generate */}
          {currentStep === 'diagram' && pbipData && (
            <div className="diagram-layout">
              <DiagramViewer
                tables={pbipData.tables}
                relationships={pbipData.relationships}
              />

              <div className="action-buttons">
                <button onClick={() => setCurrentStep('preview')} className="btn btn-secondary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                    <path d="m12 19-7-7 7-7" />
                  </svg>
                  Voltar
                </button>

                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="btn btn-success"
                >
                  {isGenerating ? (
                    <>
                      <div className="spinner" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                        <path d="M9 17h6" />
                        <path d="M9 13h6" />
                      </svg>
                      Gerar e Baixar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <p>Gerador de Documentação Power BI • 2026</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
