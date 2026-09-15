/**
 * CADERNOS.JS - Gerenciador de Organização (Pastas, Tags, Templates, Contexto)
 * Versão: 1.0.0 | Tamanho: ~28KB
 */

class CadernosManager {
  constructor(containerId, initialData = {}) {
    this.container = document.getElementById(containerId);
    this.cadernos = initialData.cadernos || [];
    this.folders = initialData.folders || [];
    this.tags = initialData.tags || [];
    this.templates = initialData.templates || [];
    this.selectedCaderno = null;
    this.selectedFolder = null;
    this.filterTag = null;
    this.filterContext = null;
    this.contextTypes = ['pessoal', 'trabalho', 'estudo'];
    this.contextColors = {
      pessoal: '#2a78d6',
      trabalho: '#eb6834',
      estudo: '#1baf7a'
    };
    this.templateTypes = ['blank', 'checklist', 'diary', 'notes', 'project'];

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="cad-manager-wrapper">
        <div class="cad-manager-sidebar">
          <div class="cad-manager-header">
            <h2>📚 Cadernos</h2>
            <button id="cad-new-caderno" class="cad-manager-btn">+ Novo</button>
          </div>

          <div class="cad-folder-tree">
            <div class="cad-folder-item active" data-folder-id="root">
              <span class="cad-folder-icon">📂</span>
              <span class="cad-folder-name">Todos os Cadernos</span>
              <span class="cad-folder-count">${this.cadernos.length}</span>
            </div>
            <div id="cad-folders-list"></div>
          </div>

          <div class="cad-manager-divider"></div>

          <div class="cad-context-filter">
            <label>Contexto</label>
            <div class="cad-context-buttons">
              <button class="cad-context-btn" data-context="pessoal">👤 Pessoal</button>
              <button class="cad-context-btn" data-context="trabalho">💼 Trabalho</button>
              <button class="cad-context-btn" data-context="estudo">📖 Estudo</button>
            </div>
          </div>

          <div class="cad-manager-divider"></div>

          <div class="cad-tag-cloud">
            <label>Tags Populares</label>
            <div id="cad-tags-list" class="cad-tags-list"></div>
          </div>

          <div class="cad-manager-divider"></div>

          <div class="cad-templates-section">
            <label>Templates</label>
            <div id="cad-templates-list"></div>
          </div>
        </div>

        <div class="cad-manager-main">
          <div class="cad-manager-toolbar">
            <div class="cad-manager-search">
              <input type="text" id="cad-search" placeholder="🔍 Buscar cadernos..." class="cad-manager-input">
            </div>
            <div class="cad-manager-view-modes">
              <button id="cad-view-list" class="cad-view-btn active" title="Visualização em lista">☰</button>
              <button id="cad-view-grid" class="cad-view-btn" title="Visualização em grid">⊞</button>
            </div>
          </div>

          <div id="cad-cadernos-list" class="cad-cadernos-list view-list"></div>
        </div>

        <div class="cad-manager-modal" id="cad-modal" hidden>
          <div class="cad-modal-overlay"></div>
          <div class="cad-modal-content">
            <div class="cad-modal-header">
              <h3 id="cad-modal-title">Novo Caderno</h3>
              <button class="cad-modal-close">✕</button>
            </div>
            <div class="cad-modal-body">
              <div class="cad-form-group">
                <label>Nome do Caderno</label>
                <input type="text" id="cad-input-name" placeholder="ex: Anotações de Meeting" class="cad-manager-input">
              </div>
              <div class="cad-form-group">
                <label>Contexto</label>
                <select id="cad-input-context" class="cad-manager-select">
                  <option value="pessoal">👤 Pessoal</option>
                  <option value="trabalho">💼 Trabalho</option>
                  <option value="estudo">📖 Estudo</option>
                </select>
              </div>
              <div class="cad-form-group">
                <label>Pasta</label>
                <select id="cad-input-folder" class="cad-manager-select">
                  <option value="">Raiz</option>
                </select>
              </div>
              <div class="cad-form-group">
                <label>Template</label>
                <select id="cad-input-template" class="cad-manager-select">
                  <option value="blank">📄 Em Branco</option>
                  <option value="checklist">✓ Checklist</option>
                  <option value="diary">📔 Diário</option>
                  <option value="notes">📝 Notas</option>
                  <option value="project">📊 Projeto</option>
                </select>
              </div>
              <div class="cad-form-group">
                <label>Tags (separadas por vírgula)</label>
                <input type="text" id="cad-input-tags" placeholder="ex: importante, reunião, follow-up" class="cad-manager-input">
              </div>
            </div>
            <div class="cad-modal-footer">
              <button id="cad-modal-cancel" class="cad-manager-btn-secondary">Cancelar</button>
              <button id="cad-modal-save" class="cad-manager-btn-primary">Criar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.renderCadernos();
    this.renderFolders();
    this.renderTags();
    this.renderTemplates();
  }

