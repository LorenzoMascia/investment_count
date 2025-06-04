/**
 * Classe principale per il simulatore ETF.
 * Gestisce la configurazione, la simulazione e l'aggiornamento dell'interfaccia.
 */
class ETFSimulator {
  /**
   * Simulazione corrente
   * @type {Object|null}
   */
  static currentSimulation = null;

  /**
   * Configurazione predefinita
   * @type {Object}
   */
  static defaultConfig = {
    initialCapital: 10000,
    monthlyContribution: 500,
    investmentYears: 20,
    expectedReturn: 7,
    inflationRate: 2.5,
    taxRate: 26,
    contributionGrowth: 3,
    managementFees: 0.25,
    volatility: 15,
    startDate: new Date().toISOString().split('T')[0],
    etfType: 'world',
    includeReinvestment: true,
    includeInflationAdjustment: true,
    enableMonteCarloMode: false,
    scenarios: []
  };

  /**
   * Inizializza l'applicativo
   */
  static init() {
    // Imposta data odierna come default
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
      startDateInput.value = this.defaultConfig.startDate;
    }

    // Carica configurazione salvata
    const savedConfig = localStorage.getItem('etfSimulatorConfig');
    if (savedConfig) {
      try {
        this.loadConfiguration(JSON.parse(savedConfig));
      } catch (error) {
        console.warn("Errore nel caricamento della configurazione:", error);
        Utils.showToast("Errore nel caricamento della configurazione", "warning");
      }
    }

