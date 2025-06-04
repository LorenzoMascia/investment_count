const ETFSimulator = {
    // Esegue la simulazione
    run: function() {
        try {
            // Mostra lo spinner di caricamento
            document.getElementById('loadingSpinner').style.display = 'flex';
            document.getElementById('chartsContainer').style.opacity = '0.5';
            
            // Simula un caricamento progressivo
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 5;
                document.getElementById('progressBar').style.width = `${progress}%`;
                if (progress >= 100) clearInterval(progressInterval);
            }, 100);
            
            // Recupera i parametri di input
            const params = this.getInputParameters();
            
            // Simula un ritardo per il calcolo
            setTimeout(() => {
                // Esegui il calcolo
                const results = Calculator.calculateInvestment(params);
                
                // Aggiorna l'interfaccia con i risultati
                this.updateUI(results);
                
                // Nascondi lo spinner
                document.getElementById('loadingSpinner').style.display = 'none';
                document.getElementById('chartsContainer').style.opacity = '1';
                clearInterval(progressInterval);
            }, 1500);
        } catch (error) {
            console.error("Errore durante la simulazione:", error);
            this.showAlert("Si è verificato un errore durante la simulazione.", "danger");
            document.getElementById('loadingSpinner').style.display = 'none';
            document.getElementById('chartsContainer').style.opacity = '1';
        }
    },
    
    // Recupera i parametri di input dal form
    getInputParameters: function() {
        return {
            initialCapital: parseFloat(document.getElementById('initialCapital').value),
            monthlyContribution: parseFloat(document.getElementById('monthlyContribution').value),
            years: parseInt(document.getElementById('investmentYears').value),
            expectedReturn: parseFloat(document.getElementById('expectedReturn').value) / 100,
            inflationRate: parseFloat(document.getElementById('inflationRate').value) / 100,
            taxRate: parseFloat(document.getElementById('taxRate').value) / 100,
            contributionGrowth: parseFloat(document.getElementById('contributionGrowth').value) / 100,
            managementFees: parseFloat(document.getElementById('managementFees').value) / 100,
            volatility: parseInt(document.getElementById('volatility').value) / 100,
            startDate: document.getElementById('startDate').value,
            etfType: document.getElementById('etfType').value,
            includeReinvestment: document.getElementById('includeReinvestment').checked,
            includeInflationAdjustment: document.getElementById('includeInflationAdjustment').checked,
            enableMonteCarloMode: document.getElementById('enableMonteCarloMode').checked
        };
    },
    
    // Aggiorna l'interfaccia con i risultati
    updateUI: function(results) {
        // Aggiorna le statistiche rapide
        this.updateQuickStats(results);
        
        // Aggiorna i grafici
        ChartManager.updateCharts(results);
        
        // Aggiorna la tabella di dettaglio
        TableManager.updateTable(results);
        
        // Aggiorna le milestone
        this.updateMilestones(results);
        
        // Mostra/nascondi la sezione Monte Carlo se necessario
        document.getElementById('monteCarloContainer').style.display = 
            results.params.enableMonteCarloMode ? 'block' : 'none';
    },
    
    // Aggiorna le statistiche rapide
    updateQuickStats: function(results) {
        const quickStatsContainer = document.getElementById('quickStats');
        
        if (!results) {
            // Statistiche preliminari basate solo sugli input
            const params = this.getInputParameters();
            const totalContributions = params.monthlyContribution * 12 * params.years;
            
            quickStatsContainer.innerHTML = `
                <div class="col-6">
                    <div class="stat-card">
                        <h6>Capitale Iniziale</h6>
                        <p>€${params.initialCapital.toLocaleString('it-IT')}</p>
                    </div>
                </div>
                <div class="col-6">
                    <div class="stat-card">
                        <h6>Totale Versato</h6>
                        <p>€${totalContributions.toLocaleString('it-IT')}</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Statistiche complete con risultati della simulazione
        quickStatsContainer.innerHTML = `
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h6>Valore Finale</h6>
                    <p>€${results.finalValue.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h6>Totale Investito</h6>
                    <p>€${results.totalInvested.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h6>Guadagno Netto</h6>
                    <p>€${results.netProfit.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h6>CAGR</h6>
                    <p>${(results.cagr * 100).toFixed(2)}%</p>
                </div>
            </div>
        `;
        
        // Aggiorna la valutazione del rischio
        this.updateRiskAssessment(results);
    },
    
    // Aggiorna la valutazione del rischio
    updateRiskAssessment: function(results) {
        const riskContainer = document.getElementById('riskAssessment');
        if (!results) {
            riskContainer.innerHTML = '<div class="alert alert-info">Esegui una simulazione per valutare il rischio.</div>';
            return;
        }
        
        // Calcola un punteggio di rischio semplificato
        const volatilityScore = results.params.volatility * 10;
        const yearsScore = 100 - (results.params.years * 2);
        const riskScore = Math.min(100, Math.max(0, (volatilityScore + yearsScore) / 2));
        
        let riskLevel, riskClass;
        if (riskScore < 30) {
            riskLevel = "Basso";
            riskClass = "success";
        } else if (riskScore < 70) {
            riskLevel = "Moderato";
            riskClass = "warning";
        } else {
            riskLevel = "Alto";
            riskClass = "danger";
        }
        
        riskContainer.innerHTML = `
            <div class="risk-meter mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span>Rischio</span>
                    <span>${riskLevel} (${Math.round(riskScore)}/100)</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-${riskClass}" role="progressbar" 
                         style="width: ${riskScore}%" aria-valuenow="${riskScore}" 
                         aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <div class="risk-factors">
                <h6>Fattori di Rischio:</h6>
                <ul>
                    <li>Volatilità: ${Math.round(results.params.volatility * 100)}%</li>
                    <li>Orizzonte temporale: ${results.params.years} anni</li>
                    <li>Tipo ETF: ${this.getETFTypeName(results.params.etfType)}</li>
                </ul>
            </div>
        `;
    },
    
    // Restituisce il nome descrittivo del tipo ETF
    getETFTypeName: function(type) {
        const types = {
            'world': 'Azionario Mondo',
            'sp500': 'S&P 500',
            'europe': 'Azionario Europa',
            'emerging': 'Mercati Emergenti',
            'bonds': 'Obbligazionario',
            'mixed': 'Bilanciato 60/40'
        };
        return types[type] || type;
    },
    
    // Aggiorna le milestone
    updateMilestones: function(results) {
        const container = document.getElementById('milestonesContainer');
        if (!results || !results.milestones) {
            container.innerHTML = '<div class="alert alert-secondary">Nessuna milestone disponibile.</div>';
            return;
        }
        
        let html = '<div class="row">';
        results.milestones.forEach((milestone, index) => {
            const progress = Math.min(100, (milestone.value / results.finalValue * 100));
            const progressClass = progress < 30 ? 'bg-danger' : progress < 70 ? 'bg-warning' : 'bg-success';
            
            html += `
                <div class="col-md-6 mb-3">
                    <div class="milestone-card">
                        <div class="d-flex justify-content-between mb-1">
                            <strong>${milestone.name}</strong>
                            <span>€${milestone.value.toLocaleString('it-IT', {maximumFractionDigits: 2})}</span>
                        </div>
                        <div class="d-flex justify-content-between small text-muted mb-2">
                            <span>Anno ${milestone.year}</span>
                            <span>${milestone.percentage}% del finale</span>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar ${progressClass}" role="progressbar" 
                                 style="width: ${progress}%" aria-valuenow="${progress}" 
                                 aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Aggiungi una riga ogni 2 milestone
            if (index % 2 === 1 && index !== results.milestones.length - 1) {
                html += '</div><div class="row">';
            }
        });
        html += '</div>';
        
        container.innerHTML = html;
    },
    
    // Mostra un alert
    showAlert: function(message, type = 'info', duration = 5000) {
        const alertContainer = document.getElementById('alertContainer');
        const alertId = 'alert-' + Date.now();
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.id = alertId;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Rimuovi l'alert dopo un po' di tempo
        if (duration > 0) {
            setTimeout(() => {
                const alertToRemove = document.getElementById(alertId);
                if (alertToRemove) {
                    alertToRemove.remove();
                }
            }, duration);
        }
    },
    
    // Resetta il simulatore
    reset: function() {
        // Resetta i valori di input ai default
        document.getElementById('initialCapital').value = 10000;
        document.getElementById('monthlyContribution').value = 500;
        document.getElementById('investmentYears').value = 20;
        document.getElementById('expectedReturn').value = 7;
        document.getElementById('inflationRate').value = 2.5;
        document.getElementById('taxRate').value = 26;
        document.getElementById('contributionGrowth').value = 3;
        document.getElementById('managementFees').value = 0.25;
        document.getElementById('volatility').value = 15;
        document.getElementById('volatilityValue').textContent = '15%';
        document.getElementById('startDate').valueAsDate = new Date();
        document.getElementById('etfType').value = 'world';
        document.getElementById('includeReinvestment').checked = true;
        document.getElementById('includeInflationAdjustment').checked = true;
        document.getElementById('enableMonteCarloMode').checked = false;
        
        // Resetta i risultati
        document.getElementById('quickStats').innerHTML = '';
        document.getElementById('riskAssessment').innerHTML = '';
        document.getElementById('milestonesContainer').innerHTML = '';
        
        // Resetta i grafici
        ChartManager.resetCharts();
        
        // Resetta la tabella
        TableManager.resetTable();
        
        this.showAlert("Simulatore resettato ai valori predefiniti.", "success");
    },
    
    // Salva la configurazione corrente
    saveConfiguration: function() {
        const config = {
            inputs: this.getInputParameters(),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('etfSimulatorConfig', JSON.stringify(config));
        this.showAlert("Configurazione salvata con successo.", "success");
    },
    
    // Carica una configurazione salvata
    loadConfiguration: function() {
        const savedConfig = localStorage.getItem('etfSimulatorConfig');
        if (!savedConfig) {
            this.showAlert("Nessuna configurazione salvata trovata.", "warning");
            return;
        }
        
        try {
            const config = JSON.parse(savedConfig);
            
            // Imposta i valori dai dati salvati
            document.getElementById('initialCapital').value = config.inputs.initialCapital;
            document.getElementById('monthlyContribution').value = config.inputs.monthlyContribution;
            document.getElementById('investmentYears').value = config.inputs.years;
            document.getElementById('expectedReturn').value = config.inputs.expectedReturn * 100;
            document.getElementById('inflationRate').value = config.inputs.inflationRate * 100;
            document.getElementById('taxRate').value = config.inputs.taxRate * 100;
            document.getElementById('contributionGrowth').value = config.inputs.contributionGrowth * 100;
            document.getElementById('managementFees').value = config.inputs.managementFees * 100;
            document.getElementById('volatility').value = config.inputs.volatility * 100;
            document.getElementById('volatilityValue').textContent = `${config.inputs.volatility * 100}%`;
            document.getElementById('startDate').value = config.inputs.startDate;
            document.getElementById('etfType').value = config.inputs.etfType;
            document.getElementById('includeReinvestment').checked = config.inputs.includeReinvestment;
            document.getElementById('includeInflationAdjustment').checked = config.inputs.includeInflationAdjustment;
            document.getElementById('enableMonteCarloMode').checked = config.inputs.enableMonteCarloMode;
            
            this.showAlert(`Configurazione caricata (salvata il ${new Date(config.timestamp).toLocaleString()}).`, "success");
            this.updateQuickStats();
        } catch (error) {
            console.error("Errore nel caricamento della configurazione:", error);
            this.showAlert("Errore nel caricamento della configurazione salvata.", "danger");
        }
    },
    
    // Esporta un report
    exportReport: function() {
        ExportManager.generatePDF();
    },
    
    // Mostra la guida
    showHelp: function() {
        const helpContent = document.getElementById('helpContent');
        helpContent.innerHTML = `
            <h6>Come utilizzare il simulatore</h6>
            <p>Il simulatore ETF ti permette di proiettare la crescita del tuo investimento nel tempo, considerando diversi parametri:</p>
            
            <h6 class="mt-4">Parametri Base</h6>
            <ul>
                <li><strong>Capitale Iniziale</strong>: L'importo iniziale che vuoi investire.</li>
                <li><strong>Contributo Mensile</strong>: L'importo che aggiungerai ogni mese all'investimento.</li>
                <li><strong>Durata</strong>: Il numero di anni per cui vuoi simulare l'investimento.</li>
                <li><strong>Rendimento Atteso</strong>: Il rendimento annuale medio che ti aspetti dal tuo investimento.</li>
            </ul>
            
            <h6 class="mt-4">Parametri Avanzati</h6>
            <ul>
                <li><strong>Crescita Contributo Annuale</strong>: Di quanto aumenterà il tuo contributo mensile ogni anno.</li>
                <li><strong>Costi Gestione</strong>: La percentuale annua di costi del fondo (TER).</li>
                <li><strong>Volatilità</strong>: Quanto è variabile il rendimento anno per anno.</li>
                <li><strong>Simulazione Monte Carlo</strong>: Simula molteplici scenari casuali per valutare la probabilità di risultati diversi.</li>
            </ul>
            
            <div class="alert alert-info mt-4">
                <i class="fas fa-lightbulb me-2"></i>
                Suggerimento: Inizia con i parametri base, esegui una simulazione, poi aggiusta i parametri avanzati per affinare i risultati.
            </div>
        `;
        
        const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
        helpModal.show();
    },
    
    // Aggiorna i default in base al tipo di ETF selezionato
    updateETFDefaults: function() {
        const etfType = document.getElementById('etfType').value;
        const defaults = {
            'world': { return: 7, volatility: 15, fees: 0.20 },
            'sp500': { return: 9, volatility: 18, fees: 0.05 },
            'europe': { return: 6, volatility: 17, fees: 0.25 },
            'emerging': { return: 8, volatility: 25, fees: 0.45 },
            'bonds': { return: 3, volatility: 5, fees: 0.10 },
            'mixed': { return: 5, volatility: 10, fees: 0.15 }
        };
        
        if (defaults[etfType]) {
            document.getElementById('expectedReturn').value = defaults[etfType].return;
            document.getElementById('volatility').value = defaults[etfType].volatility;
            document.getElementById('volatilityValue').textContent = `${defaults[etfType].volatility}%`;
            document.getElementById('managementFees').value = defaults[etfType].fees;
            
            this.showAlert(`Impostazioni predefinite per ${this.getETFTypeName(etfType)} caricate.`, "info");
        }
    }
};