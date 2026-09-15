# GUIA DE INTEGRAÇÃO - CADERNO WORK V3.2+

## 📋 Resumo da Arquitetura

A aplicação foi refatorada para usar um sistema modular com design system centralizado:

```
┌─────────────────────────────────────────────────────┐
│              variables.css (Design System)          │
│  ├─ Z-Index Hierarchy                              │
│  ├─ Color Palette (Light/Dark)                     │
│  ├─ Typography Scale                               │
│  ├─ Spacing System (8px base)                      │
│  ├─ Shadow & Radius Tokens                         │
│  └─ Transitions & Effects                          │
└─────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────┐
│         orbita-infinity-MELHORADO.css               │
│  ├─ Base Layout (Grid, Sidebar, Topbar)            │
│  ├─ Componentes Refatorados (z-index fixes)        │
│  ├─ Responsive Design (standardized breakpoints)   │
│  ├─ Modal & Floating Layers                        │
│  └─ Dark Mode Support                              │
└─────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────┐
│              Módulos Funcionais                      │
├─────────────────────────────────────────────────────┤
│ cronograma.js   │ spreadsheet.js   │ canvas.js     │
│ Gantt Chart     │ Excel-like Grid  │ Drawing Tool  │
└─────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Arquivos

```
projeto/
├── variables.css                 ← Sistema de variáveis centralizado
├── orbita-infinity-MELHORADO.css ← CSS refatorado com z-index correto
├── cronograma.js                 ← Gantt chart (20KB)
├── spreadsheet.js                ← Spreadsheet (19KB)
├── canvas.js                     ← Canvas drawing (TBD)
├── cadernos.js                   ← Organização (TBD)
├── orbita-infinity.css           ← [DEPRECADO] Substituído por MELHORADO
├── caderno-work.css              ← CSS adicional (manter por compatibilidade)
├── orbita-infinity.js            ← JS do layout (270KB, refatorar)
├── caderno-work.js               ← JS da app (23KB, refatorar)
└── index.html                    ← Arquivo principal
```

---

## 🔧 Como Usar os Módulos

### 1. CRONOGRAMA (Gantt Chart)

**Classe:** `CronogramaGantt`

**Inicialização:**
```javascript
const cronograma = new CronogramaGantt('cronograma-container', [
  {
    id: 'task-1',
    name: 'Design UI',
    start: new Date(2026, 8, 15),
    end: new Date(2026, 8, 22),
    resources: ['Alice'],
    cost: 2000,
    status: 'progresso',
    progress: 60
  }
], [
  { id: 'alice', name: 'Alice', avatar: '👩' },
  { id: 'bob', name: 'Bob', avatar: '👨' }
]);
```

**Métodos Principais:**
```javascript
// Adicionar tarefa
cronograma.addTask({ ... });

// Selecionar tarefa para editar
cronograma.selectTask('task-1');

// Salvar edição
cronograma.saveTask();

// Deletar tarefa
cronograma.deleteTask('task-1');

// Renderizar Gantt
cronograma.render();

// Filtrar
cronograma.setFilter('Alice'); // Por pessoa
cronograma.setFilter('progresso'); // Por status

// Dados
const custo = cronograma.getTotalCost();
const tarefas = cronograma.getTasksByPerson('Alice');
const progresso = cronograma.getCompletionPercentage();

// Exportar/Importar
const json = cronograma.exportJSON();
cronograma.importJSON(json);
```

**Zoom Levels:**
```javascript
// Mudar zoom (semana, mês, trimestre, ano)
cronograma.zoom = 'month';
cronograma.render();
```

**Propriedades de Tarefa:**
```
{
  id: string,              // Único
  name: string,            // Título
  start: Date,             // Início
  end: Date,               // Fim
  resources: string[],     // IDs de pessoas
  cost: number,            // Custo em R$
  status: 'planejado'|'progresso'|'concluido'|'atrasado',
  progress: 0-100,         // % de conclusão
  isMilestone: boolean,    // Landmark (📍)
  depends_on: string[]     // IDs de tarefas que deve esperar
}
```

---

### 2. SPREADSHEET (Excel-like)

**Classe:** `Spreadsheet`

**Inicialização:**
```javascript
const sheet = new Spreadsheet('spreadsheet-container', 10, 6);
// 10 linhas, 6 colunas
```

**Métodos Principais:**
```javascript
// Definir valor de célula
sheet.setCellValue(0, 0, 'Nome');
sheet.setCellValue(1, 0, 'João');

