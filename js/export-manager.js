class ExportManager {
  static exportReport() {
    try {
      // Creation of the report in HTML format
      const reportContent = this.generateReportContent();
      
      // Blob creation and download
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ETF_Simulation_Report_${new Date().toISOString().slice(0,10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      Utils.showAlert('Report successfully exported!', 'success');
    } catch (error) {
      console.error('Error during export:', error);
      Utils.showAlert('Error during report export', 'danger');
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
  <title>Report Simulation ETF</title>
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
    <h1>ETF Simulation Report</h1>
    <p>Generated on ${date}</p>
  </div>
  
  <h2>Configuration</h2>
  <table class="config-table">
    ${Object.entries(config).map(([key, value]) => `
      <tr>
        <th>${key}</th>
        <td>${typeof value === 'object' ? JSON.stringify(value) : value}</td>
      </tr>
    `).join('')}
  </table>
  
  <h2>Charts</h2>
  ${chartsHTML}
  
  <div class="footer">
    Report generated with Professional ETF Simulator
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
      
      Utils.showAlert('Data exported to CSV successfully!', 'success');
    } catch (error) {
      console.error('Error during export CSV:', error);
      Utils.showAlert('Error during export CSV', 'danger');
    }
  }
}