  attachEventListeners() {
    // Novo caderno
    document.getElementById('cad-new-caderno').addEventListener('click', () => this.openNewCadernoModal());

    // Modal
    document.getElementById('cad-modal-save').addEventListener('click', () => this.saveCaderno());
    document.getElementById('cad-modal-cancel').addEventListener('click', () => this.closeModal());
    document.querySelector('.cad-modal-close').addEventListener('click', () => this.closeModal());
    document.querySelector('.cad-modal-overlay').addEventListener('click', () => this.closeModal());

    // Filtro por contexto
    document.querySelectorAll('.cad-context-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.cad-context-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.filterContext = e.target.dataset.context;
        this.renderCadernos();
      });
    });

    // Modo de visualização
    document.getElementById('cad-view-list').addEventListener('click', () => {
      document.getElementById('cad-cadernos-list').classList.remove('view-grid');
      document.getElementById('cad-cadernos-list').classList.add('view-list');
      document.getElementById('cad-view-list').classList.add('active');
      document.getElementById('cad-view-grid').classList.remove('active');
    });

    document.getElementById('cad-view-grid').addEventListener('click', () => {
      document.getElementById('cad-cadernos-list').classList.remove('view-list');
      document.getElementById('cad-cadernos-list').classList.add('view-grid');
      document.getElementById('cad-view-grid').classList.add('active');
      document.getElementById('cad-view-list').classList.remove('active');
    });

    // Busca
    document.getElementById('cad-search').addEventListener('input', (e) => {
      this.filterCadernos(e.target.value);
    });

    // Pastas
    document.querySelectorAll('.cad-folder-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.cad-folder-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.selectedFolder = item.dataset.folderId;
        this.renderCadernos();
      });
    });
  }

  openNewCadernoModal() {
    const modal = document.getElementById('cad-modal');
    document.getElementById('cad-modal-title').textContent = 'Novo Caderno';
    document.getElementById('cad-input-name').value = '';
    document.getElementById('cad-input-context').value = 'pessoal';
    document.getElementById('cad-input-folder').value = '';
    document.getElementById('cad-input-template').value = 'blank';
    document.getElementById('cad-input-tags').value = '';
    modal.hidden = false;
  }

  closeModal() {
    document.getElementById('cad-modal').hidden = true;
  }

  saveCaderno() {
    const name = document.getElementById('cad-input-name').value.trim();
    if (!name) {
      alert('Nome do caderno é obrigatório');
      return;
    }

    const caderno = {
      id: 'cad-' + Date.now(),
      name: name,
      context: document.getElementById('cad-input-context').value,
      folder: document.getElementById('cad-input-folder').value || null,
      template: document.getElementById('cad-input-template').value,
      tags: document.getElementById('cad-input-tags').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      archived: false,
      color: null
    };

    this.cadernos.push(caderno);
    this.renderCadernos();
    this.renderTags();
    this.closeModal();
  }

  createFolder() {
    const name = prompt('Nome da pasta:');
    if (!name) return;

    const folder = {
      id: 'fold-' + Date.now(),
      name: name,
      parentId: this.selectedFolder || null,
      color: null
    };

    this.folders.push(folder);
    this.renderFolders();
  }

  deleteFolder(folderId) {
    if (confirm('Deletar pasta? Cadernos não serão afetados.')) {
      this.folders = this.folders.filter(f => f.id !== folderId);
      this.renderFolders();
    }
  }

  renameFolder(folderId) {
    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) return;

    const newName = prompt('Novo nome:', folder.name);
    if (newName && newName.trim()) {
      folder.name = newName.trim();
      this.renderFolders();
    }
  }

  archiveCaderno(cadernoId) {
    const caderno = this.cadernos.find(c => c.id === cadernoId);
    if (caderno) {
      caderno.archived = true;
      caderno.modifiedAt = new Date().toISOString();
      this.renderCadernos();
    }
  }

  restoreCaderno(cadernoId) {
    const caderno = this.cadernos.find(c => c.id === cadernoId);
    if (caderno) {
      caderno.archived = false;
      caderno.modifiedAt = new Date().toISOString();
      this.renderCadernos();
    }
  }

  deleteCaderno(cadernoId) {
    if (confirm('Deletar caderno permanentemente?')) {
      this.cadernos = this.cadernos.filter(c => c.id !== cadernoId);
      this.renderCadernos();
      this.renderTags();
    }
  }

  renameCaderno(cadernoId) {
    const caderno = this.cadernos.find(c => c.id === cadernoId);
    if (!caderno) return;

    const newName = prompt('Novo nome:', caderno.name);
    if (newName && newName.trim()) {
      caderno.name = newName.trim();
      caderno.modifiedAt = new Date().toISOString();
      this.renderCadernos();
    }
  }

  filterCadernos(searchTerm) {
    const term = searchTerm.toLowerCase();
    document.querySelectorAll('.cad-caderno-card').forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const tags = card.dataset.tags.toLowerCase();
      const visible = name.includes(term) || tags.includes(term);
      card.style.display = visible ? '' : 'none';
    });
  }

  renderCadernos() {
    const list = document.getElementById('cad-cadernos-list');
    let filtered = this.cadernos;

    // Filtrar por pasta
    if (this.selectedFolder && this.selectedFolder !== 'root') {
      filtered = filtered.filter(c => c.folder === this.selectedFolder);
    } else if (this.selectedFolder === 'root') {
      filtered = filtered.filter(c => !c.folder);
    }

    // Filtrar por contexto
    if (this.filterContext) {
      filtered = filtered.filter(c => c.context === this.filterContext);
    }

    // Não mostrar arquivados
    filtered = filtered.filter(c => !c.archived);

    if (filtered.length === 0) {
      list.innerHTML = '<div class="cad-empty-state">📭 Nenhum caderno encontrado</div>';
      return;
    }

    list.innerHTML = filtered.map(c => `
      <div class="cad-caderno-card" data-name="${c.name}" data-tags="${c.tags.join(' ')}">
        <div class="cad-caderno-header">
          <div class="cad-caderno-context" style="background-color: ${this.contextColors[c.context]}"></div>
          <span class="cad-caderno-template">${this.getTemplateIcon(c.template)}</span>
          <button class="cad-caderno-menu">⋮</button>
        </div>
        <div class="cad-caderno-title">${c.name}</div>
        <div class="cad-caderno-tags">
          ${c.tags.map(tag => `<span class="cad-tag">#${tag}</span>`).join('')}
        </div>
        <div class="cad-caderno-footer">
          <small>${new Date(c.modifiedAt).toLocaleDateString('pt-BR')}</small>
        </div>
      </div>
    `).join('');

    // Eventos do menu
    document.querySelectorAll('.cad-caderno-menu').forEach((btn, idx) => {
      btn.addEventListener('click', () => this.showCadernoMenu(filtered[idx], btn));
    });
  }

  showCadernoMenu(caderno, button) {
    const menu = document.createElement('div');
    menu.className = 'cad-context-menu';
    menu.innerHTML = `
      <button data-action="rename">✏️ Renomear</button>
      <button data-action="archive">📦 Arquivar</button>
      <button data-action="delete">🗑️ Deletar</button>
    `;

    // Posição do menu
    const rect = button.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 5) + 'px';
    menu.style.left = (rect.left - 100) + 'px';
    menu.style.zIndex = 10000;

    document.body.appendChild(menu);

    menu.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'rename') this.renameCaderno(caderno.id);
        if (action === 'archive') this.archiveCaderno(caderno.id);
        if (action === 'delete') this.deleteCaderno(caderno.id);
        menu.remove();
      });
    });

    // Fechar ao clicar fora
    const closeMenu = () => {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  renderFolders() {
    const list = document.getElementById('cad-folders-list');
    const rootFolders = this.folders.filter(f => !f.parentId);

    list.innerHTML = rootFolders.map(folder => `
      <div class="cad-folder-item" data-folder-id="${folder.id}">
        <span class="cad-folder-icon">📁</span>
        <span class="cad-folder-name">${folder.name}</span>
        <span class="cad-folder-count">${this.cadernos.filter(c => c.folder === folder.id).length}</span>
      </div>
    `).join('');

    // Reattach listeners
    document.querySelectorAll('.cad-folder-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.cad-folder-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.selectedFolder = item.dataset.folderId;
        this.renderCadernos();
      });
    });
  }

  renderTags() {
    const list = document.getElementById('cad-tags-list');
    const tagFreq = {};

    // Contar frequência de tags
    this.cadernos.forEach(c => {
      c.tags.forEach(tag => {
        tagFreq[tag] = (tagFreq[tag] || 0) + 1;
      });
    });

    // Top 10 tags ordenadas por frequência
    const topTags = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    if (topTags.length === 0) {
      list.innerHTML = '<p style="color: var(--color-ink-muted); font-size: 12px;">Sem tags ainda</p>';
      return;
    }

    list.innerHTML = topTags.map(({ tag, count }) => `
      <span class="cad-tag-cloud-item" data-tag="${tag}">
        #${tag}
        <small>${count}</small>
      </span>
    `).join('');

    // Filtro por tag
    document.querySelectorAll('.cad-tag-cloud-item').forEach(item => {
      item.addEventListener('click', () => {
        this.filterTag = item.dataset.tag;
        // Filter by tag in display
        document.querySelectorAll('.cad-caderno-card').forEach(card => {
          const tags = card.dataset.tags;
          card.style.display = tags.includes(this.filterTag) ? '' : 'none';
        });
      });
    });
  }

  renderTemplates() {
    const list = document.getElementById('cad-templates-list');
    const templates = [
      { type: 'blank', icon: '📄', name: 'Em Branco' },
      { type: 'checklist', icon: '✓', name: 'Checklist' },
      { type: 'diary', icon: '📔', name: 'Diário' },
      { type: 'notes', icon: '📝', name: 'Notas' },
      { type: 'project', icon: '📊', name: 'Projeto' }
    ];

    list.innerHTML = templates.map(t => `
      <button class="cad-template-btn" data-template="${t.type}" title="${t.name}">
        ${t.icon}
      </button>
    `).join('');

    // Quick create com template
    document.querySelectorAll('.cad-template-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const template = btn.dataset.template;
        const caderno = {
          id: 'cad-' + Date.now(),
          name: `Novo ${btn.title}`,
          context: 'pessoal',
          folder: null,
          template: template,
          tags: [],
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          archived: false
        };
        this.cadernos.push(caderno);
        this.renderCadernos();
        this.renderTags();
      });
    });
  }

  getTemplateIcon(template) {
    const icons = {
      blank: '📄',
      checklist: '✓',
      diary: '📔',
      notes: '📝',
      project: '📊'
    };
    return icons[template] || '📄';
  }

  // API Pública
  addCaderno(caderno) {
    this.cadernos.push(caderno);
    this.renderCadernos();
    this.renderTags();
  }

  getCadernos(context = null) {
    if (context) {
      return this.cadernos.filter(c => c.context === context && !c.archived);
    }
    return this.cadernos.filter(c => !c.archived);
  }

  getArchivedCadernos() {
    return this.cadernos.filter(c => c.archived);
  }

  addFolder(folder) {
    this.folders.push(folder);
    this.renderFolders();
  }

  getFolders() {
    return this.folders;
  }

  getTags() {
    const tags = {};
    this.cadernos.forEach(c => {
      c.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });
    return tags;
  }

  exportData() {
    return {
      cadernos: this.cadernos,
      folders: this.folders,
      tags: this.getTags(),
      templates: this.templates
    };
  }

  importData(data) {
    if (data.cadernos) this.cadernos = data.cadernos;
    if (data.folders) this.folders = data.folders;
    this.renderCadernos();
    this.renderFolders();
    this.renderTags();
  }
}

// Stylesheet de Cadernos Manager
const cadernosStyles = `
.cad-manager-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: calc(100vh - 140px);
  gap: var(--spacing-sm);
}

.cad-manager-sidebar {
  background: var(--color-surface);
  border-radius: var(--radius-field);
  border: 1px solid var(--color-border);
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.cad-manager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.cad-manager-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-ink);
}

