# PowerBI Doc Generator 🚀

O **PowerBI Doc Generator** é uma ferramenta web poderosa e intuitiva projetada para automatizar a criação de documentação técnica de arquivos Power BI (.pbip). Ele extrai medidas DAX, tabelas e relacionamentos, gerando um PDF profissional com diagrama de ER integrado.

![Preview do Projeto](https://raw.githubusercontent.com/LeonardoCGoulart/PowerBI---Doc-Generator/main/public/preview.png) *(Nota: Adicionar imagem real após o push)*

## ✨ Principais Funcionalidades

- 📁 **Parsing de .pbip / .SemanticModel**: Suporte completo para a nova estrutura de arquivos do Power BI.
- 📊 **Diagrama de Relacionamentos**: Geração automática de diagrama visual de tabelas (Estilo ER) usando `vis.js`.
- 🧮 **Extrator DAX Limpo**: Captura todas as medidas DAX, removendo anotações técnicas e metadados irrelevantes (`formatHint`, `lineageTag`, etc).
- ✏️ **Preview Editável**:
  - Edite o título e a descrição do relatório.
  - Ajuste as descrições das medidas DAX antes de gerar o PDF.
  - Exclua medidas ou relacionamentos indesejados.
  - **Exclusão em Cascata**: Remova tabelas inteiras e o sistema limpa automaticamente os DAXs e relacionamentos vinculados.
- 📄 **Exportação em PDF**: Documentação profissional com capa, medidas agrupadas e diagrama, tudo pronto para download.
- 🔒 **Privacidade Total**: O processamento é 100% local no seu navegador. Nenhum dado do seu Power BI é enviado para servidores externos.

## 🛠️ Softwares e Requisitos

Para executar o projeto localmente ou contribuir, você precisará de:

1.  **Node.js** (Versão 18 ou superior recomendada)
2.  **Gerenciador de Pacotes**: `npm` (vem com Node.js) ou `yarn`.
3.  **Navegador Moderno**: Chrome, Edge ou Firefox (com suporte a upload de pastas).

## 🚀 Como Executar o Projeto

Siga os passos abaixo para rodar o projeto em sua máquina:

### 1. Clonar o Repositório
```bash
git clone https://github.com/LeonardoCGoulart/PowerBI---Doc-Generator.git
cd PowerBI---Doc-Generator
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

### 4. Gerar Build de Produção
```bash
npm run build
```

## 📖 Como Usar

1.  No Power BI Desktop, salve seu projeto como **Projeto do Power BI (.pbip)**.
2.  Abra o **PowerBI Doc Generator**.
3.  Clique em "Selecionar Pasta" e escolha a pasta que termina em **`.SemanticModel`** (esta pasta contém as definições TMDL necessárias).
4.  Revise os dados no Preview, faça as edições necessárias.
5.  Clique em **Gerar e Baixar PDF**.

## 🏗️ Tech Stack

- **React + Vite** (Frontend)
- **TypeScript** (Tipagem e Segurança)
- **PDFMake** (Motor de geração de PDF)
- **vis-network** (Visualização de diagramas)
- **CSS Vanilla** (Estilização moderna e responsiva)

---
© 2026 Desenvolvido com Antigravity para automação de BI.
