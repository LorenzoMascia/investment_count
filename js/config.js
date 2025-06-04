// Configurazione globale dell'applicazione
const CONFIG = {
  // Impostazioni generali
  APP_NAME: 'Simulatore ETF Professionale',
  VERSION: '1.0.0',
  
  // Limiti di input
  LIMITS: {
    MIN_CAPITAL: 0,
    MAX_CAPITAL: 10000000,
    MIN_CONTRIBUTION: 0,
    MAX_CONTRIBUTION: 50000,
    MIN_YEARS: 1,
    MAX_YEARS: 50,
    MIN_RETURN: -20,
    MAX_RETURN: 30,
    MIN_INFLATION: 0,
    MAX_INFLATION: 15,
    MIN_TAX: 0,
    MAX_TAX: 50,
    MIN_VOLATILITY: 5,
    MAX_VOLATILITY: 40,
    MIN_FEES: 0,
    MAX_FEES: 5
  },
  
  // Preset ETF con parametri realistici
  ETF_PRESETS: {
    world: {
      name: 'Azionario Mondo (MSCI World)',
      expectedReturn: 7.0,
      volatility: 15,
      fees: 0.25,
      description: 'ETF diversificato sui mercati sviluppati globali'
    },
    sp500: {
      name: 'S&P 500',
      expectedReturn: 8.5,
      volatility: 18,
      fees: 0.15,
      description: 'ETF sulle 500 maggiori aziende USA'
    },
    europe: {
      name: 'Azionario Europa',
      expectedReturn: 6.5,
      volatility: 16,
      fees: 0.30,
      description: 'ETF sui mercati azionari europei'
    },
    emerging: {
      name: 'Mercati Emergenti',
      expectedReturn: 8.0,
      volatility: 22,
      fees: 0.45,
      description: 'ETF sui mercati emergenti'
    },
    bonds: {
      name: 'Obbligazionario',
      expectedReturn: 3.5,
      volatility: 8,
      fees: 0.20,
      description: 'ETF obbligazionario diversificato'
    },
    mixed: {
      name: 'Bilanciato 60/40',
      expectedReturn: 5.5,
      volatility: 12,
      fees: 0.35,
      description: '60% azioni, 40% obbligazioni'
    }
  },
  
  // Scenari predefiniti
  SCENARIO_PRESETS: [
    {
      name: 'Conservativo',
      expectedReturn: 4.0,
      volatility: 8,
      description: 'Profilo di rischio basso'
    },
    {
      name: 'Moderato',
      expectedReturn: 6.0,
      volatility: 12,
      description: 'Profilo di rischio medio'
    },
    {
      name: 'Aggressivo',
      expectedReturn: 8.5,
      volatility: 18,
      description: 'Profilo di rischio alto'
    },
    {
      name: 'Crisi 2008',
      expectedReturn: -35,
      volatility: 30,
      description: 'Anno di crisi finanziaria'
    },
    {
      name: 'Bull Market',
      expectedReturn: 25,
      volatility: 15,
      description: 'Anno eccezionale'
    }
  ],
  
  // Impostazioni Monte Carlo
  MONTE_CARLO: {
    SIMULATIONS: 1000,
    CONFIDENCE_INTERVALS: [10, 25, 50, 75, 90]
  },
  
  // Colori per i grafici
  CHART_COLORS: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    gradient: {
      blue: ['#007bff', '#0056b3'],
      green: ['#28a745', '#1e7e34'],
      red: ['#dc3545', '#c82333'],
      purple: ['#6f42c1', '#59359a']
    }
  },
  
  // Formati di output
  FORMATS: {
    CURRENCY: {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    },
    PERCENTAGE: {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    },
    NUMBER: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  
  // Messaggi di validazione
  VALIDATION_MESSAGES: {
    REQUIRED: 'Questo campo è obbligatorio',
    MIN_VALUE: 'Il valore deve essere almeno {min}',
    MAX_VALUE: 'Il valore non può superare {max}',
    INVALID_NUMBER: 'Inserire un numero valido',
    INVALID_DATE: 'Inserire una data valida'
  },
  
  // Testi di aiuto
  HELP_TEXTS: {
    INITIAL_CAPITAL: 'Il capitale iniziale è la somma che hai già disponibile per iniziare ad investire.',
    MONTHLY_CONTRIBUTION: 'L\'importo che intendi investire ogni mese in aggiunta al capitale iniziale.',
    EXPECTED_RETURN: 'Il rendimento annuale medio atteso dell\'ETF, basato su dati storici.',
    VOLATILITY: 'Misura la variabilità dei rendimenti. Più alta è, più i risultati possono variare.',
    INFLATION: 'Il tasso di inflazione riduce il potere d\'acquisto nel tempo.',
    TAXES: 'Le tasse sui capital gains che dovrai pagare sui guadagni.',
    MONTE_CARLO: 'Simula migliaia di scenari diversi per valutare la probabilità di successo.'
  },
  
  // Thresholds per la valutazione del rischio
  RISK_THRESHOLDS: {
    LOW: { volatility: 10, return: 5 },
    MEDIUM: { volatility: 15, return: 7 },
    HIGH: { volatility: 20, return: 10 }
  }
};

// Utility per accedere alla configurazione
window.CONFIG = CONFIG;