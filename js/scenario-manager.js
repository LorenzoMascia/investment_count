/**
 * Manages the investment scenarios for the ETF Simulator.
 */
const ScenarioManager = {
  scenarios: [],
  activeScenario: null,

  /**
   * Initializes the scenario manager by loading data from localStorage
   */
  init() {
    this.scenarios = Utils.storage.get('scenarios', []);
    this.render();
    console.log('ScenarioManager initialized with', this.scenarios.length, 'scenarios');
  },

  /**
   * Adds a new or existing scenario
   * @param {Object|null} scenario - Scenario to add (optional)
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

    // Open the edit modal for the new scenario
    this.edit(newScenario.id);
  },

  /**
   * Removes a scenario
   * @param {string} id - Scenario ID
   */
  remove(id) {
    const index = this.scenarios.findIndex(s => s.id === id);
    if (index > -1) {
      this.scenarios.splice(index, 1);
      this.save();
      this.render();
      Utils.showToast('Scenario deleted', 'success');
    }
  },

  /**
   * Edits a scenario by showing a modal
   * @param {string} id - Scenario ID
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
   * Creates an edit modal for a scenario
   * @param {Object} scenario - Scenario to edit
   * @returns {HTMLElement}
   */
  createEditModal(scenario) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-edit me-2"></i>Edit Scenario</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="scenarioForm">
              <div class="mb-3">
                <label class="form-label">Scenario Name</label>
                <input type="text" class="form-control" id="scenarioName" value="${scenario.name}" required>
              </div>
              <div class="row">
                <div class="col-6">
                  <label class="form-label">Expected Return (%)</label>
                  <input type="number" class="form-control" id="scenarioReturn" 
                         value="${scenario.expectedReturn}" min="-50" max="50" step="0.1" required>
                </div>
                <div class="col-6">
                  <label class="form-label">Volatility (%)</label>
                  <input type="number" class="form-control" id="scenarioVolatility" 
                         value="${scenario.volatility}" min="0" max="100" step="0.1" required>
                </div>
              </div>
              <div class="mb-3 mt-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="scenarioDescription" rows="3">${scenario.description}</textarea>
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="scenarioActive" ${scenario.active ? 'checked' : ''}>
                <label class="form-check-label">Active Scenario</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" onclick="ScenarioManager.confirmDelete('${scenario.id}', this)">
              <i class="fas fa-trash me-1"></i>Delete
            </button>
            <button type="button" class="btn btn-primary" onclick="ScenarioManager.save('${scenario.id}')">
              <i class="fas fa-save me-1"></i>Save
            </button>
          </div>
        </div>
      </div>
    `;
    return modal;
  },

  /**
   * Confirms scenario deletion
   * @param {string} id - Scenario ID
   * @param {HTMLElement} button - Button that triggered the event
   */
  confirmDelete(id, button) {
    if (confirm('Are you sure you want to delete this scenario?')) {
      this.remove(id);
      const modal = button.closest('.modal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
      }
    }
  },

  /**
   * Saves changes to a scenario
   * @param {string} id - Scenario ID
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
        Utils.showToast('Error retrieving form fields', 'danger');
        return;
      }

      const name = nameInput.value.trim();
      const expectedReturn = parseFloat(returnInput.value);
      const volatility = parseFloat(volatilityInput.value);
      const description = descriptionInput.value.trim();
      const isActive = activeInput.checked;

      if (!name) {
        Utils.showToast('Scenario name cannot be empty', 'warning');
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

      Utils.showToast('Scenario saved', 'success');
    }

    Utils.storage.set('scenarios', this.scenarios);
    this.render();
  },

  /**
   * Activates a scenario
   * @param {string} id - Scenario ID
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

      Utils.showToast(`Scenario "${scenario.name}" activated`, 'info');
    }

    this.save();
  },

  /**
   * Loads preset scenarios
   */
  loadPresets() {
    const presets = CONFIG.SCENARIO_PRESETS;
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-download me-2"></i>Load Preset Scenarios</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Select preset scenarios to add:</p>
            <div class="list-group">
              ${presets.map(preset => `
                <div class="list-group-item">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${preset.name}" id="preset_${preset.name}">
                    <label class="form-check-label" for="preset_${preset.name}">
                      <strong>${preset.name}</strong><br>
                      <small class="text-muted">
                        Return: ${preset.expectedReturn}% | Volatility: ${preset.volatility}%<br>
                        ${preset.description}
                      </small>
                    </label>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="ScenarioManager.addPresets()">
              <i class="fas fa-plus me-1"></i>Add Selected
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
   * Adds selected preset scenarios
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
      Utils.showToast(`${added} scenarios added`, 'success');
    } else {
      Utils.showToast('No new scenarios added', 'info');
    }
  },

  /**
   * Renders the scenario list in the UI
   */
  render() {
    const container = document.getElementById('scenariosList');
    if (!container) return;

    if (this.scenarios.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted py-3">
          <i class="fas fa-inbox fa-2x mb-2"></i>
          <p>No scenarios configured</p>
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
              ${scenario.active ? '<span class="badge bg-primary">Active</span>' : ''}
            </div>
            <div class="small text-muted mb-2">
              <i class="fas fa-chart-line me-1"></i>${scenario.expectedReturn}% return | 
              <i class="fas fa-chart-area me-1"></i>${scenario.volatility}% volatility
            </div>
            ${scenario.description ? `<div class="small text-muted">${scenario.description}</div>` : ''}
          </div>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="ScenarioManager.activate('${scenario.id}')" title="Activate scenario" ${scenario.active ? 'disabled' : ''}>
              <i class="fas fa-play"></i>
            </button>
            <button class="btn btn-outline-secondary" onclick="ScenarioManager.edit('${scenario.id}')" title="Edit scenario">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="ScenarioManager.remove('${scenario.id}')" title="Delete scenario">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Returns the active scenario
   * @returns {Object|null}
   */
  getActive() {
    return this.scenarios.find(s => s.active) || null;
  },

  /**
   * Exports all scenarios in JSON format
   */
  export() {
    const data = {
      scenarios: this.scenarios,
      exportDate: new Date().toISOString(),
      version: CONFIG.VERSION
    };
    const json = JSON.stringify(data, null, 2);
    Utils.saveFile(json, 'etf-scenarios.json', 'application/json');
    Utils.showToast('Scenarios exported', 'success');
  },

  /**
   * Imports scenarios from a JSON file
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
        Utils.showToast(`${data.scenarios.length} scenarios imported`, 'success');
      } else {
        throw new Error('Invalid file format');
      }
    } catch (error) {
      Utils.showToast('Import error: ' + error.message, 'danger');
    }
  },

  /**
   * Returns all scenarios
   * @returns {Array<Object>}
   */
  getScenarios() {
    return this.scenarios;
  },

  /**
   * Resets all scenarios
   */
  reset() {
    if (confirm('Are you sure you want to delete all scenarios?')) {
      this.scenarios = [];
      this.activeScenario = null;
      this.save();
      Utils.showToast('All scenarios deleted', 'success');
    }
  }
};

// Make ScenarioManager global
window.ScenarioManager = ScenarioManager;