.cad-manager-btn {
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

.cad-manager-btn:hover {
  background: var(--color-surface-sunken);
}

.cad-manager-btn-primary {
  background: var(--color-slot-1);
  color: white;
  border-color: var(--color-slot-1);
}

.cad-manager-btn-primary:hover {
  background: #2268c6;
}

.cad-manager-btn-secondary {
  background: var(--color-surface-raised);
  color: var(--color-ink);
  border: 1px solid var(--color-border);
}

.cad-folder-tree {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.cad-folder-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-field);
  cursor: pointer;
  transition: var(--transition-base);
  font-size: 13px;
  color: var(--color-ink-secondary);
}

.cad-folder-item:hover {
  background: var(--color-surface-sunken);
}

.cad-folder-item.active {
  background: var(--color-slot-1);
  color: white;
  font-weight: 600;
}

.cad-folder-icon {
  flex-shrink: 0;
}

.cad-folder-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cad-folder-count {
  font-size: 11px;
  background: var(--color-surface);
  padding: 2px 6px;
  border-radius: 3px;
}

.cad-manager-divider {
  height: 1px;
  background: var(--color-border);
}

.cad-context-filter {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.cad-context-filter label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-ink-secondary);
}

.cad-context-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.cad-context-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  background: var(--color-surface-raised);
  color: var(--color-ink);
  font-size: 12px;
  cursor: pointer;
  transition: var(--transition-base);
}

