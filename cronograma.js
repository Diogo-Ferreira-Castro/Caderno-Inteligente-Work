/**
 * CADERNO WORK V3.2+ - CRONOGRAMA COM GANTT VISUAL
 * Módulo para gerenciar projetos, tarefas, cronogramas, recursos e custos
 */

class CronogramaGantt {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.tasks = [];
    this.resources = [];
    this.zoomLevel = 'month'; // week, month, quarter, year
    this.selectedTask = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.setupDOM();
    this.setupEventListeners();
    this.render();
  }

  setupDOM() {
    this.container.innerHTML = `
      <div class="gantt-wrapper">
        <div class="gantt-toolbar">
          <div class="gantt-controls">
            <button class="gantt-zoom" data-zoom="week">Semana</button>
            <button class="gantt-zoom active" data-zoom="month">Mês</button>
            <button class="gantt-zoom" data-zoom="quarter">Trimestre</button>
            <button class="gantt-zoom" data-zoom="year">Ano</button>
          </div>
          <div class="gantt-filters">
            <input type="search" class="gantt-search" placeholder="Filtrar tarefas...">
            <select class="gantt-filter-status">
              <option value="">Todos os status</option>
              <option value="planejado">Planejado</option>
              <option value="progresso">Em Progresso</option>
              <option value="concluido">Concluído</option>
              <option value="atrasado">Atrasado</option>
            </select>
            <select class="gantt-filter-person">
              <option value="">Todas as pessoas</option>
            </select>
          </div>
        </div>

        <div class="gantt-container">
          <div class="gantt-left">
            <div class="gantt-header">Tarefas</div>
            <div class="gantt-tasks" id="ganttTasks"></div>
          </div>
          <div class="gantt-right">
            <div class="gantt-timeline" id="ganttTimeline"></div>
            <canvas id="ganttChart" class="gantt-canvas"></canvas>
          </div>
        </div>

        <div class="gantt-legend">
          <span class="gantt-legend-item planejado">Planejado</span>
          <span class="gantt-legend-item progresso">Em Progresso</span>
          <span class="gantt-legend-item concluido">Concluído</span>
          <span class="gantt-legend-item atrasado">Atrasado</span>
          <span class="gantt-legend-item milestone">📍 Marco</span>
        </div>

        <div class="gantt-details">
          <div class="gantt-task-details" id="taskDetails" style="display:none;">
            <h3 id="taskTitle"></h3>
            <div class="detail-group">
              <label>Responsável(eis)</label>
              <div id="taskResources" class="task-resources"></div>
            </div>
            <div class="detail-group">
              <label>Data Início</label>
              <input type="date" id="taskStart" class="gantt-input">
            </div>
            <div class="detail-group">
              <label>Data Fim</label>
              <input type="date" id="taskEnd" class="gantt-input">
            </div>
            <div class="detail-group">
              <label>Custo (R$)</label>
              <input type="number" id="taskCost" class="gantt-input">
            </div>
            <div class="detail-group">
              <label>Status</label>
              <select id="taskStatus" class="gantt-input">
                <option value="planejado">Planejado</option>
                <option value="progresso">Em Progresso</option>
                <option value="concluido">Concluído</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
            <div class="detail-group">
              <label>É Marcos?</label>
              <input type="checkbox" id="taskMilestone">
            </div>
            <div class="gantt-actions">
              <button class="btn-save" id="taskSave">Salvar</button>
              <button class="btn-delete" id="taskDelete">Deletar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  }

  setupEventListeners() {
    // Zoom controls
    this.container.querySelectorAll('.gantt-zoom').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.container.querySelectorAll('.gantt-zoom').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.zoomLevel = e.target.dataset.zoom;
        this.render();
      });
    });

    // Search and filters
    this.container.querySelector('.gantt-search').addEventListener('input', (e) => {
      this.filterTasks(e.target.value);
    });

    // Task selection
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.gantt-task-row')) {
        const taskId = e.target.closest('.gantt-task-row').dataset.taskId;
        this.selectTask(taskId);
      }
    });

    // Save and delete
    this.container.querySelector('#taskSave')?.addEventListener('click', () => this.saveTask());
    this.container.querySelector('#taskDelete')?.addEventListener('click', () => this.deleteTask());
  }

  addTask(task) {
    // task = { id, name, start, end, resources: [], cost, status, isMilestone }
    this.tasks.push({
      id: task.id || Date.now(),
      name: task.name,
      start: new Date(task.start),
      end: new Date(task.end),
      resources: task.resources || [],
      cost: task.cost || 0,
      status: task.status || 'planejado',
      isMilestone: task.isMilestone || false,
      progress: task.progress || 0
    });
    this.updateResourceList();
    this.render();
  }

  updateResourceList() {
    const allResources = new Set();
    this.tasks.forEach(t => {
      t.resources.forEach(r => allResources.add(r));
    });
    this.resources = Array.from(allResources);

    const filterSelect = this.container.querySelector('.gantt-filter-person');
    const currentValue = filterSelect.value;
    filterSelect.innerHTML = '<option value="">Todas as pessoas</option>';
    this.resources.forEach(r => {
      filterSelect.innerHTML += `<option value="${r}">${r}</option>`;
    });
    filterSelect.value = currentValue;
  }

  selectTask(taskId) {
    const task = this.tasks.find(t => t.id == taskId);
    if (!task) return;

    this.selectedTask = task;
    const detailsDiv = this.container.querySelector('#taskDetails');
    detailsDiv.style.display = 'block';
    detailsDiv.querySelector('#taskTitle').textContent = task.name;
    detailsDiv.querySelector('#taskStart').value = this.formatDateForInput(task.start);
    detailsDiv.querySelector('#taskEnd').value = this.formatDateForInput(task.end);
    detailsDiv.querySelector('#taskCost').value = task.cost;
    detailsDiv.querySelector('#taskStatus').value = task.status;
    detailsDiv.querySelector('#taskMilestone').checked = task.isMilestone;

    detailsDiv.querySelector('#taskResources').innerHTML = task.resources
      .map(r => `<div class="resource-tag">${r} <button data-resource="${r}">✕</button></div>`)
      .join('');

    // Highlight selected task
    this.container.querySelectorAll('.gantt-task-row').forEach(row => row.classList.remove('selected'));
    this.container.querySelector(`[data-task-id="${taskId}"]`)?.classList.add('selected');
  }

  saveTask() {
    if (!this.selectedTask) return;
    this.selectedTask.start = new Date(this.container.querySelector('#taskStart').value);
    this.selectedTask.end = new Date(this.container.querySelector('#taskEnd').value);
    this.selectedTask.cost = parseFloat(this.container.querySelector('#taskCost').value);
    this.selectedTask.status = this.container.querySelector('#taskStatus').value;
    this.selectedTask.isMilestone = this.container.querySelector('#taskMilestone').checked;
    this.render();
  }

  deleteTask() {
    if (!this.selectedTask) return;
    this.tasks = this.tasks.filter(t => t.id !== this.selectedTask.id);
    this.selectedTask = null;
    this.container.querySelector('#taskDetails').style.display = 'none';
    this.updateResourceList();
    this.render();
  }

  filterTasks(searchTerm) {
    const filtered = this.tasks.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.renderTasks(filtered);
  }

  render() {
    this.renderTasks(this.tasks);
    this.renderTimeline();
    this.renderBars();
  }

  renderTasks(tasks = this.tasks) {
    const container = this.container.querySelector('#ganttTasks');
    container.innerHTML = tasks.map(task => `
      <div class="gantt-task-row ${task.status}" data-task-id="${task.id}">
        <div class="task-info">
          <div class="task-name">${task.name}</div>
          <div class="task-meta">
            ${task.resources.length > 0 ? `<span class="resources">${task.resources.join(', ')}</span>` : ''}
            ${task.cost > 0 ? `<span class="cost">R$ ${this.formatCurrency(task.cost)}</span>` : ''}
          </div>
        </div>
        <div class="task-status-badge">${this.getStatusLabel(task.status)}</div>
      </div>
    `).join('');
  }

  renderTimeline() {
    const timeline = this.container.querySelector('#ganttTimeline');
    const dates = this.getTimelineDates();
    timeline.innerHTML = dates.map(date => `
      <div class="timeline-header-cell" data-date="${date}">
        ${this.formatDateHeader(date)}
      </div>
    `).join('');
  }

  renderBars() {
    const canvas = this.container.querySelector('#ganttChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const taskHeight = 45;
    const timelineWidth = canvas.width;
    const startDate = this.getMinDate();
    const endDate = this.getMaxDate();
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const pxPerDay = timelineWidth / totalDays;

    canvas.height = this.tasks.length * taskHeight + 40;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '12px Inter';
    ctx.fillStyle = '#666';

    // Grid lines
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i < this.tasks.length; i++) {
      const y = 40 + i * taskHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(timelineWidth, y);
      ctx.stroke();
    }

    // Task bars
    this.tasks.forEach((task, index) => {
      const y = 40 + index * taskHeight + 15;
      const startX = (task.start - startDate) / (1000 * 60 * 60 * 24) * pxPerDay;
      const barWidth = (task.end - task.start) / (1000 * 60 * 60 * 24) * pxPerDay;

      // Bar color based on status
      ctx.fillStyle = this.getStatusColor(task.status);
      ctx.fillRect(startX, y, Math.max(barWidth, 80), 20);

      // Milestone marker
      if (task.isMilestone) {
        ctx.fillStyle = '#7c5cff';
        ctx.fillRect(startX + barWidth - 8, y - 8, 16, 16);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('📍', startX + barWidth - 6, y + 2);
      }

      // Progress bar
      if (task.progress > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(startX, y, (barWidth * task.progress / 100), 20);
      }

      // Text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Inter';
      ctx.fillText(task.name.substring(0, 20), startX + 4, y + 14);
    });

    // Today marker
    const today = new Date();
    const todayX = (today - startDate) / (1000 * 60 * 60 * 24) * pxPerDay;
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(todayX, 0);
    ctx.lineTo(todayX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fb7185';
    ctx.font = 'bold 10px Inter';
    ctx.fillText('Hoje', todayX + 4, 15);
  }

  getTimelineDates() {
    const start = this.getMinDate();
    const end = this.getMaxDate();
    const dates = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      if (this.zoomLevel === 'week') {
        current.setDate(current.getDate() + 7);
      } else if (this.zoomLevel === 'month') {
        current.setMonth(current.getMonth() + 1);
      } else if (this.zoomLevel === 'quarter') {
        current.setMonth(current.getMonth() + 3);
      } else {
        current.setFullYear(current.getFullYear() + 1);
      }
    }
    return dates;
  }

  getMinDate() {
    return new Date(Math.min(...this.tasks.map(t => t.start.getTime())));
  }

  getMaxDate() {
    return new Date(Math.max(...this.tasks.map(t => t.end.getTime())));
  }

  getStatusLabel(status) {
    const labels = {
      'planejado': '📋 Planejado',
      'progresso': '⏳ Progresso',
      'concluido': '✅ Concluído',
      'atrasado': '🔴 Atrasado'
    };
    return labels[status] || status;
  }

  getStatusColor(status) {
    const colors = {
      'planejado': '#7c5cff',
      'progresso': '#38bdf8',
      'concluido': '#34d399',
      'atrasado': '#fb7185'
    };
    return colors[status] || '#999';
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateHeader(date) {
    if (this.zoomLevel === 'week') {
      return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
    } else if (this.zoomLevel === 'month') {
      return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    } else {
      return date.toLocaleDateString('pt-BR', { year: 'numeric' });
    }
  }

  addStyles() {
    if (document.getElementById('gantt-styles')) return;

    const style = document.createElement('style');
    style.id = 'gantt-styles';
    style.textContent = `
      .gantt-wrapper {
        display: grid;
        grid-template-rows: auto auto auto 1fr auto;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg);
        background: var(--color-page);
        border-radius: var(--radius-card);
      }

      .gantt-toolbar {
        display: flex;
        gap: var(--spacing-lg);
        flex-wrap: wrap;
        align-items: center;
        padding: var(--spacing-md) var(--spacing-lg);
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
      }

      .gantt-controls, .gantt-filters {
        display: flex;
        gap: var(--spacing-md);
        align-items: center;
      }

      .gantt-zoom {
        padding: var(--spacing-sm) var(--spacing-lg);
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        border-radius: var(--radius-field);
        cursor: pointer;
        transition: var(--transition-base);
        font-size: var(--font-size-xs);
        font-weight: 600;
      }

      .gantt-zoom:hover {
        border-color: var(--color-accent);
        background: var(--color-slot-1-tint);
      }

      .gantt-zoom.active {
        background: var(--color-accent);
        color: white;
        border-color: var(--color-accent);
      }

      .gantt-search, .gantt-filter-status, .gantt-filter-person {
        padding: var(--spacing-sm) var(--spacing-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
        font-size: var(--font-size-xs);
        background: var(--color-surface);
      }

      .gantt-container {
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: var(--spacing-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
        overflow: hidden;
        background: var(--color-surface-raised);
      }

      .gantt-left {
        border-right: 1px solid var(--color-border);
        max-height: 400px;
        overflow-y: auto;
      }

      .gantt-header {
        font-weight: 700;
        font-size: var(--font-size-xs);
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--color-border);
        background: var(--color-surface-sunken);
      }

      .gantt-task-row {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--color-border);
        cursor: pointer;
        transition: var(--transition-fast);
      }

      .gantt-task-row:hover {
        background: var(--color-surface-sunken);
      }

      .gantt-task-row.selected {
        background: var(--color-slot-1-tint);
        border-left: 3px solid var(--color-accent);
      }

      .task-name {
        font-weight: 700;
        font-size: var(--font-size-xs);
        color: var(--color-ink);
      }

      .task-meta {
        font-size: 10px;
        color: var(--color-ink-muted);
        margin-top: 4px;
      }

      .task-status-badge {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--color-border);
        margin-top: 4px;
        width: fit-content;
      }

      .gantt-legend {
        display: flex;
        gap: var(--spacing-lg);
        flex-wrap: wrap;
        padding: var(--spacing-md);
        font-size: var(--font-size-xs);
      }

      .gantt-legend-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .gantt-legend-item.planejado::before {
        content: '█';
        color: #7c5cff;
      }

      .gantt-legend-item.progresso::before {
        content: '█';
        color: #38bdf8;
      }

      .gantt-legend-item.concluido::before {
        content: '█';
        color: #34d399;
      }

      .gantt-legend-item.atrasado::before {
        content: '█';
        color: #fb7185;
      }

      .gantt-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg);
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
      }

      .gantt-task-details {
        display: grid;
        gap: var(--spacing-md);
      }

      .detail-group {
        display: grid;
        gap: 4px;
      }

      .detail-group label {
        font-size: var(--font-size-xs);
        font-weight: 700;
        color: var(--color-ink-muted);
      }

      .gantt-input {
        padding: var(--spacing-sm);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-field);
        font-size: var(--font-size-xs);
      }

      .gantt-actions {
        display: flex;
        gap: var(--spacing-md);
        margin-top: var(--spacing-md);
      }

      .btn-save, .btn-delete {
        padding: var(--spacing-sm) var(--spacing-lg);
        border: none;
        border-radius: var(--radius-field);
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition-fast);
      }

      .btn-save {
        background: var(--color-accent);
        color: white;
      }

      .btn-save:hover {
        opacity: 0.9;
      }

      .btn-delete {
        background: var(--color-critical);
        color: white;
      }

      .btn-delete:hover {
        opacity: 0.9;
      }

      .gantt-canvas {
        width: 100%;
        display: block;
      }
    `;
    document.head.appendChild(style);
  }

  // Public methods for integration
  getTotalCost() {
    return this.tasks.reduce((sum, t) => sum + t.cost, 0);
  }

  getTasksByPerson(person) {
    return this.tasks.filter(t => t.resources.includes(person));
  }

  getCompletionPercentage() {
    const completed = this.tasks.filter(t => t.status === 'concluido').length;
    return this.tasks.length > 0 ? (completed / this.tasks.length) * 100 : 0;
  }

  exportJSON() {
    return JSON.stringify(this.tasks, null, 2);
  }

  importJSON(jsonData) {
    this.tasks = JSON.parse(jsonData);
    this.updateResourceList();
    this.render();
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CronogramaGantt;
}
