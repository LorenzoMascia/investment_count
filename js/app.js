// Application initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Initialise theme
    ThemeManager.init();
    
    // Set default start date to today
    document.getElementById('startDate').valueAsDate = new Date();
    
    // Load any saved configurations
    ETFSimulator.loadConfiguration();
    
    // Update Quick Statistics
    ETFSimulator.updateQuickStats();
    
    // Add tooltip
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-tooltip]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});