.cad-context-btn:hover {
  background: var(--color-surface-sunken);
}

.cad-context-btn.active {
  background: var(--color-slot-1);
  color: white;
  border-color: var(--color-slot-1);
}

.cad-tag-cloud {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.cad-tag-cloud label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-ink-secondary);
}

.cad-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.cad-tag-cloud-item {
  font-size: 11px;
  background: var(--color-surface-sunken);
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  transition: var(--transition-base);
  color: var(--color-ink-secondary);
}

.cad-tag-cloud-item:hover {
  background: var(--color-slot-1);
  color: white;
}

.cad-tag-cloud-item small {
  margin-left: 4px;
  opacity: 0.7;
}

.cad-templates-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.cad-templates-section label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-ink-secondary);
}

.cad-templates-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

#cad-templates-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-xs);
}

.cad-template-btn {
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  background: var(--color-surface-raised);
  font-size: 16px;
  cursor: pointer;
  transition: var(--transition-base);
}

.cad-template-btn:hover {
  background: var(--color-slot-1);
  color: white;
  border-color: var(--color-slot-1);
}

.cad-manager-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.cad-manager-toolbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-surface);
  border-radius: var(--radius-field);
  border: 1px solid var(--color-border);
}

.cad-manager-search {
  flex: 1;
}

