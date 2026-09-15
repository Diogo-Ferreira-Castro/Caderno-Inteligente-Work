# CADERNO WORK V3.2 - PLANO DE REPAGINAÇÃO INTEGRADO

## OBJETIVO GERAL
Repaginar completamente o aplicativo corrigindo problemas de interface (z-index, sobreposições, responsividade) ENQUANTO melhora as funcionalidades existentes (cronograma, planilhas, folha livre, cadernos).

---

## 📋 ANÁLISE DAS FUNCIONALIDADES ATUAIS

### 1. **CRONOGRAMA (Gantt/Project)**
**Status Atual:**
- Existe como tipo "gantt"
- Tem kanban view com tarefas sem data
- Mostra "Sem data" + "aguardando planejamento"
- Falta: visualização melhor, recursos (pessoas, custos), dependências

**Melhorias Propostas:**
- ✅ **Gantt visual** - timeline com barras (início/duração/fim)
- ✅ **Recursos** - adicionar pessoas/equipe por tarefa
- ✅ **Custo/Budget** - tracking de custos por tarefa/projeto
- ✅ **Dependências** - tarefas que dependem de outras
- ✅ **Milestones** - marcos importantes no timeline
- ✅ **Filtros** - por pessoa, status, data, custo
- ✅ **Exportar** - PDF ou Excel com o cronograma

### 2. **PLANILHAS (Spreadsheet/Excel)**
**Status Atual:**
- Existe como tipo "spreadsheet"
- Funcionalidade básica (células, linhas/colunas?)
- Falta info sobre features

**Melhorias Propostas:**
- ✅ **Grid melhorado** - redimensionar colunas, copiar/colar
- ✅ **Fórmulas** - SUM, AVG, COUNT, IF básicas
- ✅ **Formatação** - cores, negrito, alinhamento
- ✅ **Tipos de coluna** - texto, número, moeda, data, %
- ✅ **Ordenação/Filtro** - ordenar por coluna, filtrar valores
- ✅ **Gráficos** - bar, pie, line simples
- ✅ **Importar CSV** - ler dados de arquivo
- ✅ **Atalhos** - Ctrl+C/V, Ctrl+Z, Enter pra navegar

### 3. **FOLHA LIVRE (Canvas/Ink)**
**Status Atual:**
- Tem canvas com desenho/escrita (pointerdown, pointermove)
- Contexto: "escrever e virar um texto digitado"
- Falta: OCR, conversão de escrita

**Melhorias Propostas:**
- ✅ **OCR (Escrita → Texto)** - converter escrita à mão em texto digitado
- ✅ **Melhor ferramenta de desenho** - cores, espessura, shapes
- ✅ **Páginas ilimitadas** - scroll vertical
- ✅ **Seleção de texto** - selecionar + deletar + mover
- ✅ **Rubber/Borracha** - apagar seletivamente
- ✅ **Grid/Pautas** - visualização com grade (pautado, quadriculado, em branco)
- ✅ **Undo/Redo** - desfazer/refazer
- ✅ **Exportar** - PDF, PNG, SVG

### 4. **OPÇÕES DE CADERNO**
**Status Atual:**
- Templates predefinidos (código, idiomas, redação)
- Tipos variados (nota, texto, etc)

**Melhorias Propostas:**
- ✅ **Mais templates** - template customizável (usuário cria seu próprio)
- ✅ **Pasta/Organização** - agrupar cadernos em pastas
- ✅ **Tags** - etiquetar cadernos para busca
- ✅ **Atalhos** - criar caderno rápido com atalho
- ✅ **Modelos por contexto** - pessoal, trabalho, estudo
- ✅ **Arquivar cadernos** - não deletar, apenas esconder

---

## 🎨 PROBLEMAS DE INTERFACE (do audit anterior)

### Z-Index Caótico
```
Valores encontrados:
- 50000 (!!important) - gate login
- 21000 - command palette
- 20000 - cover
- 16000 - integration modal
- 15000 - keyboard
- 14000 - quick panel
- 12000 - global header
- 11800 - tablet bar
- 11000 - tool rail
```

### Duplicação de CSS
- caderno-work.css (26KB) + orbita-infinity.css (54KB) = 80KB duplicado
- Muitas regras comuns em ambos

