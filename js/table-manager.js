/**
 * Classe per gestire le tabelle dei risultati nella UI
 */
class TableManager {
  /**
   * Aggiorna la tabella dettaglio con i risultati della simulazione
   * @param {Object} simulation - Oggetto simulazione restituito da Calculator.calculateETFGrowth()
   */
  static updateDetailsTable(simulation) {
    if (!simulation) return;

    const config = ETFSimulator.getCurrentConfig();

    // Dati righe tabella
    const rows = [
      {
        metric: 'Capitale Finale',
        value: Utils.formatCurrency(simulation.finalCapital),
        details: 'Valore totale alla fine del periodo',
        evaluation: this.getEvaluation(simulation.finalCapital, simulation.totalInvested)
      },
      {
        metric: 'Totale Investito',
        value: Utils.formatCurrency(simulation.totalInvested),
        details: 'Somma di tutti i contributi versati',
        evaluation: 'Investimento totale'
      },
      {
        metric: 'Guadagno Netto',
        value: Utils.formatCurrency(simulation.netProfit),
        details: `Dopo tasse (${config.taxRate}%)`,
        evaluation: this.getProfitEvaluation(simulation.netProfit, simulation.totalInvested)
      },
      {
        metric: 'Rendimento Annualizzato',
        value: `${simulation.annualizedReturn.toFixed(2)}%`,
        details: 'Rendimento composto annuo',
        evaluation: this.getReturnEvaluation(simulation.annualizedReturn)
      },
      {
        metric: 'Inflazione Corretta',
        value: Utils.formatCurrency(simulation.inflationAdjustedFinalCapital),
        details: `Valore reale (inflazione ${config.inflationRate}%)`,
        evaluation: 'Potere d\'acquisto finale'
      },
      {
        metric: 'Costi Totali Gestione',
        value: Utils.formatCurrency(simulation.totalFees),
        details: `Commissioni (${config.managementFees}% annuo)`,
        evaluation: 'Costi accumulati'
      },
      {
        metric: 'Peggiore Anno',
        value: simulation.worstYear ? 
          `${simulation.worstYear.year}: ${simulation.worstYear.return.toFixed(2)}%` : 'N/A',
        details: 'Peggiore rendimento annuale',
        evaluation: 'Performance negativa'
      },
      {
        metric: 'Miglior Anno',
        value: simulation.bestYear ? 
          `${simulation.bestYear.year}: ${simulation.bestYear.return.toFixed(2)}%` : 'N/A',
        details: 'Miglior rendimento annuale',
        evaluation: 'Performance positiva'
      }
    ];

    // Genera HTML dinamico
    let html = '';
    rows.forEach(row => {
      html += `
        <tr>
          <td><strong>${row.metric}</strong></td>
          <td>${row.value}</td>
          <td class="text-muted small">${row.details}</td>
          <td>${row.evaluation}</td>
        </tr>
      `;
    });

    // Inserisci HTML nella tabella
    const tableElement = document.getElementById('detailsTable');
    if (tableElement) {
      tableElement.innerHTML = html;
    } else {
      console.warn("Tabella 'detailsTable' non trovata nel DOM");
    }
  }

  /**
   * Valuta il rapporto tra capitale finale e investito
   * @param {number} finalValue - Capitale finale
   * @param {number} invested - Totale investito
   * @returns {string} Badge HTML con valutazione
   */
  static getEvaluation(finalValue, invested) {
    const ratio = finalValue / invested;
    if (ratio > 3) return '<span class="badge bg-success">Eccellente</span>';
    if (ratio > 2) return '<span class="badge bg-primary">Ottimo</span>';
    if (ratio > 1.5) return '<span class="badge bg-info">Buono</span>';
    if (ratio > 1) return '<span class="badge bg-secondary">Accettabile</span>';
    return '<span class="badge bg-warning">Scarso</span>';
  }

  /**
   * Valuta il guadagno netto in percentuale rispetto al totale investito
   * @param {number} profit - Guadagno netto
   * @param {number} invested - Totale investito
   * @returns {string} Badge HTML con valutazione
   */
  static getProfitEvaluation(profit, invested) {
    const percentage = (profit / invested) * 100;
    if (percentage > 200) return '<span class="badge bg-success">Ritorno eccezionale</span>';
    if (percentage > 100) return '<span class="badge bg-primary">Alto guadagno</span>';
    if (percentage > 50) return '<span class="badge bg-info">Buon guadagno</span>';
    if (percentage > 0) return '<span class="badge bg-secondary">Guadagno modesto</span>';
    return '<span class="badge bg-danger">Perdita</span>';
  }

  /**
   * Valuta il rendimento annualizzato
   * @param {number} annualReturn - Rendimento annuale in percentuale
   * @returns {string} Badge HTML con valutazione
   */
  static getReturnEvaluation(annualReturn) {
    if (annualReturn > 15) return '<span class="badge bg-success">Molto alto</span>';
    if (annualReturn > 10) return '<span class="badge bg-primary">Alto</span>';
    if (annualReturn > 7) return '<span class="badge bg-info">Medio-alto</span>';
    if (annualReturn > 5) return '<span class="badge bg-secondary">Medio</span>';
    if (annualReturn > 0) return '<span class="badge bg-warning">Basso</span>';
    return '<span class="badge bg-danger">Negativo</span>';
  }

  /**
   * Esporta i dati in formato CSV
   * Placeholder per ExportManager
   */
  static exportToCSV() {
    try {
      if (typeof ExportManager !== 'undefined' && ExportManager.exportToCSV) {
        ExportManager.exportToCSV();
      } else {
        throw new Error("ExportManager non disponibile o metodo exportToCSV non implementato");
      }
    } catch (error) {
      console.error("Errore nell'esportazione CSV:", error);
      Utils.showToast("Errore nell'esportazione CSV", "danger");
    }
  }
}