// Fórmulas (com range A1:A10)
sheet.setCellValue(10, 1, '=SUM(A1:A10)');    // Soma
sheet.setCellValue(10, 2, '=AVG(A1:A10)');    // Média
sheet.setCellValue(10, 3, '=COUNT(A1:A10)');  // Contagem
sheet.setCellValue(10, 4, '=IF(A1>100,A1,0)'); // Condicional

// Histórico
sheet.undo();  // Ctrl+Z
sheet.redo();  // Ctrl+Y

// Clipboard
sheet.copy();   // Ctrl+C
sheet.cut();    // Ctrl+X
sheet.paste();  // Ctrl+V

// Formatação
sheet.toggleFormat('bold');
sheet.toggleFormat('italic');
sheet.toggleFormat('underline');
sheet.setAlignment('center'); // 'left', 'center', 'right'
sheet.setCellColor('bg', '#fff3cd'); // Fundo
sheet.setCellColor('text', '#d39e00'); // Texto

// Grid
sheet.addRow();
sheet.addColumn();

// CSV
sheet.importCSV(csvString);
const csv = sheet.exportCSV();

// Gráficos
sheet.createChart('bar'); // 'bar', 'pie', 'line'

// Obter dados
const grid = sheet.grid; // Array 2D
```

**Atalhos de Teclado:**
```
Ctrl+Z    → Undo
Ctrl+Y    → Redo
Ctrl+C    → Copy
Ctrl+X    → Cut
Ctrl+V    → Paste
Enter     → Mover para célula abaixo
Tab       → Mover para célula à direita
```

---

### 3. CANVAS (Folha Livre)

**Classe:** `CanvasDrawing` (TBD)

**Funcionalidades Futuras:**
- [x] Desenho com mouse/touch
- [ ] OCR (Tesseract.js) - converter escrita em texto
- [ ] Cores e espessura de caneta
- [ ] Shapes (linha, retângulo, círculo)
- [ ] Pautas (pautado, quadriculado, pontilhado)
- [ ] Undo/Redo
- [ ] Exportar (PNG, PDF, SVG)

---

### 4. CADERNOS (Organização)

**Classe:** `CadernosManager` (TBD)

**Funcionalidades Futuras:**
- [ ] Pastas (criar, mover, organização)
- [ ] Tags (adicionar, filtrar, nuvem)
- [ ] Templates customizáveis
- [ ] Atalhos (Cmd+Shift+N)
- [ ] Contexto (pessoal, trabalho, estudo)
- [ ] Arquivar (não deletar)

---

## 🎨 Design System (variables.css)

### Z-Index Hierarchy

```css
--z-base: 1;              /* Elementos normais */
--z-dropdown: 100;        /* Dropdowns */
--z-sticky: 200;          /* Headers sticky */
--z-floating: 300;        /* Floating panels */
--z-notification: 400;    /* Toasts, notificações */
--z-tooltip: 500;         /* Tooltips */
--z-modal-overlay: 999;   /* Overlay dos modais */
--z-modal: 1000;          /* Modais */
--z-popover: 1100;        /* Popovers */
--z-command-palette: 1200; /* Command palette */
--z-keyboard: 15000;      /* Teclado virtual */
--z-integration: 16000;   /* Integration engine */
--z-gate: 50000;          /* Gate/Auth screen */
```

### Color Palette (Light Mode)

```css
--color-page: #f9f9f7;              /* Fundo página */
--color-surface: #fcfcfb;           /* Surface padrão */
--color-surface-raised: #ffffff;    /* Card/Elevated */
--color-surface-sunken: #f2f1ec;    /* Depressed */

--color-ink: #0b0b0b;               /* Texto principal */
--color-ink-secondary: #52514e;     /* Texto secundário */
--color-ink-muted: #898781;         /* Texto muted */

--color-slot-1: #2a78d6;            /* Azul (primary) */
--color-slot-2: #eb6834;            /* Laranja */
--color-slot-3: #1baf7a;            /* Verde */
--color-slot-4: #eda100;            /* Amarelo */

