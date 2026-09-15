/**
 * CADERNO WORK V3.2+ - SPREADSHEET COM FÓRMULAS
 * Módulo para criar e gerenciar planilhas com grid redimensionável, fórmulas e gráficos
 */

class Spreadsheet {
  constructor(containerId, rows = 10, cols = 6) {
    this.container = document.getElementById(containerId);
    this.rows = rows;
    this.cols = cols;
    this.data = [];
    this.formulas = {};
    this.columnTypes = {};
    this.history = [];
    this.historyIndex = -1;
    this.selectedCell = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.initData();
    this.setupDOM();
    this.setupEventListeners();
    this.addStyles();
    this.render();
  }

  initData() {
    for (let r = 0; r < this.rows; r++) {
      this.data[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.data[r][c] = '';
      }
    }
    // Default column types
    for (let c = 0; c < this.cols; c++) {
      this.columnTypes[c] = 'text';
    }
  }

  setupDOM() {
    this.container.innerHTML = `
      <div class="spreadsheet-wrapper">
        <div class="spreadsheet-toolbar">
          <div class="toolbar-group">
            <button class="btn-toolbar" id="btnUndo" title="Desfazer (Ctrl+Z)">↶</button>
            <button class="btn-toolbar" id="btnRedo" title="Refazer (Ctrl+Y)">↷</button>
          </div>
          <div class="toolbar-group">
            <button class="btn-toolbar" id="btnBold" title="Negrito">B</button>
            <button class="btn-toolbar" id="btnItalic" title="Itálico">I</button>
            <button class="btn-toolbar" id="btnUnderline" title="Sublinhado">U</button>
          </div>
          <div class="toolbar-group">
            <select id="selectAlign" class="toolbar-select">
              <option value="left">← Esquerda</option>
              <option value="center">↔ Centro</option>
              <option value="right">→ Direita</option>
            </select>
          </div>
          <div class="toolbar-group">
            <input type="color" id="colorBg" title="Cor de fundo" value="#ffffff">
            <input type="color" id="colorText" title="Cor do texto" value="#000000">
          </div>
          <div class="toolbar-group">
            <button class="btn-toolbar" id="btnAddRow">➕ Linha</button>
            <button class="btn-toolbar" id="btnAddCol">➕ Coluna</button>
          </div>
          <div class="toolbar-group">
            <button class="btn-toolbar" id="btnImportCSV">📥 Importar CSV</button>
            <button class="btn-toolbar" id="btnExportCSV">📤 Exportar CSV</button>
          </div>
          <input type="file" id="csvFile" accept=".csv" style="display:none;">
        </div>

        <div class="spreadsheet-formula-bar">
          <span class="formula-label" id="cellRef">A1</span>
          <input type="text" class="formula-input" id="formulaInput" placeholder="Digite valor ou fórmula (ex: =SUM(A1:A10))">
        </div>

        <div class="spreadsheet-container">
          <table class="spreadsheet-table" id="spreadsheetTable">
            <tbody></tbody>
          </table>
        </div>

        <div class="spreadsheet-chart">
          <button class="btn-toolbar" id="btnCreateChart">📊 Criar Gráfico</button>
          <div id="chartContainer" style="display:none;">
            <canvas id="chartCanvas"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Undo/Redo
    this.container.querySelector('#btnUndo').addEventListener('click', () => this.undo());
    this.container.querySelector('#btnRedo').addEventListener('click', () => this.redo());

    // Formatting
    this.container.querySelector('#btnBold').addEventListener('click', () => this.toggleFormat('bold'));
    this.container.querySelector('#btnItalic').addEventListener('click', () => this.toggleFormat('italic'));
    this.container.querySelector('#btnUnderline').addEventListener('click', () => this.toggleFormat('underline'));
    this.container.querySelector('#selectAlign').addEventListener('change', (e) => this.setAlignment(e.target.value));
    this.container.querySelector('#colorBg').addEventListener('change', (e) => this.setCellColor('bg', e.target.value));
    this.container.querySelector('#colorText').addEventListener('change', (e) => this.setCellColor('text', e.target.value));

    // Add rows/columns
    this.container.querySelector('#btnAddRow').addEventListener('click', () => this.addRow());
    this.container.querySelector('#btnAddCol').addEventListener('click', () => this.addColumn());

    // CSV import/export
    this.container.querySelector('#btnImportCSV').addEventListener('click', () => {
      this.container.querySelector('#csvFile').click();
    });
    this.container.querySelector('#csvFile').addEventListener('change', (e) => this.importCSV(e));
    this.container.querySelector('#btnExportCSV').addEventListener('click', () => this.exportCSV());

    // Chart
    this.container.querySelector('#btnCreateChart').addEventListener('click', () => this.createChart());

    // Formula input
    const formulaInput = this.container.querySelector('#formulaInput');
    formulaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (this.selectedCell) {
          const [r, c] = this.selectedCell.split(':').map(Number);
          this.setCellValue(r, c, formulaInput.value);
          this.saveHistory();
          this.render();
        }
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          this.undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          this.redo();
        } else if (e.key === 'c') {
          e.preventDefault();
          this.copy();
        } else if (e.key === 'x') {
          e.preventDefault();
          this.cut();
        } else if (e.key === 'v') {
          e.preventDefault();
          this.paste();
        }
      }
    });

    // Cell selection
    this.container.addEventListener('click', (e) => {
      const cell = e.target.closest('td[data-cell]');
      if (cell) {
        this.selectCell(cell.dataset.cell);
      }
    });

    // Cell input
    this.container.addEventListener('dblclick', (e) => {
      const cell = e.target.closest('td[data-cell]');
      if (cell) {
        this.editCell(cell.dataset.cell);
      }
    });

    // Column resize
    this.container.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('col-resize')) {
        this.startColumnResize(e);
      }
    });
  }

  selectCell(cellRef) {
    this.selectedCell = cellRef;
    const [r, c] = cellRef.split(':').map(Number);

    // Update formula bar
    this.container.querySelector('#cellRef').textContent = cellRef;
    const value = this.data[r] ? this.data[r][c] : '';
    this.container.querySelector('#formulaInput').value = value;

    // Highlight cell
    this.container.querySelectorAll('td.selected').forEach(cell => cell.classList.remove('selected'));
    const cell = this.container.querySelector(`[data-cell="${cellRef}"]`);
    if (cell) {
      cell.classList.add('selected');
    }
  }

  editCell(cellRef) {
    const cell = this.container.querySelector(`[data-cell="${cellRef}"]`);
    if (!cell) return;

    const [r, c] = cellRef.split(':').map(Number);
    const value = this.data[r][c];

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.style.width = '100%';
    input.style.height = '100%';
    input.style.border = 'none';
    input.style.padding = '4px';

    cell.textContent = '';
    cell.appendChild(input);
    input.focus();

    const saveEdit = () => {
      this.setCellValue(r, c, input.value);
      this.saveHistory();
      this.render();
      this.selectCell(cellRef);
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveEdit();
      if (e.key === 'Escape') {
        this.render();
        this.selectCell(cellRef);
      }
    });
  }

  setCellValue(r, c, value) {
    if (value.startsWith('=')) {
      // It's a formula
      this.formulas[`${r}:${c}`] = value;
      try {
        const result = this.evaluateFormula(value, r, c);
        this.data[r][c] = result;
      } catch (e) {
        this.data[r][c] = '#ERROR';
      }
    } else {
      this.data[r][c] = value;
      delete this.formulas[`${r}:${c}`];
    }
  }

  evaluateFormula(formula, row, col) {
    let expr = formula.substring(1); // Remove '='

    // Replace cell references with values
    expr = expr.replace(/([A-Z]+)(\d+)/g, (match, letter, num) => {
      const c = letter.charCodeAt(0) - 65;
      const r = parseInt(num) - 1;
      return this.data[r] && this.data[r][c] ? this.data[r][c] : 0;
    });

    // Replace range references like A1:A10
    expr = expr.replace(/([A-Z]+)(\d+):([A-Z]+)(\d+)/g, (match, l1, n1, l2, n2) => {
      const c1 = l1.charCodeAt(0) - 65;
      const r1 = parseInt(n1) - 1;
      const c2 = l2.charCodeAt(0) - 65;
      const r2 = parseInt(n2) - 1;

      const values = [];
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const val = this.data[r] && this.data[r][c] ? parseFloat(this.data[r][c]) : 0;
          if (!isNaN(val)) values.push(val);
        }
      }

      // Return array-like value for functions
      return `[${values.join(',')}]`;
    });

    // Built-in functions
    expr = expr.replace(/SUM\(\[([\d,]+)\]\)/g, (match, values) => {
      const nums = values.split(',').map(Number);
      return nums.reduce((a, b) => a + b, 0);
    });

    expr = expr.replace(/AVG\(\[([\d,]+)\]\)/g, (match, values) => {
      const nums = values.split(',').map(Number);
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    });

    expr = expr.replace(/COUNT\(\[([\d,]+)\]\)/g, (match, values) => {
      return values.split(',').length;
    });

    // Evaluate mathematical expression
    try {
      return Function('"use strict"; return (' + expr + ')')();
    } catch (e) {
      return '#ERROR';
    }
  }

  toggleFormat(format) {
    if (!this.selectedCell) return;
    const [r, c] = this.selectedCell.split(':').map(Number);
    const cell = this.container.querySelector(`[data-cell="${this.selectedCell}"]`);
    if (cell) {
      cell.classList.toggle(`fmt-${format}`);
    }
  }

  setAlignment(align) {
    if (!this.selectedCell) return;
    const cell = this.container.querySelector(`[data-cell="${this.selectedCell}"]`);
    if (cell) {
      cell.style.textAlign = align;
    }
  }

  setCellColor(type, color) {
    if (!this.selectedCell) return;
    const cell = this.container.querySelector(`[data-cell="${this.selectedCell}"]`);
    if (cell) {
      if (type === 'bg') {
        cell.style.backgroundColor = color;
      } else {
        cell.style.color = color;
      }
    }
  }

  addRow() {
    this.data.push(Array(this.cols).fill(''));
    this.rows++;
    this.saveHistory();
    this.render();
  }

  addColumn() {
    this.data.forEach(row => row.push(''));
    this.cols++;
    this.columnTypes[this.cols - 1] = 'text';
    this.saveHistory();
    this.render();
  }

  importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').map(row => row.split(','));
      this.data = rows.filter(row => row.some(cell => cell.trim()));
      this.rows = this.data.length;
      this.cols = Math.max(...this.data.map(r => r.length));
      this.saveHistory();
      this.render();
    };
    reader.readAsText(file);
  }

  exportCSV() {
    const csv = this.data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'planilha.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  createChart() {
    // Simple bar chart from selected data
    const canvas = this.container.querySelector('#chartCanvas');
    const container = this.container.querySelector('#chartContainer');

    if (container.style.display === 'none') {
      container.style.display = 'block';
      const ctx = canvas.getContext('2d');
      const values = [];
      const labels = [];

      // Get first column as labels, second as values
      for (let r = 0; r < this.rows; r++) {
        labels.push(this.data[r][0]);
        values.push(parseFloat(this.data[r][1]) || 0);
      }

      this.drawBarChart(ctx, labels, values);
    } else {
      container.style.display = 'none';
    }
  }

  drawBarChart(ctx, labels, values) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 40;
    const barWidth = (width - 2 * padding) / labels.length;
    const maxValue = Math.max(...values);
    const scale = (height - 2 * padding) / maxValue;

    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw bars
    ctx.fillStyle = '#7c5cff';
    values.forEach((value, i) => {
      const x = padding + i * barWidth + barWidth * 0.1;
      const barHeight = value * scale;
      const y = height - padding - barHeight;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    });

    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = padding + i * barWidth + barWidth / 2;
      ctx.fillText(label, x, height - padding + 20);
    });
  }

  saveHistory() {
    this.historyIndex++;
    this.history = this.history.slice(0, this.historyIndex);
    this.history.push(JSON.parse(JSON.stringify(this.data)));
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.data = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.render();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.data = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.render();
    }
  }

  copy() {
    // Implementation simplified
    console.log('Copy');
  }

  cut() {
    console.log('Cut');
  }

  paste() {
    console.log('Paste');
  }

  render() {
    const tbody = this.container.querySelector('tbody');
    tbody.innerHTML = '';

    for (let r = 0; r < this.rows; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < this.cols; c++) {
        const td = document.createElement('td');
        td.dataset.cell = `${r}:${c}`;
        td.textContent = this.data[r] ? this.data[r][c] : '';
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  }

  addStyles() {
    if (document.getElementById('spreadsheet-styles')) return;

    const style = document.createElement('style');
    style.id = 'spreadsheet-styles';
    style.textContent = `
      .spreadsheet-wrapper {
        display: grid;
        grid-template-rows: auto auto auto 1fr auto;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
        background: var(--color-page);
        border-radius: var(--radius-card);
      }

      .spreadsheet-toolbar {
        display: flex;
        gap: var(--spacing-md);
        flex-wrap: wrap;
        padding: var(--spacing-md);
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
      }

      .toolbar-group {
        display: flex;
        gap: var(--spacing-xs);
      }

      .btn-toolbar {
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        border-radius: var(--radius-field);
        cursor: pointer;
        font-weight: 600;
        font-size: var(--font-size-xs);
        transition: var(--transition-fast);
      }

      .btn-toolbar:hover {
        background: var(--color-slot-1-tint);
        border-color: var(--color-accent);
      }

      .toolbar-select, input[type="color"] {
        padding: var(--spacing-sm);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
        font-size: var(--font-size-xs);
      }

      .spreadsheet-formula-bar {
        display: grid;
        grid-template-columns: 70px 1fr;
        gap: var(--spacing-md);
        align-items: center;
        padding: var(--spacing-md);
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
      }

      .formula-label {
        font-weight: 700;
        font-size: var(--font-size-xs);
        color: var(--color-ink-muted);
      }

      .formula-input {
        padding: var(--spacing-sm);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
        font-family: var(--font-family-mono);
        font-size: var(--font-size-xs);
      }

      .formula-input:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 2px var(--color-slot-1-tint);
      }

      .spreadsheet-container {
        overflow: auto;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
        background: var(--color-surface-raised);
      }

      .spreadsheet-table {
        border-collapse: collapse;
        min-width: 100%;
        font-size: var(--font-size-xs);
      }

      .spreadsheet-table td {
        border: 1px solid var(--color-border);
        padding: var(--spacing-sm);
        min-width: 80px;
        height: 32px;
        cursor: cell;
        background: white;
      }

      .spreadsheet-table td.selected {
        background: var(--color-slot-1-tint);
        border: 2px solid var(--color-accent);
        outline: 2px solid var(--color-accent);
      }

      .spreadsheet-table td.fmt-bold {
        font-weight: 700;
      }

      .spreadsheet-table td.fmt-italic {
        font-style: italic;
      }

      .spreadsheet-table td.fmt-underline {
        text-decoration: underline;
      }

      .spreadsheet-chart {
        padding: var(--spacing-md);
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
      }

      #chartCanvas {
        width: 100%;
        max-width: 500px;
        height: 300px;
        display: block;
        margin: 0 auto;
      }
    `;
    document.head.appendChild(style);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Spreadsheet;
}
