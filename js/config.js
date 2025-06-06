// Global application configuration
const CONFIG = {
  // General settings
  APP_NAME: 'Professional Investment Simulator',
  VERSION: '1.0.0',
  
  // Input limits
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
  
  // ETF presets with realistic parameters
  ETF_PRESETS: {
    world: {
      name: 'World Equity (MSCI World)',
      expectedReturn: 7.0,
      volatility: 15,
      fees: 0.25,
      description: 'Diversified ETF on global developed markets'
    },
    sp500: {
      name: 'S&P 500',
      expectedReturn: 8.5,
      volatility: 18,
      fees: 0.15,
      description: 'ETF on the 500 largest US companies'
    },
    europe: {
      name: 'European Equity',
      expectedReturn: 6.5,
      volatility: 16,
      fees: 0.30,
      description: 'ETF on European equity markets'
    },
    emerging: {
      name: 'Emerging Markets',
      expectedReturn: 8.0,
      volatility: 22,
      fees: 0.45,
      description: 'ETF on emerging markets'
    },
    bonds: {
      name: 'Bond Market',
      expectedReturn: 3.5,
      volatility: 8,
      fees: 0.20,
      description: 'Diversified bond ETF'
    },
    mixed: {
      name: 'Balanced 60/40',
      expectedReturn: 5.5,
      volatility: 12,
      fees: 0.35,
      description: '60% equities, 40% bonds'
    }
  },
  
  // Predefined scenarios
  SCENARIO_PRESETS: [
    {
      name: 'Conservative',
      expectedReturn: 4.0,
      volatility: 8,
      description: 'Low risk profile'
    },
    {
      name: 'Moderate',
      expectedReturn: 6.0,
      volatility: 12,
      description: 'Medium risk profile'
    },
    {
      name: 'Aggressive',
      expectedReturn: 8.5,
      volatility: 18,
      description: 'High risk profile'
    },
    {
      name: '2008 Crisis',
      expectedReturn: -35,
      volatility: 30,
      description: 'Financial crisis year'
    },
    {
      name: 'Bull Market',
      expectedReturn: 25,
      volatility: 15,
      description: 'Exceptional year'
    }
  ],
  
  // Monte Carlo settings
  MONTE_CARLO: {
    SIMULATIONS: 1000,
    CONFIDENCE_INTERVALS: [10, 25, 50, 75, 90]
  },
  
  // Chart colors
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
  
  // Output formats
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
  
  // Validation messages
  VALIDATION_MESSAGES: {
    REQUIRED: 'This field is required',
    MIN_VALUE: 'The value must be at least {min}',
    MAX_VALUE: 'The value cannot exceed {max}',
    INVALID_NUMBER: 'Enter a valid number',
    INVALID_DATE: 'Enter a valid date'
  },
  
  // Help texts
  HELP_TEXTS: {
    INITIAL_CAPITAL: 'The initial capital is the amount you already have available to start investing.',
    MONTHLY_CONTRIBUTION: 'The amount you intend to invest each month in addition to your initial capital.',
    EXPECTED_RETURN: 'The expected average annual return of the ETF, based on historical data.',
    VOLATILITY: 'It measures the variability of returns. The higher it is, the more the results can vary.',
    INFLATION: 'The inflation rate reduces purchasing power over time.',
    TAXES: 'Capital gains taxes you will have to pay on earnings.',
    MONTE_CARLO: 'It simulates thousands of different scenarios to assess the probability of success.'
  },
  
  // Risk assessment thresholds
  RISK_THRESHOLDS: {
    LOW: { volatility: 10, return: 5 },
    MEDIUM: { volatility: 15, return: 7 },
    HIGH: { volatility: 20, return: 10 }
  }
};

// Utility to access the configuration
window.CONFIG = CONFIG;