--color-good: #0ca30c;              /* Sucesso */
--color-warning: #fab219;           /* Aviso */
--color-critical: #d03b3b;          /* Erro/crítico */
--color-pending: #898781;           /* Pendente */
```

### Spacing System (8px base)

```css
--spacing-xs: 4px;
--spacing-sm: 8px;    /* base */
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
--spacing-3xl: 32px;
--spacing-4xl: 40px;
```

### Typography

```css
--font-family-body: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-family-serif: Fraunces, Georgia, serif;
--font-family-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

--font-size-xs: 11px;
--font-size-sm: 13px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;

--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

---

## 📱 Responsive Breakpoints (Padronizados)

```css
/* Desktop Grande (1180px+) */
@media (max-width: 1180px) { ... }

/* Tablet (820px - 1100px) */
@media (max-width: 1100px) { ... }
@media (max-width: 820px) { ... }

/* Mobile (560px - 800px) */
@media (max-width: 800px) { ... }
@media (max-width: 700px) { ... }
@media (max-width: 560px) { ... }
```

**Viewport Sizes:**
- Mobile: 320px, 480px, 560px, 700px
- Tablet: 768px, 820px, 1100px
- Desktop: 1024px, 1180px, 1440px+

---

## 🔌 Integração no HTML

**Antes (desorganizado):**
```html
<link rel="stylesheet" href="./orbita-infinity.css">
<link rel="stylesheet" href="./caderno-work.css">
<!-- CSS duplicado, z-index caótico -->

<script src="./orbita-infinity.js"></script>
<script src="./caderno-work.js"></script>
<!-- JS monolítico, sem modularização -->
```

**Depois (modular):**
```html
<!-- Design System Central -->
<link rel="stylesheet" href="./variables.css">

<!-- Layout Refatorado -->
<link rel="stylesheet" href="./orbita-infinity-MELHORADO.css">
<link rel="stylesheet" href="./caderno-work.css">

<!-- Módulos Funcionais -->
<script src="./cronograma.js"></script>
<script src="./spreadsheet.js"></script>
<script src="./canvas.js"></script>
<script src="./cadernos.js"></script>

<!-- App Principal -->
<script src="./config.js"></script>
<script src="./orbita-infinity.js"></script>
<script src="./caderno-work.js"></script>
```

---

## ✅ Checklist de Integração

### Fase 1: CSS & Design System
- [x] Criar variables.css com z-index hierarchy
- [x] Refatorar orbita-infinity.css → MELHORADO
- [ ] Atualizar index.html para importar novo CSS
- [ ] Testar z-index em todos breakpoints
- [ ] Remover CSS duplicado

### Fase 2: Módulos Funcionais
- [x] Implementar cronograma.js (Gantt)
- [x] Implementar spreadsheet.js (Excel)
- [ ] Implementar canvas.js (Desenho)
- [ ] Implementar cadernos.js (Organização)
- [ ] Integrar módulos no HTML

### Fase 3: Refactoring JS
- [ ] Separar orbita-infinity.js em módulos
- [ ] Melhorar caderno-work.js (state management)
- [ ] Criar event dispatcher centralizado
- [ ] Adicionar TypeScript/JSDoc

### Fase 4: Testes & Polish
- [ ] Testes em Desktop (Chrome, Firefox, Safari)
- [ ] Testes em Mobile (iOS, Android)
- [ ] Testes em Tablet
- [ ] WCAG AA compliance (acessibilidade)
- [ ] Performance < 3s load time

---

## 🚀 Próximas Ações

1. **Atualizar HTML** - importar variables.css e MELHORADO.css
2. **Integrar módulos** - adicionar scripts de cronograma, spreadsheet
3. **Testar responsividade** - validar breakpoints padronizados
4. **Remover overlaps** - validar z-index em todos os casos
5. **Documentar API** - guia de uso de cada módulo

---

## 📚 Referências

- **variables.css** - Design tokens centralizados
- **orbita-infinity-MELHORADO.css** - Layout refatorado
- **cronograma.js** - Gantt chart completo
- **spreadsheet.js** - Spreadsheet excel-like
- **PLANO_REPAGINACAO_INTEGRADO.md** - Plano detalhado