.cad-manager-input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  padding: 8px 12px;
  font-size: 13px;
  width: 100%;
}

.cad-manager-select {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  padding: 8px 12px;
  font-size: 13px;
  background: var(--color-surface-raised);
}

.cad-manager-view-modes {
  display: flex;
  gap: var(--spacing-xs);
}

.cad-view-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  background: var(--color-surface-raised);
  cursor: pointer;
  transition: var(--transition-base);
}

.cad-view-btn.active {
  background: var(--color-slot-1);
  color: white;
  border-color: var(--color-slot-1);
}

.cad-cadernos-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
  background: var(--color-surface);
  border-radius: var(--radius-field);
  border: 1px solid var(--color-border);
}

.cad-cadernos-list.view-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.cad-cadernos-list.view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.cad-caderno-card {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: var(--transition-base);
}

.cad-caderno-card:hover {
  box-shadow: var(--shadow-card);
  border-color: var(--color-slot-1);
}

.cad-caderno-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.cad-caderno-context {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cad-caderno-template {
  font-size: 16px;
}

.cad-caderno-menu {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-ink-secondary);
  font-size: 16px;
  padding: 4px;
}

.cad-caderno-title {
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: var(--spacing-xs);
  font-size: 14px;
}

.cad-caderno-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: var(--spacing-xs);
}

.cad-tag {
  font-size: 11px;
  background: var(--color-surface-sunken);
  color: var(--color-ink-secondary);
  padding: 2px 6px;
  border-radius: 3px;
}

.cad-caderno-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--color-border);
  color: var(--color-ink-muted);
  font-size: 11px;
}

.cad-empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-ink-muted);
  font-size: 14px;
}

.cad-manager-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.cad-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.cad-modal-content {
  position: relative;
  background: var(--color-surface-raised);
  border-radius: var(--radius-field);
  box-shadow: var(--shadow-pop);
  max-width: 400px;
  width: 90%;
}

.cad-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.cad-modal-header h3 {
  margin: 0;
  color: var(--color-ink);
}

.cad-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: var(--color-ink-secondary);
}

.cad-modal-body {
  padding: var(--spacing-md);
}

.cad-form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.cad-form-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink);
}

.cad-modal-footer {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  justify-content: flex-end;
}

.cad-modal-footer button {
  padding: 8px 16px;
  border-radius: var(--radius-field);
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition-base);
}

.cad-context-menu {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  box-shadow: var(--shadow-pop);
  overflow: hidden;
  min-width: 120px;
}

.cad-context-menu button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 12px;
  color: var(--color-ink);
  transition: var(--transition-base);
}

.cad-context-menu button:hover {
  background: var(--color-surface-sunken);
}

@media (max-width: 1100px) {
  .cad-manager-wrapper {
    grid-template-columns: 1fr;
  }
  .cad-manager-sidebar {
    display: none;
  }
}
`;

// Injetar CSS
const cadernosStyleSheet = document.createElement('style');
cadernosStyleSheet.textContent = cadernosStyles;
document.head.appendChild(cadernosStyleSheet);
