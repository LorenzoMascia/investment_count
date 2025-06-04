// Inizializzazione dell'applicazione
document.addEventListener('DOMContentLoaded', () => {
  // Inizializza i componenti
  ThemeManager.init();
  ETFSimulator.init();
  ScenarioManager.init();
  
  // Mostra il contenuto di aiuto predefinito
  ETFSimulator.showHelp();
  
  // Aggiungi tooltip
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-tooltip]'));
  tooltipTriggerList.map(tooltipTriggerEl => {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
      title: tooltipTriggerEl.getAttribute('data-tooltip'),
      placement: 'top'
    });
  });
  
  // Esegui una simulazione iniziale
  ETFSimulator.run();
});

// Esponi le funzioni globali
window.ETFSimulator = ETFSimulator;
window.ThemeManager = ThemeManager;
window.ScenarioManager = ScenarioManager;
window.ChartManager = ChartManager;
window.TableManager = TableManager;
window.ExportManager = ExportManager;