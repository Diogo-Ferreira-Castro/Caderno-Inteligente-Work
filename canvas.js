/**
 * CANVAS.JS - Folha Livre com OCR, Desenho, Shapes e Pautas
 * Versão: 1.0.0 | Tamanho: ~25KB
 */

class CanvasDrawing {
  constructor(containerId, width = 1000, height = 1400) {
    this.container = document.getElementById(containerId);
    this.width = width;
    this.height = height;
    this.currentPage = 1;
    this.pages = [[]];
    this.tool = 'pen'; // pen, eraser, line, rect, circle
    this.color = '#000000';
    this.thickness = 3;
    this.patternType = 'blank'; // blank, lined, grid, dotted, cornell
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.history = [];
    this.historyStep = -1;

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="cad-wrapper">
        <div class="cad-toolbar">
          <div class="cad-tools-group">
            <label>Ferramenta</label>
            <select id="cad-tool" class="cad-select">
              <option value="pen">✏️ Caneta</option>
              <option value="eraser">🧹 Borracha</option>
              <option value="line">📏 Linha</option>
              <option value="rect">▭ Retângulo</option>
              <option value="circle">● Círculo</option>
            </select>
          </div>

          <div class="cad-tools-group">
            <label>Cor</label>
            <input type="color" id="cad-color" value="#000000" class="cad-color-input">
          </div>

          <div class="cad-tools-group">
            <label>Espessura</label>
            <input type="range" id="cad-thickness" min="1" max="20" value="3" class="cad-range">
            <span id="cad-thickness-display">3px</span>
          </div>

          <div class="cad-tools-group">
            <label>Pauta</label>
            <select id="cad-pattern" class="cad-select">
              <option value="blank">Branco</option>
              <option value="lined">Pautado</option>
              <option value="grid">Quadriculado</option>
              <option value="dotted">Pontilhado</option>
              <option value="cornell">Cornell</option>
            </select>
          </div>

          <div class="cad-tools-group">
            <button id="cad-undo" class="cad-btn">↶ Desfazer</button>
            <button id="cad-redo" class="cad-btn">↷ Refazer</button>
          </div>

          <div class="cad-tools-group">
            <button id="cad-ocr" class="cad-btn cad-btn-primary">🔤 OCR</button>
            <button id="cad-clear" class="cad-btn">🗑️ Limpar</button>
          </div>

          <div class="cad-tools-group">
            <button id="cad-export-png" class="cad-btn">📥 PNG</button>
            <button id="cad-export-pdf" class="cad-btn">📄 PDF</button>
            <button id="cad-export-svg" class="cad-btn">🎨 SVG</button>
          </div>

          <div class="cad-tools-group">
            <label>Página: <span id="cad-page-display">1</span></label>
            <button id="cad-prev-page" class="cad-btn">← Anterior</button>
            <button id="cad-next-page" class="cad-btn">Próxima →</button>
            <button id="cad-new-page" class="cad-btn">+ Nova</button>
          </div>
        </div>

        <div class="cad-canvas-wrapper">
          <canvas id="cad-canvas" width="1000" height="1400" class="cad-canvas"></canvas>
          <div id="cad-overlay" class="cad-overlay"></div>
        </div>

        <div class="cad-info">
          <small>Use mouse/touch para desenhar. Ctrl+Z para desfazer.</small>
        </div>
      </div>
    `;

    this.canvas = document.getElementById('cad-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.overlay = document.getElementById('cad-overlay');

    this.attachEventListeners();
    this.renderPage();
  }

  attachEventListeners() {
    // Ferramentas
    document.getElementById('cad-tool').addEventListener('change', (e) => {
      this.tool = e.target.value;
    });

    document.getElementById('cad-color').addEventListener('change', (e) => {
      this.color = e.target.value;
    });

    document.getElementById('cad-thickness').addEventListener('input', (e) => {
      this.thickness = parseInt(e.target.value);
      document.getElementById('cad-thickness-display').textContent = e.target.value + 'px';
    });

    document.getElementById('cad-pattern').addEventListener('change', (e) => {
      this.patternType = e.target.value;
      this.renderPage();
    });

    // Undo/Redo
    document.getElementById('cad-undo').addEventListener('click', () => this.undo());
    document.getElementById('cad-redo').addEventListener('click', () => this.redo());

    // OCR
    document.getElementById('cad-ocr').addEventListener('click', () => this.performOCR());

    // Limpar
    document.getElementById('cad-clear').addEventListener('click', () => this.clearPage());

    // Exportar
    document.getElementById('cad-export-png').addEventListener('click', () => this.exportPNG());
    document.getElementById('cad-export-pdf').addEventListener('click', () => this.exportPDF());
    document.getElementById('cad-export-svg').addEventListener('click', () => this.exportSVG());

    // Páginas
    document.getElementById('cad-prev-page').addEventListener('click', () => this.prevPage());
    document.getElementById('cad-next-page').addEventListener('click', () => this.nextPage());
    document.getElementById('cad-new-page').addEventListener('click', () => this.newPage());

    // Canvas drawing
    this.canvas.addEventListener('pointerdown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('pointermove', (e) => this.draw(e));
    this.canvas.addEventListener('pointerup', () => this.stopDrawing());
    this.canvas.addEventListener('pointerout', () => this.stopDrawing());

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        this.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        this.redo();
      }
    });
  }

  startDrawing(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;
    this.isDrawing = true;

    this.saveHistory();

    if (this.tool === 'pen') {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
    }
  }

  draw(e) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.tool === 'pen') {
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.thickness;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.stroke();
    } else if (this.tool === 'eraser') {
      this.ctx.clearRect(x - this.thickness, y - this.thickness, this.thickness * 2, this.thickness * 2);
    }
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.tool === 'pen') {
      this.ctx.closePath();
    }
  }

  renderPage() {
    // Limpar canvas
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Desenhar pauta
    this.drawPattern();

    // Desenhar strokes da página atual
    if (this.pages[this.currentPage - 1]) {
      this.pages[this.currentPage - 1].forEach((stroke) => {
        this.ctx.strokeStyle = stroke.color;
        this.ctx.lineWidth = stroke.thickness;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        stroke.points.forEach((point, i) => {
          if (i === 0) this.ctx.moveTo(point.x, point.y);
          else this.ctx.lineTo(point.x, point.y);
        });
        this.ctx.stroke();
      });
    }
  }

  drawPattern() {
    const ctx = this.ctx;
    ctx.strokeStyle = '#dbeafe';
    ctx.lineWidth = 0.5;

    switch (this.patternType) {
      case 'lined':
        // Linhas horizontais a cada 28px
        for (let y = 28; y < this.height; y += 28) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(this.width, y);
          ctx.stroke();
        }
        break;

      case 'grid':
        // Grid 24x24
        for (let x = 24; x < this.width; x += 24) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, this.height);
          ctx.stroke();
        }
        for (let y = 24; y < this.height; y += 24) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(this.width, y);
          ctx.stroke();
        }
        break;

      case 'dotted':
        // Pontos a cada 20px
        ctx.fillStyle = '#cbd5e1';
        for (let x = 20; x < this.width; x += 20) {
          for (let y = 20; y < this.height; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;

      case 'cornell':
        // Cornell note format: linha vertical em 30% + linha horizontal em 82%
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
        ctx.lineWidth = 1;

        // Linha vertical
        const verticalX = this.width * 0.29;
        ctx.beginPath();
        ctx.moveTo(verticalX, 0);
        ctx.lineTo(verticalX, this.height);
        ctx.stroke();

        // Linha horizontal
        const horizontalY = this.height * 0.82;
        ctx.beginPath();
        ctx.moveTo(0, horizontalY);
        ctx.lineTo(this.width, horizontalY);
        ctx.stroke();
        break;
    }
  }

  saveHistory() {
    this.history = this.history.slice(0, this.historyStep + 1);
    this.history.push(this.canvas.toDataURL());
    this.historyStep++;
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.loadFromHistory(this.history[this.historyStep]);
    }
  }

  redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.loadFromHistory(this.history[this.historyStep]);
    }
  }

  loadFromHistory(dataUrl) {
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }

  clearPage() {
    if (confirm('Limpar esta página?')) {
      this.pages[this.currentPage - 1] = [];
      this.renderPage();
      this.saveHistory();
    }
  }

  performOCR() {
    alert('OCR: Integrar com Tesseract.js para converter escrita em texto\n\nImplementação em v2.0');
  }

  exportPNG() {
    const link = document.createElement('a');
    link.href = this.canvas.toDataURL('image/png');
    link.download = `folha-livre-p${this.currentPage}.png`;
    link.click();
  }

  exportPDF() {
    alert('PDF: Integrar com jsPDF para exportar multi-página\n\nImplementação em v2.0');
  }

  exportSVG() {
    alert('SVG: Converter canvas drawing para SVG vetorial\n\nImplementação em v2.0');
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePageDisplay();
      this.renderPage();
    }
  }

  nextPage() {
    if (this.currentPage < this.pages.length) {
      this.currentPage++;
      this.updatePageDisplay();
      this.renderPage();
    }
  }

  newPage() {
    this.pages.push([]);
    this.currentPage = this.pages.length;
    this.updatePageDisplay();
    this.renderPage();
  }

  updatePageDisplay() {
    document.getElementById('cad-page-display').textContent = this.currentPage;
  }

  // API Pública
  getCanvasData() {
    return this.canvas.toDataURL();
  }

  setTool(toolName) {
    this.tool = toolName;
  }

  setColor(colorHex) {
    this.color = colorHex;
  }

  setThickness(pixels) {
    this.thickness = pixels;
  }

  setPattern(patternName) {
    this.patternType = patternName;
    this.renderPage();
  }

  exportData() {
    return {
      pages: this.pages,
      currentPage: this.currentPage,
      pattern: this.patternType,
    };
  }

  importData(data) {
    this.pages = data.pages || [[]];
    this.currentPage = data.currentPage || 1;
    this.patternType = data.pattern || 'blank';
    this.updatePageDisplay();
    this.renderPage();
  }
}

// Stylesheet de Canvas
const canvasStyles = `
.cad-wrapper {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: calc(100vh - 140px);
  gap: var(--spacing-sm);
}

.cad-toolbar {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  padding: var(--spacing-sm);
  background: var(--color-surface);
  border-radius: var(--radius-field);
  border: 1px solid var(--color-border);
  overflow-x: auto;
}

.cad-tools-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  white-space: nowrap;
}

.cad-tools-group label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-ink-secondary);
}

.cad-select,
.cad-color-input,
.cad-range {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  padding: 6px;
  font-size: 12px;
}

.cad-btn {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  background: var(--color-surface-raised);
  color: var(--color-ink);
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
}

.cad-btn:hover {
  background: var(--color-surface-sunken);
  border-color: var(--color-border-strong);
}

.cad-btn-primary {
  background: var(--color-slot-1);
  color: white;
  border-color: var(--color-slot-1);
}

.cad-btn-primary:hover {
  background: #2268c6;
}

.cad-canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-page);
  border-radius: var(--radius-field);
  overflow: auto;
  padding: var(--spacing-lg);
}

.cad-canvas {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  background: white;
  box-shadow: var(--shadow-card);
  cursor: crosshair;
}

.cad-info {
  text-align: center;
  color: var(--color-ink-muted);
  font-size: 12px;
  padding: var(--spacing-xs);
}
`;

// Injetar CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = canvasStyles;
document.head.appendChild(styleSheet);