### JS Monolítico
- caderno-work.js (23KB)
- orbita-infinity.js (270KB)
- Sem separação de responsabilidade

### Responsividade Inconsistente
- Breakpoints em: 1366px, 1100px, 760px, 420px
- Não padronizados entre os arquivos

### Acessibilidade Negligenciada
- Sem role="dialog", aria-modal
- Sem aria-label adequado
- Sem keyboard navigation completa
- Contraste inadequado

---

## 📐 PLANO DE IMPLEMENTAÇÃO (4 FASES)

### FASE 1: ESTRUTURA & LAYOUT (Semana 1)
**Objetivo**: Corrigir problemas fundamentais de interface

**Tarefas**:
1. **CSS Refactoring**
   - [ ] Criar sistema de z-index com CSS variables (PRONTO - caderno-work-MELHORADO.css)
   - [ ] Refatorar orbita-infinity.css com mesmo padrão
   - [ ] Consolidar cores, spacing, tipografia em arquivo central
   - [ ] Organizar arquivos: variables.css, layout.css, components.css, modules/

2. **HTML Estrutura**
   - [ ] Revisar semântica (sections, articles, nav, main, aside)
   - [ ] Implementar ARIA labels (role, aria-modal, aria-hidden, aria-label)
   - [ ] Melhorar keyboard navigation (tabindex, focus management)

3. **Responsividade**
   - [ ] Testar em 320px (mobile), 768px (tablet), 1024px, 1440px (desktop)
   - [ ] Ajustar breakpoints consistentemente
   - [ ] Melhorar safe-area-inset em notch devices

**Deliverables**:
- orbita-infinity-MELHORADO.css (refatorado)
- variables.css (sistema centralizado)
- HTML revisado com ARIA

---

### FASE 2: FUNCIONALIDADES - CRONOGRAMA (Semana 1-2)

**Objetivo**: Melhorar experiência do cronograma

**Tarefas**:
1. **Gantt Visual**
   - [ ] Implementar timeline com barras (início/duração/fim)
   - [ ] Hoje marcado visualmente
   - [ ] Cores por status (planejado, em progresso, concluído, atrasado)
   - [ ] Zoom in/out (semana, mês, trimestre)

2. **Recursos**
   - [ ] Campo para adicionar pessoas/equipe
   - [ ] Avatar ou iniciais por pessoa
   - [ ] Filtrar tarefas por pessoa
   - [ ] View: todas tarefas de uma pessoa

3. **Custo/Budget**
   - [ ] Campo de custo por tarefa
   - [ ] Total do projeto
   - [ ] Alerta se exceder orçamento
   - [ ] Gráfico de custo ao longo do tempo

4. **Dependências**
   - [ ] "Esta tarefa começa quando X termina"
   - [ ] Linhas de conexão no Gantt
   - [ ] Detecção de ciclos

5. **Milestones**
   - [ ] Marcos especiais (release, deadline, revisão)
   - [ ] Ícone destacado no timeline

6. **Exportar**
   - [ ] PDF com Gantt + tabela de tarefas
   - [ ] Excel com dados brutos

**Melhorias de Interface**:
- Painéis side-by-side: timeline + detalhes
- Sem overlaps com keyboard/toolbar
- Drag-drop para mover barras (muda data)
- Click na barra = edita tarefa inline

**Deliverables**:
- cronograma.js (módulo novo)
- cronograma.css (estilos)
- Componente Gantt funcional

---

### FASE 3: FUNCIONALIDADES - PLANILHAS (Semana 2)

**Objetivo**: Excel-like experience completo

**Tarefas**:
1. **Grid Melhorado**
   - [ ] Redimensionar colunas (drag border)
   - [ ] Redimensionar linhas (altura ajustável)
   - [ ] Fixar header (scroll body)
   - [ ] Copiar/colar (Ctrl+C/V)
   - [ ] Undo/redo (Ctrl+Z/Y)
   - [ ] Seleção múltipla (Shift+click)

