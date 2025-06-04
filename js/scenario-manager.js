/**
 * Gestisce gli scenari di investimento dell'ETF Simulator.
 */
const ScenarioManager = {
  scenarios: [],
  activeScenario: null,

  /**
   * Inizializza lo scenario manager caricando i dati dal localStorage
   */
  init() {
    this.scenarios = Utils.storage.get('scenarios', []);
    this.render();
    console.log('ScenarioManager inizializzato con', this.scenarios.length, 'scenari');
  },

  /**
   * Aggiunge uno scenario nuovo o esistente
   * @param {Object|null} scenario - Scenario da aggiungere (opzionale)
   */
  add(scenario = null) {
    const newScenario = scenario || {
      id: Utils.generateId(),
      name: `Scenario ${this.scenarios.length + 1}`,
      expectedReturn: 7.0,
      volatility: 15,
      description: '',
      active: false
    };
    this.scenarios.push(newScenario);
    this.save();
    this.render();

    // Apri il modal di modifica per il nuovo scenario
    this.edit(newScenario.id);
  },

  /**
   * Rimuove uno scenario
   * @param {string} id - ID dello scenario
   */
  remove(id) {
    const index = this.scenarios.findIndex(s => s.id === id);
    if (index > -1) {
      this.scenarios.splice(index, 1);
      this.save();
      this.render();
      Utils.showToast('Scenario eliminato', 'success');
    }
  },

  /**
   * Modifica uno scenario mostrando un modal
   * @param {string} id - ID dello scenario
   */
  edit(id) {
    const scenario = this.scenarios.find(s => s.id === id);
    if (!scenario) return;

    const modal = this.createEditModal(scenario);
    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  },

  /**
   * Crea un modal per modificare uno scenario
   * @param {Object} scenario - Lo scenario da modificare
   * @returns {HTMLElement}
   */
  createEditModal(scenario) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-edit me-2"></i>Modifica Scenario</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="scenarioForm">
              <div class="mb-3">
                <label class="form-label">Nome Scenario</label>
                <input type="text" class="form-control" id="scenarioName" value="${scenario.name}" required>
              </div>
              <div class="row">
                <div class="col-6">
                  <label class="form-label">Rendimento Atteso (%)</label>
                  <input type="number" class="form-control" id="scenarioReturn" 
                         value="${scenario.expectedReturn}" min="-50" max="50" step="0.1" required>
                </div>
                <div class="col-6">
                  <label class="form-label">Volatilità (%)</label>
                  <input type="number" class="form-control" id="scenarioVolatility" 
                         value="${scenario.volatility}" min="0" max="100" step="0.1" required>
                </div>
              </div>
              <div class="mb-3 mt-3">
                <label class="form-label">Descrizione</label>
                <textarea class="form-control" id="scenarioDescription" rows="3">${scenario.description}</textarea>
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="scenarioActive" ${scenario.active ? 'checked' : ''}>
                <label class="form-check-label">Scenario Attivo</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
            <button type="button" class="btn btn-danger" onclick="ScenarioManager.confirmDelete('${scenario.id}', this)">
              <i class="fas fa-trash me-1"></i>Elimina
            </button>
            <button type="button" class="btn btn-primary" onclick="ScenarioManager.save('${scenario.id}')">
              <i class="fas fa-save me-1"></i>Salva
            </button>
          </div>
        </div>
      </div>
    `;
    return modal;
  },

  /**
   * Conferma l'eliminazione di uno scenario
   * @param {string} id - ID dello scenario
   * @param {HTMLElement} button - Bottone che ha attivato l'evento
   */
  confirmDelete(id, button) {
    if (confirm('Sei sicuro di voler eliminare questo scenario?')) {
      this.remove(id);
      const modal = button.closest('.modal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
      }
    }
  },

  /**
   * Salva le modifiche a uno scenario
   * @param {string} id - ID dello scenario
   */
  save(id = null) {
    if (id) {
      const scenario = this.scenarios.find(s => s.id === id);
      if (!scenario) return;

      const nameInput = document.getElementById('scenarioName');
      const returnInput = document.getElementById('scenarioReturn');
      const volatilityInput = document.getElementById('scenarioVolatility');
      const descriptionInput = document.getElementById('scenarioDescription');
      const activeInput = document.getElementById('scenarioActive');

      if (!nameInput || !returnInput || !volatilityInput || !descriptionInput || !activeInput) {
        Utils.showToast('Errore nel recupero dei campi del form', 'danger');
        return;
      }

      const name = nameInput.value.trim();
      const expectedReturn = parseFloat(returnInput.value);
      const volatility = parseFloat(volatilityInput.value);
      const description = descriptionInput.value.trim();
      const isActive = activeInput.checked;

      if (!name) {
        Utils.showToast('Il nome dello scenario non può essere vuoto', 'warning');
        return;
      }

      scenario.name = name;
      scenario.expectedReturn = expectedReturn;
      scenario.volatility = volatility;
      scenario.description = description;
      scenario.active = isActive;

      if (isActive) {
        this.scenarios.forEach(s => {
          if (s.id !== id) s.active = false;
        });
        this.activeScenario = scenario;
      }

      const modal = document.querySelector('.modal.show');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
      }

      Utils.showToast('Scenario salvato', 'success');
    }

    Utils.storage.set('scenarios', this.scenarios);
    this.render();
  },

  /**
   * Attiva uno scenario
   * @param {string} id - ID dello scenario
   */
  activate(id) {
    this.scenarios.forEach(s => s.active = false);
    const scenario = this.scenarios.find(s => s.id === id);
    if (scenario) {
      scenario.active = true;
      this.activeScenario = scenario;

      const expectedReturnEl = document.getElementById('expectedReturn');
      const volatilityEl = document.getElementById('volatility');
      const volatilityValueEl = document.getElementById('volatilityValue');

      if (expectedReturnEl && volatilityEl && volatilityValueEl) {
        expectedReturnEl.value = scenario.expectedReturn;
        volatilityEl.value = scenario.volatility;
        volatilityValueEl.textContent = `${scenario.volatility}%`;
      }

      Utils.showToast(`Scenario "${scenario.name}" attivato`, 'info');
    }

    this.save();
  },

  /**
   * Carica scenari predefiniti
   */
  loadPresets() {
    const presets = CONFIG.SCENARIO_PRESETS;
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-download me-2"></i>Carica Scenari Predefiniti</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Seleziona gli scenari predefiniti da aggiungere:</p>
            <div class="list-group">
              ${presets.map(preset => `
                <div class="list-group-item">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${preset.name}" id="preset_${preset.name}">
                    <label class="form-check-label" for="preset_${preset.name}">
                      <strong>${preset.name}</strong><br>
                      <small class="text-muted">
                        Rendimento: ${preset.expectedReturn}% | Volatilità: ${preset.volatility}%<br>
                        ${preset.description}
                      </small>
                    </label>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
            <button type="button" class="btn btn-primary" onclick="ScenarioManager.addPresets()">
              <i class="fas fa-plus me-1"></i>Aggiungi Selezionati
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  },

  /**
   * Aggiunge gli scenari selezionati dai preset
   */
  addPresets() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="preset_"]:checked');
    let added = 0;

    checkboxes.forEach(checkbox => {
      const presetName = checkbox.value;
      const preset = CONFIG.SCENARIO_PRESETS.find(p => p.name === presetName);
      if (preset && !this.scenarios.find(s => s.name === preset.name)) {
        this.add({
          id: Utils.generateId(),
          name: preset.name,
          expectedReturn: preset.expectedReturn,
          volatility: preset.volatility,
          description: preset.description,
          active: false
        });
        added++;
      }
    });

    const modal = document.querySelector('.modal.show');
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      bsModal.hide();
    }

    if (added > 0) {
      Utils.showToast(`${added} scenari aggiunti`, 'success');
    } else {
      Utils.showToast('Nessun nuovo scenario aggiunto', 'info');
    }
  },

  /**
   * Renderizza la lista degli scenari nell'interfaccia
   */
  render() {
    const container = document.getElementById('scenariosList');
    if (!container) return;

    if (this.scenarios.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-3">
          <i class="fas fa-inbox fa-2x mb-2"></i>
          <p>Nessuno scenario configurato</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.scenarios.map(scenario => `
      <div class="scenario-item mb-2 p-3 border rounded ${scenario.active ? 'border-primary bg-primary bg-opacity-10' : ''}">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center mb-1">
              <h6 class="mb-0 me-2">${scenario.name}</h6>
              ${scenario.active ? '<span class="badge bg-primary">Attivo</span>' : ''}
            </div>
            <div class="small text-muted mb-2">
              <i class="fas fa-chart-line me-1"></i>${scenario.expectedReturn}% rendimento | 
              <i class="fas fa-chart-area me-1"></i>${scenario.volatility}% volatilità
            </div>
            ${scenario.description ? `<div class="small text-muted">${scenario.description}</div>` : ''}
          </div>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="ScenarioManager.activate('${scenario.id}')" title="Attiva scenario" ${scenario.active ? 'disabled' : ''}>
              <i class="fas fa-play"></i>
            </button>
            <button class="btn btn-outline-secondary" onclick="ScenarioManager.edit('${scenario.id}')" title="Modifica scenario">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="ScenarioManager.remove('${scenario.id}')" title="Elimina scenario">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Restituisce lo scenario attivo
   * @returns {Object|null}
   */
  getActive() {
    return this.scenarios.find(s => s.active) || null;
  },

  /**
   * Esporta tutti gli scenari in formato JSON
   */
  export() {
    const data = {
      scenarios: this.scenarios,
      exportDate: new Date().toISOString(),
      version: CONFIG.VERSION
    };
    const json = JSON.stringify(data, null, 2);
    Utils.saveFile(json, 'scenari-etf.json', 'application/json');
    Utils.showToast('Scenari esportati', 'success');
  },

  /**
   * Importa scenari da un file JSON
   */
  async import() {
    try {
      const file = await Utils.loadFile('application/json,.json');
      const data = JSON.parse(file.content);
      if (data.scenarios && Array.isArray(data.scenarios)) {
        data.scenarios.forEach(scenario => {
          scenario.id = Utils.generateId();
          scenario.active = false;
          this.scenarios.push(scenario);
        });
        this.save();
        Utils.showToast(`${data.scenarios.length} scenari importati`, 'success');
      } else {
        throw new Error('Formato file non valido');
      }
    } catch (error) {
      Utils.showToast('Errore nell\'importazione: ' + error.message, 'danger');
    }
  },
  /**
   * Restituisce tutti gli scenari
   * @returns {Array<Object>}
   */
  getScenarios() {
    return this.scenarios;
  },
  /**
   * Resetta tutti gli scenari
   */
  reset() {
    if (confirm('Sei sicuro di voler eliminare tutti gli scenari?')) {
      this.scenarios = [];
      this.activeScenario = null;
      this.save();
      Utils.showToast('Tutti gli scenari eliminati', 'success');
    }
  }
};

// Rendi ScenarioManager globale
window.ScenarioManager = ScenarioManager;