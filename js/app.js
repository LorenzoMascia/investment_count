// Inizializzazione dell'applicazione
document.addEventListener('DOMContentLoaded', function() {
    // Inizializza il tema
    ThemeManager.init();
    
    // Imposta la data di inizio predefinita a oggi
    document.getElementById('startDate').valueAsDate = new Date();
    
    // Carica eventuali configurazioni salvate
    ETFSimulator.loadConfiguration();
    
    // Aggiorna le statistiche rapide
    ETFSimulator.updateQuickStats();
    
    // Aggiungi tooltip
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-tooltip]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});