2. **Fórmulas Básicas**
   - [ ] SUM(A1:A10)
   - [ ] AVG(A1:A10)
   - [ ] COUNT(A1:A10)
   - [ ] IF(cond, valor_true, valor_false)
   - [ ] CONCATENATE / &
   - [ ] Validação: erro se fórmula inválida

3. **Formatação**
   - [ ] Cor de fundo célula
   - [ ] Negrito, itálico, sublinhado
   - [ ] Alinhamento (esquerda, centro, direita)
   - [ ] Borda células
   - [ ] Fonte tamanho

4. **Tipos de Coluna**
   - [ ] Texto (default)
   - [ ] Número (1,234.56)
   - [ ] Moeda (R$ 1.234,56)
   - [ ] Data (DD/MM/YYYY ou MM/DD/YYYY)
   - [ ] Percentual (15%)
   - [ ] Checkbox (bool)

5. **Ordenação/Filtro**
   - [ ] Click em header = sort ascending/descending
   - [ ] Filtro: valores únicos de coluna
   - [ ] Multi-sort (por coluna 1, depois 2)

6. **Gráficos**
   - [ ] Seleção de range → tipo gráfico
   - [ ] Bar (horizontal/vertical)
   - [ ] Pie
   - [ ] Line
   - [ ] Legenda, tooltip ao passar mouse

7. **Importar CSV**
   - [ ] Upload arquivo
   - [ ] Preview dados
   - [ ] Mapear colunas (automático ou manual)
   - [ ] Importar com/sem header

**Melhorias de Interface**:
- Toolbar com botões: negrito, cores, align, etc
- Fórmula bar visível no topo
- Cell reference (A1) mostrado
- Sem overlaps com outros painéis

**Deliverables**:
- spreadsheet.js (módulo novo)
- spreadsheet.css (estilos)
- Componente Grid funcional

---

### FASE 4: FUNCIONALIDADES - FOLHA LIVRE + CADERNOS (Semana 2-3)

**Objetivo**: Folha livre inteligente + melhor organização de cadernos

#### 4A: FOLHA LIVRE (Canvas/Ink)

**Tarefas**:
1. **OCR (Escrita → Texto)**
   - [ ] Integrar API OCR (ex: Tesseract.js)
   - [ ] Botão "Converter para texto"
   - [ ] Selecionar área para OCR
   - [ ] Resultado em texto editável

2. **Ferramenta de Desenho Melhorada**
   - [ ] Cores (paleta + custom)
   - [ ] Espessura da caneta (1-10px)
   - [ ] Shape: linha, retângulo, círculo, triângulo
   - [ ] Seleção (select box + mover/deletar)
   - [ ] Borracha (apagar seletivamente)

3. **Páginas Ilimitadas**
   - [ ] Scroll vertical contínuo
   - [ ] Indicador de página (Page 1, 2, 3...)
   - [ ] Pular para página (menu)
   - [ ] Excluir página

4. **Pautas/Grid**
   - [ ] Pautado (linhas horizontais)
   - [ ] Quadriculado (grid)
   - [ ] Branco (sem pauta)
   - [ ] Pontilhado

5. **Undo/Redo**
   - [ ] Ctrl+Z / Ctrl+Y
   - [ ] Stack de ações
   - [ ] Botões no toolbar

6. **Exportar**
   - [ ] PNG (rasterizado)
   - [ ] PDF (multi-página)
   - [ ] SVG (vetorial)

**Melhorias de Interface**:
- Toolbar flutuante (cores, ferramentas) sem bloquear espaço
- Canvas full-size
- Touchpad + S-Pen support
- Sem overlaps

#### 4B: OPÇÕES DE CADERNO

**Tarefas**:
1. **Templates Customizáveis**
   - [ ] Visualizar templates existentes
   - [ ] Botão "Novo template"
   - [ ] Editor visual: arrastar blocos, configurar
   - [ ] Salvar como template pessoal

2. **Organização (Pastas)**
   - [ ] Nova pasta
   - [ ] Mover caderno para pasta
   - [ ] Sidebar com árvore de pastas
   - [ ] Buscar em pasta

3. **Tags**
   - [ ] Adicionar tags ao caderno
   - [ ] Filter por tag
   - [ ] Tag suggestions (autocomplete)
   - [ ] Nuvem de tags

