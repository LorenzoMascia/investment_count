// Chart Manager - Gestione di tutti i grafici
class ChartManager {
  constructor() {
    this.charts = {};
    this.currentType = 'line';
    this.colors = {
      primary: '#0d6efd',
      success: '#198754',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#0dcaf0',
      dark: '#212529',
      gradient: {
        blue: ['#667eea', '#764ba2'],
        green: ['#56ab2f', '#a8e6cf'],
        orange: ['#f093fb', '#f5576c'],
        purple: ['#4facfe', '#00f2fe']
      }
    };
  }

  init() {
    Chart.register(ChartZoom);
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    Chart.defaults.color = 'rgba(255, 255, 255, 0.8)';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
  }

  createMainChart(data, scenarios = []) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    if (this.charts.main) {
      this.charts.main.destroy();
    }

    const datasets = [];
    
    // Dataset principale
    datasets.push({
      label: 'Capitale Totale',
      data: data.map((point, index) => ({ x: index, y: point.totalValue })),
      borderColor: this.colors.primary,
      backgroundColor: this.createGradient(ctx, this.colors.gradient.blue),
      borderWidth: 3,
      fill: this.currentType === 'area',
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6
    });

    // Contributi totali
    datasets.push({
      label: 'Contributi Totali',
      data: data.map((point, index) => ({ x: index, y: point.totalContributions })),
      borderColor: this.colors.success,
      backgroundColor: this.createGradient(ctx, this.colors.gradient.green),
      borderWidth: 2,
      fill: false,
      borderDash: [5, 5],
      tension: 0.4,
      pointRadius: 0
    });

    // Aggiungi scenari se presenti
    scenarios.forEach((scenario, index) => {
      datasets.push({
        label: scenario.name,
        data: scenario.data.map((point, idx) => ({ x: idx, y: point.totalValue })),
        borderColor: this.colors.gradient.purple[index % 2],
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [10, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0
      });
    });

    this.charts.main = new Chart(ctx, {
      type: this.currentType === 'bar' ? 'bar' : 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'Anni',
              color: 'rgba(255, 255, 255, 0.8)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return Math.round(value / 12) + 'y';
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Valore (€)',
              color: 'rgba(255, 255, 255, 0.8)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return Utils.formatCurrency(value);
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              color: 'rgba(255, 255, 255, 0.9)'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            callbacks: {
              title: function(context) {
                const months = context[0].parsed.x;
                const years = Math.floor(months / 12);
                const remainingMonths = months % 12;
                return `Anno ${years}, Mese ${remainingMonths}`;
              },
              label: function(context) {
                return `${context.dataset.label}: ${Utils.formatCurrency(context.parsed.y)}`;
              }
            }
          },
          zoom: {
            zoom: {
              wheel: {
                enabled: true
              },
              pinch: {
                enabled: true
              },
              mode: 'xy'
            },
            pan: {
              enabled: true,
              mode: 'xy'
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  createCompositionChart(finalData) {
    const ctx = document.getElementById('compositionChart').getContext('2d');
    
    if (this.charts.composition) {
      this.charts.composition.destroy();
    }

    const data = {
      labels: ['Contributi', 'Guadagni', 'Tasse'],
      datasets: [{
        data: [
          finalData.totalContributions,
          finalData.gains,
          finalData.taxes
        ],
        backgroundColor: [
          this.colors.success,
          this.colors.primary,
          this.colors.danger
        ],
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }]
    };

    this.charts.composition = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.9)',
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${Utils.formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  createReturnsChart(yearlyReturns) {
    const ctx = document.getElementById('returnsChart').getContext('2d');
    
    if (this.charts.returns) {
      this.charts.returns.destroy();
    }

    this.charts.returns = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: yearlyReturns.map((_, index) => `Anno ${index + 1}`),
        datasets: [{
          label: 'Rendimento Annuale (%)',
          data: yearlyReturns,
          backgroundColor: yearlyReturns.map(value => 
            value >= 0 ? this.colors.success : this.colors.danger
          ),
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Rendimento (%)',
              color: 'rgba(255, 255, 255, 0.8)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return value.toFixed(1) + '%';
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            callbacks: {
              label: function(context) {
                return `Rendimento: ${context.parsed.y.toFixed(2)}%`;
              }
            }
          }
        }
      }
    });
  }

  createMonteCarloChart(simulations) {
    const ctx = document.getElementById('monteCarloChart').getContext('2d');
    
    if (this.charts.monteCarlo) {
      this.charts.monteCarlo.destroy();
    }

    // Calcola la distribuzione dei risultati finali
    const finalValues = simulations.map(sim => sim[sim.length - 1].totalValue);
    const bins = this.createHistogramBins(finalValues, 20);

    this.charts.monteCarlo = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bins.map(bin => Utils.formatCurrency(bin.center)),
        datasets: [{
          label: 'Frequenza',
          data: bins.map(bin => bin.count),
          backgroundColor: this.colors.info,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Valore finale (€)',
              color: 'rgba(255, 255, 255, 0.8)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Frequenza',
              color: 'rgba(255, 255, 255, 0.8)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white'
          }
        }
      }
    });

    // Mostra statistiche Monte Carlo
    this.showMonteCarloStats(finalValues);
  }

  createHistogramBins(data, numBins) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / numBins;
    
    const bins = [];
    for (let i = 0; i < numBins; i++) {
      const start = min + i * binWidth;
      const end = start + binWidth;
      const center = (start + end) / 2;
      const count = data.filter(value => value >= start && value < end).length;
      
      bins.push({ start, end, center, count });
    }
    
    return bins;
  }

  showMonteCarloStats(finalValues) {
    const sorted = [...finalValues].sort((a, b) => a - b);
    const percentiles = {
      p10: sorted[Math.floor(sorted.length * 0.1)],
      p25: sorted[Math.floor(sorted.length * 0.25)],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p75: sorted[Math.floor(sorted.length * 0.75)],
      p90: sorted[Math.floor(sorted.length * 0.9)]
    };

    const stats = `
      <div class="row text-center">
        <div class="col">
          <small class="text-muted">10° Percentile</small>
          <div class="fw-bold">${Utils.formatCurrency(percentiles.p10)}</div>
        </div>
        <div class="col">
          <small class="text-muted">Mediana</small>
          <div class="fw-bold">${Utils.formatCurrency(percentiles.p50)}</div>
        </div>
        <div class="col">
          <small class="text-muted">90° Percentile</small>
          <div class="fw-bold">${Utils.formatCurrency(percentiles.p90)}</div>
        </div>
      </div>
    `;

    document.getElementById('monteCarloContainer').insertAdjacentHTML('beforeend', 
      `<div class="mt-3 p-3 bg-dark bg-opacity-25 rounded">${stats}</div>`
    );
  }

  setType(type) {
    this.currentType = type;
    // Aggiorna i pulsanti attivi
    document.querySelectorAll('.btn-group button').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
  }

  resetZoom(chartName) {
    if (this.charts[chartName]) {
      this.charts[chartName].resetZoom();
    }
  }

  createGradient(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colors[0] + '80');
    gradient.addColorStop(1, colors[1] + '20');
    return gradient;
  }

  updateChartsTheme(isDark) {
    const textColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    // Ricrea tutti i grafici con il nuovo tema
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        this.charts[key].options.scales.x.title.color = textColor;
        this.charts[key].options.scales.y.title.color = textColor;
        this.charts[key].options.scales.x.grid.color = gridColor;
        this.charts[key].options.scales.y.grid.color = gridColor;
        this.charts[key].update();
      }
    });
  }

  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
}

// Inizializza il manager globale
window.ChartManager = new ChartManager();