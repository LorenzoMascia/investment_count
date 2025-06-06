const ChartManager = {
    charts: {},
    chartType: 'line',
    
    // Inizializza tutti i grafici
    initCharts: function() {
        this.charts.main = this.createChart('mainChart', {
            type: this.chartType,
            data: {
                labels: [],
                datasets: []
            },
            options: this.getMainChartOptions()
        });

        this.charts.composition = this.createChart('compositionChart', {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: []
            },
            options: this.getPieChartOptions('Final Composition')
        });

        this.charts.returns = this.createChart('returnsChart', {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: this.getReturnsChartOptions()
        });

        this.charts.monteCarlo = this.createChart('monteCarloChart', {
            type: 'boxplot',
            data: {
                labels: ['Distribution'],
                datasets: []
            },
            options: this.getMonteCarloChartOptions()
        });
    },

    // Crea un nuovo grafico
    createChart: function(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas "${canvasId}" not found.`);
            return null;
        }

        const ctx = canvas.getContext('2d');
        return new Chart(ctx, config);
    },

    // Aggiorna tutti i grafici con i nuovi dati
    updateCharts: function(results) {
        if (this.charts.main) this.updateMainChart(results.baseProjection);
        if (this.charts.composition) this.updateCompositionChart(results);
        if (this.charts.returns) this.updateReturnsChart(results.baseProjection);
        if (this.charts.monteCarlo && results.monteCarloResults) {
            this.updateMonteCarloChart(results.monteCarloResults);
        }
    },

    // Aggiorna il grafico principale
    updateMainChart: function(projection) {
        if (!projection || projection.length === 0) return;

        const labels = projection.map(y => y.year);
        const values = projection.map(y => y.value);
        const inflationAdjustedValues = projection.map(y => y.inflationAdjustedValue);
        const contributions = projection.map(y => y.totalInvested);

        this.charts.main.data.labels = labels;
        this.charts.main.data.datasets = [
            {
                label: 'Nominal Value',
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true
            },
            {
                label: 'Adjusted Value for Inflation',
                data: inflationAdjustedValues,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderDash: [5, 5],
                tension: 0.1,
                fill: false
            },
            {
                label: 'Total Invested',
                data: contributions,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1,
                fill: false
            }
        ];
        this.charts.main.update();
    },

    // Update the pie chart of the composition
    updateCompositionChart: function(results) {
        if (!results || !results.baseProjection || results.baseProjection.length === 0) return;

        const finalYear = results.baseProjection[results.baseProjection.length - 1];
        const totalInvested = finalYear.totalInvested + (results.params?.initialCapital || 0);
        const netProfit = finalYear.value - totalInvested;

        this.charts.composition.data.labels = [
            'Invested Capital',
            'Net Gain',
            'Fees Paid',
            'Commissions Paid'
        ];

        this.charts.composition.data.datasets = [{
            data: [
                totalInvested,
                netProfit,
                finalYear.totalTaxesPaid,
                results.totalFees
            ],
            backgroundColor: [
                'rgba(54, 162, 235, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 159, 64, 0.7)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }];
        this.charts.composition.update();
    },

    // Update annual yield graph
    updateReturnsChart: function(projection) {
        if (!projection || projection.length === 0) return;

        const labels = projection.map(y => y.year);
        const returns = projection.map(y => y.returnPercentage);

        this.charts.returns.data.labels = labels;
        this.charts.returns.data.datasets = [{
            label: 'Annual Yield (%)',
            data: returns,
            backgroundColor: returns.map(r => 
                r > 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'),
            borderColor: returns.map(r => 
                r > 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'),
            borderWidth: 1
        }];
        this.charts.returns.update();
    },

    // Update Monte Carlo Chart
    updateMonteCarloChart: function(monteCarloResults) {
        if (!monteCarloResults || !monteCarloResults.simulations) return;

        const datasets = [{
            label: 'Distribution Results',
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            outlierColor: '#999',
            data: monteCarloResults.simulations.map(s => s.finalValue)
        }];

        this.charts.monteCarlo.data.datasets = datasets;
        this.charts.monteCarlo.update();
    },

    // Reset all graphics
    resetCharts: function() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.data.labels = [];
                chart.data.datasets = [];
                chart.update();
            }
        });
    },

    // Change main graphic type
    setType: function(type) {
        this.chartType = type;
        this.resetCharts();
        this.initCharts();
    },

    // Reset zoom on a specific graph
    resetZoom: function(chartId) {
        if (this.charts[chartId] && this.charts[chartId].resetZoom) {
            this.charts[chartId].resetZoom();
        }
    },

    // Main Graph Options
    getMainChartOptions: function() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false },
                legend: { position: 'bottom' },
                tooltip: { mode: 'index', intersect: false },
                zoom: {
                    pan: { enabled: true, mode: 'x' },
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'x'
                    }
                }
            },
            interaction: { mode: 'nearest', axis: 'x' },
            scales: {
                x: { title: { display: true, text: 'Anni' } },
                y: {
                    title: { display: true, text: 'Valore (€)' },
                    ticks: { callback: value => `€${value.toLocaleString('it-IT')}` }
                }
            }
        };
    },

    // Pie chart options
    getPieChartOptions: function(title) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: title },
                legend: { position: 'right' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: €${value.toLocaleString('it-IT')} (${percentage}%)`;
                        }
                    }
                }
            }
        };
    },

    // Options graph annual returns
    getReturnsChartOptions: function() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Annual Yields (%)' },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Year' } },
                y: {
                    title: { display: true, text: 'Yield (%)' },
                    ticks: { callback: value => `${value.toFixed(0)}%` }
                }
            }
        };
    },

    // Monte Carlo graphic options
    getMonteCarloChartOptions: function() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Monte Carlo Results Distribution' },
                legend: { display: false }
            },
            scales: {
                y: {
                    ticks: {
                        callback: value => `€${value.toLocaleString('it-IT')}`
                    }
                }
            }
        };
    }
};