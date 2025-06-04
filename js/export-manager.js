class ExportManager {
  static exportReport() {
    try {
      // Creazione del report in formato HTML
      const reportContent = this.generateReportContent();
      
      // Creazione del blob e download
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ETF_Simulation_Report_${new Date().toISOString().slice(0,10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      Utils.showAlert('Report esportato con successo!', 'success');
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error);
      Utils.showAlert('Errore durante l\'esportazione del report', 'danger');
    }
  }

  static generateReportContent() {
    const date = new Date().toLocaleString();
    const config = ETFSimulator.getCurrentConfig();
    const charts = ['mainChart', 'compositionChart', 'returnsChart'];
    
    let chartsHTML = '';
    charts.forEach(chartId => {
      const canvas = document.getElementById(chartId);
      if (canvas) {
        chartsHTML += `<div class="chart-report">
          <h3>${canvas.previousElementSibling.textContent}</h3>
          <img src="${canvas.toDataURL('image/png')}" alt="${chartId}">
        </div>`;
      }
    });

    return `<!DOCTYPE html>
<html>
<head>
  <title>Report Simulazione ETF</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .config-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .config-table th, .config-table td { border: 1px solid #ddd; padding: 8px; }
    .config-table th { background-color: #f2f2f2; text-align: left; }
    .chart-report { margin: 20px 0; page-break-inside: avoid; }
    .chart-report img { max-width: 100%; height: auto; }
    .footer { margin-top: 30px; font-size: 0.8em; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Report Simulazione ETF</h1>
    <p>Generato il ${date}</p>
  </div>
  
  <h2>Configurazione</h2>
  <table class="config-table">
    ${Object.entries(config).map(([key, value]) => `
      <tr>
        <th>${key}</th>
        <td>${typeof value === 'object' ? JSON.stringify(value) : value}</td>
      </tr>
    `).join('')}
  </table>
  
  <h2>Grafici</h2>
  ${chartsHTML}
  
  <div class="footer">
    Report generato con Simulatore ETF Professionale
  </div>
</body>
</html>`;
  }

  static exportToCSV() {
    try {
      const table = document.querySelector('.comparison-table');
      let csv = [];
      
      // Intestazioni
      const headers = [];
      table.querySelectorAll('thead th').forEach(th => {
        headers.push(th.textContent);
      });
      csv.push(headers.join(','));
      
      // Dati
      table.querySelectorAll('tbody tr').forEach(tr => {
        const row = [];
        tr.querySelectorAll('td').forEach(td => {
          row.push(td.textContent.replace(/,/g, ';'));
        });
        csv.push(row.join(','));
      });
      
      // Creazione e download
      const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ETF_Simulation_Data_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      Utils.showAlert('Dati esportati in CSV con successo!', 'success');
    } catch (error) {
      console.error('Errore durante l\'esportazione CSV:', error);
      Utils.showAlert('Errore durante l\'esportazione CSV', 'danger');
    }
  }
}