    // Aggiorna i valori predefiniti in base al tipo ETF
    this.updateETFDefaults();
  }

  /**
   * Avvia una simulazione
   */
  static run() {
    try {
      // Mostra spinner di caricamento
      const loadingSpinner = document.getElementById('loadingSpinner');
      const progressBar = document.getElementById('progressBar');
      if (loadingSpinner) loadingSpinner.style.display = 'flex';
      if (progressBar) progressBar.style.width = '0%';

      // Recupera configurazione corrente
      const config = this.getCurrentConfig();

      // Simula con un piccolo ritardo per mostrare lo spinner
      setTimeout(() => {
        try {
          // Esegui la simulazione
          this.currentSimulation = window.Calculator.simulate(config);

          // Aggiorna l'interfaccia
          this.updateUI();

          // Nascondi spinner
          if (loadingSpinner) loadingSpinner.style.display = 'none';

        } catch (error) {
          console.error('Errore durante la simulazione:', error);
          Utils.showAlert(`Errore durante la simulazione: ${error.message}`, 'danger');
          if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
      }, 100);
    } catch (error) {
      console.error('Errore durante l\'avvio della simulazione:', error);
      Utils.showAlert('Errore durante l\'avvio della simulazione', 'danger');
      const loadingSpinner = document.getElementById('loadingSpinner');
      if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
  }

  /**
   * Aggiorna l'interfaccia utente dopo una simulazione
   */
  static updateUI() {
  if (!this.currentSimulation || !this.currentSimulation.monthlyData) return;

    // Aggiorna grafici
    if (typeof ChartManager !== 'undefined') {
      ChartManager.createMainChart(this.currentSimulation.monthlyData, this.currentSimulation.scenarios || []);
      ChartManager.createCompositionChart(this.currentSimulation.finalValues);
      ChartManager.createReturnsChart(this.currentSimulation.yearlyReturns);
    }

    if (!this.currentSimulation || !this.currentSimulation.monthlyData) return;

    // Aggiorna tabella dettaglio
    TableManager.updateDetailsTable(this.currentSimulation);

    // Aggiorna statistiche rapide
    this.updateQuickStats();

    // Aggiorna valutazione del rischio
    this.updateRiskAssessment();

    // Mostra/nascondi grafico Monte Carlo
    const config = this.getCurrentConfig();
    const mcContainer = document.getElementById('monteCarloContainer');
    if (mcContainer) {
      if (config.enableMonteCarloMode && typeof ChartManager !== 'undefined') {
        mcContainer.style.display = 'block';
        ChartManager.updateMonteCarloChart(this.currentSimulation);
      } else {
        mcContainer.style.display = 'none';
      }
    }
  }

  /**
   * Aggiorna le statistiche rapide visualizzate nell'interfaccia
   */
  static updateQuickStats() {
    const sim = this.currentSimulation;
    if (!sim) return;

    const stats = [
      { 
        title: 'Capitale Finale', 
        value: Utils.formatCurrency(sim.finalCapital),
        icon: 'fa-euro-sign',
        color: 'success'
      },
      { 
        title: 'Totale Investito', 
        value: Utils.formatCurrency(sim.totalInvested),
        icon: 'fa-piggy-bank',
        color: 'info'
      },
      { 
        title: 'Guadagno Netto', 
        value: Utils.formatCurrency(sim.netProfit),
        icon: 'fa-chart-line',
        color: 'primary'
      },
      { 
        title: 'Rendimento Annuale', 
        value: `${sim.annualizedReturn.toFixed(2)}%`,
        icon: 'fa-percentage',
        color: 'warning'
      }
    ];

    let html = '';
    stats.forEach(stat => {
      html += `
        <div class="col-6">
          <div class="stat-card bg-${stat.color}-subtle p-2 rounded">
            <div class="d-flex align-items-center">
              <i class="fas ${stat.icon} me-2 text-${stat.color}"></i>
              <strong class="text-${stat.color}">${stat.title}</strong>
            </div>
            <div class="h5 mt-1 mb-0">${stat.value}</div>
          </div>
        </div>
      `;
    });

    const quickStats = document.getElementById('quickStats');
    if (quickStats) {
      quickStats.innerHTML = html;
    }
  }

  /**
   * Valuta e mostra il livello di rischio dell'investimento
   */
  static updateRiskAssessment() {
    const sim = this.currentSimulation;
    if (!sim) return;

    const config = this.getCurrentConfig();

    // Calcola punteggio di rischio
    const riskScore = Math.min(10, Math.round(config.volatility / 5 + (30 - config.investmentYears) / 5));

    let riskLevel, riskColor, riskDescription;
    if (riskScore <= 3) {
      riskLevel = 'Basso';
      riskColor = 'success';
      riskDescription = 'Investimento conservativo con bassa volatilità';
    } else if (riskScore <= 6) {
      riskLevel = 'Moderato';
      riskColor = 'warning';
      riskDescription = 'Investimento bilanciato con rischio moderato';
    } else {
      riskLevel = 'Alto';
      riskColor = 'danger';
      riskDescription = 'Investimento aggressivo con alta volatilità';
    }

    const html = `
      <div class="risk-meter mb-3">
        <div class="d-flex justify-content-between mb-1">
          <small>Basso</small>
          <small>Moderato</small>
          <small>Alto</small>
        </div>
        <div class="progress" style="height: 10px;">
          <div class="progress-bar bg-${riskColor}" role="progressbar" 
               style="width: ${riskScore * 10}%" aria-valuenow="${riskScore}" 
               aria-valuemin="0" aria-valuemax="10"></div>
        </div>
      </div>
      <div class="risk-info">
        <h5 class="text-${riskColor}">${riskLevel} Rischio</h5>
        <p class="small">${riskDescription}. Volatilità: ${config.volatility}%.</p>
        <div class="risk-factors">
          <div class="d-flex align-items-center mb-1">
            <i class="fas fa-${riskScore <= 3 ? 'check-circle text-success' : riskScore <= 6 ? 'exclamation-circle text-warning' : 'times-circle text-danger'} me-2"></i>
            <span>Volatilità: ${config.volatility}%</span>
          </div>
          <div class="d-flex align-items-center mb-1">
            <i class="fas fa-${config.investmentYears >= 15 ? 'check-circle text-success' : config.investmentYears >= 8 ? 'exclamation-circle text-warning' : 'times-circle text-danger'} me-2"></i>
            <span>Orizzonte temporale: ${config.investmentYears} anni</span>
          </div>
          <div class="d-flex align-items-center">
            <i class="fas fa-${config.expectedReturn <= 5 ? 'check-circle text-success' : config.expectedReturn <= 10 ? 'exclamation-circle text-warning' : 'times-circle text-danger'} me-2"></i>
            <span>Rendimento atteso: ${config.expectedReturn}%</span>
          </div>
        </div>
      </div>
    `;

    const riskAssessment = document.getElementById('riskAssessment');
    if (riskAssessment) {
      riskAssessment.innerHTML = html;
    }
  }

  /**
   * Recupera la configurazione corrente dal DOM
   * @returns {Object} Oggetto configurazione
   */
  static getCurrentConfig() {
    return {
      initialCapital: parseFloat(document.getElementById('initialCapital')?.value || 0),
      monthlyContribution: parseFloat(document.getElementById('monthlyContribution')?.value || 0),
      investmentYears: parseInt(document.getElementById('investmentYears')?.value || 0),
      expectedReturn: parseFloat(document.getElementById('expectedReturn')?.value || 0),
      inflationRate: parseFloat(document.getElementById('inflationRate')?.value || 0),
      taxRate: parseFloat(document.getElementById('taxRate')?.value || 0),
      contributionGrowth: parseFloat(document.getElementById('contributionGrowth')?.value || 0),
      managementFees: parseFloat(document.getElementById('managementFees')?.value || 0),
      volatility: parseInt(document.getElementById('volatility')?.value || 0),
      startDate: document.getElementById('startDate')?.value || new Date().toISOString().split('T')[0],
      etfType: document.getElementById('etfType')?.value || 'world',
      includeReinvestment: document.getElementById('includeReinvestment')?.checked || false,
      includeInflationAdjustment: document.getElementById('includeInflationAdjustment')?.checked || false,
      enableMonteCarloMode: document.getElementById('enableMonteCarloMode')?.checked || false,
      scenarios: ScenarioManager.getScenarios()
    };
  }

  /**
   * Aggiorna i valori predefiniti in base al tipo ETF selezionato
   */
  static updateETFDefaults() {
    const etfTypeElement = document.getElementById('etfType');
    if (!etfTypeElement) return;

    const etfType = etfTypeElement.value;
    const defaults = {
      world: { expectedReturn: 7, volatility: 15, managementFees: 0.25 },
      sp500: { expectedReturn: 9, volatility: 18, managementFees: 0.05 },
      europe: { expectedReturn: 6, volatility: 17, managementFees: 0.30 },
      emerging: { expectedReturn: 8, volatility: 25, managementFees: 0.50 },
      bonds: { expectedReturn: 3, volatility: 8, managementFees: 0.15 },
      mixed: { expectedReturn: 5.5, volatility: 12, managementFees: 0.20 },
      default: { expectedReturn: 7, volatility: 15, managementFees: 0.25 }
    };

    const values = defaults[etfType] || defaults['default'];

    const expectedReturnEl = document.getElementById('expectedReturn');
    const volatilityEl = document.getElementById('volatility');
    const volatilityValueEl = document.getElementById('volatilityValue');
    const managementFeesEl = document.getElementById('managementFees');

    if (expectedReturnEl) expectedReturnEl.value = values.expectedReturn;
    if (volatilityEl) volatilityEl.value = values.volatility;
    if (volatilityValueEl) volatilityValueEl.textContent = `${values.volatility}%`;
    if (managementFeesEl) managementFeesEl.value = values.managementFees;
  }

  /**
   * Reimposta tutti i campi ai valori predefiniti
   */
  static reset() {
    // Reimposta tutti i campi ai valori predefiniti
    Object.entries(this.defaultConfig).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = value;
        } else {
          element.value = value;
        }
      }
    });

    // Aggiorna i valori visualizzati
    const volatilityValueEl = document.getElementById('volatilityValue');
    if (volatilityValueEl) {
      volatilityValueEl.textContent = `${this.defaultConfig.volatility}%`;
    }

    this.updateETFDefaults();

    // Svuota gli scenari
    if (ScenarioManager.clearScenarios) {
      ScenarioManager.clearScenarios();
    }

    // Resetta la simulazione
    this.currentSimulation = null;
    this.updateUI();
    Utils.showAlert('Configurazione reimpostata ai valori predefiniti', 'info');
  }

  /**
   * Salva la configurazione corrente
   */
  static saveConfiguration() {
    try {
      const config = this.getCurrentConfig();
      localStorage.setItem('etfSimulatorConfig', JSON.stringify(config));
      Utils.showAlert('Configurazione salvata con successo!', 'success');
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      Utils.showAlert('Errore durante il salvataggio della configurazione', 'danger');
    }
  }

  /**
   * Carica una configurazione salvata
   * @param {Object} [configJSON=null] - Configurazione da caricare
   */
  static loadConfiguration(configJSON = null) {
    try {
      let config;
      if (configJSON) {
        config = configJSON;
      } else {
        const savedConfig = localStorage.getItem('etfSimulatorConfig');
        if (!savedConfig) {
          Utils.showAlert('Nessuna configurazione salvata trovata', 'warning');
          return;
        }
        config = JSON.parse(savedConfig);
      }

      // Applica la configurazione ai campi del form
      Object.entries(config).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = value;
          } else {
            element.value = value;
          }
        }
      });

      // Aggiorna i valori visualizzati
      const volatilityValueEl = document.getElementById('volatilityValue');
      if (volatilityValueEl && config.volatility) {
        volatilityValueEl.textContent = `${config.volatility}%`;
      }

      // Carica gli scenari se presenti
      if (config.scenarios && Array.isArray(config.scenarios)) {
        ScenarioManager.loadScenarios?.(config.scenarios);
      }

      Utils.showAlert('Configurazione caricata con successo!', 'success');
    } catch (error) {
      console.error('Errore durante il caricamento:', error);
      Utils.showAlert('Errore durante il caricamento della configurazione', 'danger');
    }
  }

  /**
   * Mostra la guida all'uso
   */
  static showHelp() {
    const helpContent = `
      <h4>Guida al Simulatore ETF</h4>
      <p>Questo strumento ti permette di simulare la crescita di un investimento in ETF nel tempo.</p>
      <h5 class="mt-4">Configurazione Base</h5>
      <ul>
        <li><strong>Capitale Iniziale</strong>: L'importo iniziale che vuoi investire.</li>
        <li><strong>Contributo Mensile</strong>: L'importo che aggiungerai ogni mese.</li>
        <li><strong>Durata</strong>: Il numero di anni per cui mantieni l'investimento.</li>
        <li><strong>Rendimento Atteso</strong>: Il rendimento annuale medio che ti aspetti dall'ETF.</li>
      </ul>
      <h5 class="mt-4">Configurazione Avanzata</h5>
      <ul>
        <li><strong>Crescita Contributo Annuale</strong>: Aumento percentuale annuo del contributo mensile.</li>
        <li><strong>Costi Gestione</strong>: Commissioni annuali dell'ETF (TER).</li>
        <li><strong>Volatilità</strong>: Variabilità attesa dei rendimenti annuali.</li>
        <li><strong>Reinvestimento Dividendi</strong>: Se attivo, simula reinvestimento dividendi.</li>
      </ul>
      <h5 class="mt-4">Scenari</h5>
      <p>Puoi creare diversi scenari con rendimenti variabili per confrontare risultati diversi.</p>
      <div class="alert alert-info mt-4">
        <i class="fas fa-lightbulb me-2"></i>
        Suggerimento: Per risultati realistici, usa una volatilità tra il 10% e il 20% per ETF azionari globali.
      </div>
    `;
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
      helpModal.querySelector('.modal-body').innerHTML = helpContent;
      const bsModal = new bootstrap.Modal(helpModal);
      bsModal.show();
    } else {
      console.warn("Modal 'helpModal' non trovato nel DOM");
    }
  }
}

// Esponi ETFSimulator globalmente
window.ETFSimulator = ETFSimulator;