4. **Atalhos**
   - [ ] Cmd+Shift+N = novo caderno
   - [ ] Atalho de templates favoritos
   - [ ] Criar atalho: nome do caderno + tipo

5. **Contexto (Pessoal/Trabalho/Estudo)**
   - [ ] Dropdown ao criar
   - [ ] Filtrar por contexto
   - [ ] Cores/ícones por contexto
   - [ ] Ordenação: recentes, importantes, contexto

6. **Arquivar**
   - [ ] Botão "arquivar" (não deleta)
   - [ ] View: apenas ativos ou mostrar arquivados
   - [ ] Restaurar do arquivo

**Melhorias de Interface**:
- Sidebar left: pastas + tags
- Painel principal: lista de cadernos com cards
- Card mostra: ícone tipo, nome, contexto, última edição
- Sem overlaps

**Deliverables**:
- canvas.js (módulo novo)
- canvas.css (estilos)
- cadernos.js (organização)
- cadernos.css (estilos)

---

### FASE 5: POLISH & TESTES (Semana 3)

**Objetivo**: Polir experiência e testar tudo

**Tarefas**:
1. **Tipografia**
   - [ ] Revisar tamanhos (heading, body, label)
   - [ ] Contraste mínimo WCAG AA
   - [ ] Line-height consistente
   - [ ] Peso das fontes

2. **Espaçamento**
   - [ ] Padding/margin consistente (8px base unit)
   - [ ] Breathing room entre componentes
   - [ ] Uso de CSS grid/flex correto

3. **Transições**
   - [ ] Smooth (não jarring)
   - [ ] Respects prefers-reduced-motion
   - [ ] Duração consistente (200-300ms)

4. **Acessibilidade (WCAG AA)**
   - [ ] Keyboard navigation completo (Tab, Enter, Escape, Arrows)
   - [ ] Screen reader: labels, descriptions, roles
   - [ ] Contraste: 4.5:1 texto, 3:1 gráficos
   - [ ] Focus visible (outline 2px)

5. **Testes**
   - [ ] Desktop (Chrome, Firefox, Safari)
   - [ ] Mobile (iOS Safari, Android Chrome)
   - [ ] Tablet (iPad, Android tablet)
   - [ ] Breakpoints: 320px, 480px, 768px, 1024px, 1440px
   - [ ] Funcionalidades core
   - [ ] Offline (Service Worker)

6. **Performance**
   - [ ] Load time < 3s
   - [ ] CSS < 50KB total
   - [ ] JS split/lazy loaded
   - [ ] Canvas performance (60fps)

**Deliverables**:
- Relatório de testes
- Fixes de bugs encontrados
- Performance checklist

---

## 🎯 PRIORIZAÇÃO

### CRÍTICO (comece aqui):
1. Corrigir z-index + overlaps (FASE 1)
2. Refatorar CSS orbita-infinity (FASE 1)
3. Melhorar Cronograma - Gantt visual (FASE 2)
4. Melhorar Folha Livre - OCR (FASE 4A)

### IMPORTANTE:
5. Melhorar Planilhas - Grid + fórmulas (FASE 3)
6. Organizar Cadernos - pastas/tags (FASE 4B)
7. ARIA labels + keyboard nav (FASE 1)

### BOM TER:
8. Gráficos
9. Exportar PDF/Excel
10. Templates customizáveis

---

## 📊 TIMELINE ESTIMADO

| Semana | Tarefa | Horas |
|--------|--------|-------|
| 1      | FASE 1 (CSS, HTML, ARIA) | 20-24h |
| 1-2    | FASE 2 (Cronograma) | 24-30h |
| 2      | FASE 3 (Planilhas) | 20-24h |
| 2-3    | FASE 4 (Folha Livre + Cadernos) | 24-30h |
| 3      | FASE 5 (Polish + Testes) | 16-20h |
| **Total** | | **104-128h** |

---

## 🔄 PRÓXIMAS AÇÕES

1. **Confirmar prioridades** - qual você quer primeiro?
2. **Começar FASE 1** - CSS refactor orbita-infinity
3. **Implementar z-index system** no HTML
4. **Testar responsividade** nos breakpoints

Quer que eu comece logo? Qual prioridade?

