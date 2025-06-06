const ETFSimulator = {
    // Run the simulation
    run: function() {
        try {
            // Show loading spinner
            document.getElementById('loadingSpinner').style.display = 'flex';
            document.getElementById('chartsContainer').style.opacity = '0.5';
            
            // Simulate progressive loading
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 5;
                document.getElementById('progressBar').style.width = `${progress}%`;
                if (progress >= 100) clearInterval(progressInterval);
            }, 100);
            
            // Get input parameters
            const params = this.getInputParameters();
            
            // Simulate calculation delay
            setTimeout(() => {
                // Perform calculation
                const results = Calculator.calculateInvestment(params);
                
                // Update UI with results
                this.updateUI(results);
                
                // Hide spinner
                document.getElementById('loadingSpinner').style.display = 'none';
                document.getElementById('chartsContainer').style.opacity = '1';
                clearInterval(progressInterval);
            }, 1500);
        } catch (error) {
            console.error("Error during simulation:", error);
            this.showAlert("An error occurred during the simulation.", "danger");
            document.getElementById('loadingSpinner').style.display = 'none';
            document.getElementById('chartsContainer').style.opacity = '1';
        }
    },
    
    // Get input parameters from form
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
    
    // Update UI with results
    updateUI: function(results) {
        // Update quick stats
        this.updateQuickStats(results);
        
        // Update charts
        ChartManager.updateCharts(results);
        
        // Update detail table
        TableManager.updateTable(results);
        
        // Update milestones
        this.updateMilestones(results);
        
        // Show/hide Monte Carlo section if needed
        document.getElementById('monteCarloContainer').style.display = 
            results.params.enableMonteCarloMode ? 'block' : 'none';
    },
    
    // Update quick stats
    updateQuickStats: function(results) {
        const quickStatsContainer = document.getElementById('quickStats');
        
        if (!results) {
            // Preliminary stats based only on inputs
            const params = this.getInputParameters();
            const totalContributions = params.monthlyContribution * 12 * params.years;
            
            quickStatsContainer.innerHTML = `
                <div class="col-6">
                    <div class="stat-card">
                        <h6>Initial Capital</h6>
                        <p>€${params.initialCapital.toLocaleString('it-IT')}</p>
                    </div>
                </div>
                <div class="col-6">
                    <div class="stat-card">
                        <h6>Total Contributed</h6>
                        <p>€${totalContributions.toLocaleString('it-IT')}</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Complete stats with simulation results
        quickStatsContainer.innerHTML = `
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h6>Final Value</h6>
                    <p>€${results.finalValue.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h6>Total Invested</h6>
                    <p>€${results.totalInvested.toLocaleString('it-IT', {maximumFractionDigits: 2})}</p>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <h6>Net Profit</h6>
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
        
        // Update risk assessment
        this.updateRiskAssessment(results);
    },
    
    // Update risk assessment
    updateRiskAssessment: function(results) {
        const riskContainer = document.getElementById('riskAssessment');
        if (!results) {
            riskContainer.innerHTML = '<div class="alert alert-info">Run a simulation to assess risk.</div>';
            return;
        }
        
        // Calculate a simplified risk score
        const volatilityScore = results.params.volatility * 10;
        const yearsScore = 100 - (results.params.years * 2);
        const riskScore = Math.min(100, Math.max(0, (volatilityScore + yearsScore) / 2));
        
        let riskLevel, riskClass;
        if (riskScore < 30) {
            riskLevel = "Low";
            riskClass = "success";
        } else if (riskScore < 70) {
            riskLevel = "Moderate";
            riskClass = "warning";
        } else {
            riskLevel = "High";
            riskClass = "danger";
        }
        
        riskContainer.innerHTML = `
            <div class="risk-meter mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span>Risk</span>
                    <span>${riskLevel} (${Math.round(riskScore)}/100)</span>
                </div>
                <div class="progress">
                    <div class="progress-bar bg-${riskClass}" role="progressbar" 
                         style="width: ${riskScore}%" aria-valuenow="${riskScore}" 
                         aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <div class="risk-factors">
                <h6>Risk Factors:</h6>
                <ul>
                    <li>Volatility: ${Math.round(results.params.volatility * 100)}%</li>
                    <li>Time horizon: ${results.params.years} years</li>
                    <li>ETF Type: ${this.getETFTypeName(results.params.etfType)}</li>
                </ul>
            </div>
        `;
    },
    
    // Returns descriptive name of ETF type
    getETFTypeName: function(type) {
        const types = {
            'world': 'Global Equity',
            'sp500': 'S&P 500',
            'europe': 'European Equity',
            'emerging': 'Emerging Markets',
            'bonds': 'Bonds',
            'mixed': 'Balanced 60/40'
        };
        return types[type] || type;
    },
    
    // Update milestones
    updateMilestones: function(results) {
        const container = document.getElementById('milestonesContainer');
        if (!results || !results.milestones) {
            container.innerHTML = '<div class="alert alert-secondary">No milestones available.</div>';
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
                            <span>Year ${milestone.year}</span>
                            <span>${milestone.percentage}% of final</span>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar ${progressClass}" role="progressbar" 
                                 style="width: ${progress}%" aria-valuenow="${progress}" 
                                 aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add a row every 2 milestones
            if (index % 2 === 1 && index !== results.milestones.length - 1) {
                html += '</div><div class="row">';
            }
        });
        html += '</div>';
        
        container.innerHTML = html;
    },
    
    // Show an alert
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
        
        // Remove alert after some time
        if (duration > 0) {
            setTimeout(() => {
                const alertToRemove = document.getElementById(alertId);
                if (alertToRemove) {
                    alertToRemove.remove();
                }
            }, duration);
        }
    },
    
    // Reset the simulator
    reset: function() {
        // Reset input values to defaults
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
        
        // Reset results
        document.getElementById('quickStats').innerHTML = '';
        document.getElementById('riskAssessment').innerHTML = '';
        document.getElementById('milestonesContainer').innerHTML = '';
        
        // Reset charts
        ChartManager.resetCharts();
        
        // Reset table
        TableManager.resetTable();
        
        this.showAlert("Simulator reset to default values.", "success");
    },
    
    // Save current configuration
    saveConfiguration: function() {
        const config = {
            inputs: this.getInputParameters(),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('etfSimulatorConfig', JSON.stringify(config));
        this.showAlert("Configuration saved successfully.", "success");
    },
    
    // Load saved configuration
    loadConfiguration: function() {
        const savedConfig = localStorage.getItem('etfSimulatorConfig');
        if (!savedConfig) {
            this.showAlert("No saved configuration found.", "warning");
            return;
        }
        
        try {
            const config = JSON.parse(savedConfig);
            
            // Set values from saved data
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
            
            this.showAlert(`Configuration loaded (saved on ${new Date(config.timestamp).toLocaleString()}).`, "success");
            this.updateQuickStats();
        } catch (error) {
            console.error("Error loading configuration:", error);
            this.showAlert("Error loading saved configuration.", "danger");
        }
    },
    
    // Export a report
    exportReport: function() {
        ExportManager.generatePDF();
    },
    
    // Show help
    showHelp: function() {
        const helpContent = document.getElementById('helpContent');
        helpContent.innerHTML = `
            <h6>How to use the simulator</h6>
            <p>The ETF simulator allows you to project the growth of your investment over time, considering various parameters:</p>
            
            <h6 class="mt-4">Basic Parameters</h6>
            <ul>
                <li><strong>Initial Capital</strong>: The initial amount you want to invest.</li>
                <li><strong>Monthly Contribution</strong>: The amount you'll add to your investment each month.</li>
                <li><strong>Duration</strong>: The number of years you want to simulate the investment for.</li>
                <li><strong>Expected Return</strong>: The average annual return you expect from your investment.</li>
            </ul>
            
            <h6 class="mt-4">Advanced Parameters</h6>
            <ul>
                <li><strong>Annual Contribution Growth</strong>: How much your monthly contribution will increase each year.</li>
                <li><strong>Management Fees</strong>: The annual percentage cost of the fund (TER).</li>
                <li><strong>Volatility</strong>: How variable the return is year by year.</li>
                <li><strong>Monte Carlo Simulation</strong>: Simulates multiple random scenarios to evaluate probability of different outcomes.</li>
            </ul>
            
            <div class="alert alert-info mt-4">
                <i class="fas fa-lightbulb me-2"></i>
                Tip: Start with basic parameters, run a simulation, then adjust advanced parameters to refine results.
            </div>
        `;
        
        const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
        helpModal.show();
    },
    
    // Update defaults based on selected ETF type
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
            
            this.showAlert(`Default settings for ${this.getETFTypeName(etfType)} loaded.`, "info");
        }
    }
};