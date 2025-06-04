// Calculator - Core calculation engine
class Calculator {
  constructor() {
    this.riskFreeRate = 0.02; // 2% risk-free rate
    this.marketRisk = 0.15; // 15% market volatility
  }

  // Simulazione principale
  simulate(config) {
    const simulation = [];
    let currentValue = config.initialCapital;
    let totalContributions = config.initialCapital;
    let totalTaxes = 0;
    let totalFees = 0;
    let currentMonthlyContribution = config.monthlyContribution;

    const monthlyReturn = config.expectedReturn / 100 / 12;
    const monthlyInflation = config.inflationRate / 100 / 12;
    const monthlyFees = config.managementFees / 100 / 12;

    for (let month = 0; month < config.investmentYears * 12; month++) {
      // Applica rendimento mensile con volatilità
      let monthlyGain = 0;
      if (currentValue > 0) {
        const baseReturn = monthlyReturn;
        const volatilityAdjustment = config.enableVolatility ? 
          this.generateVolatilityAdjustment(config.volatility / 100) : 0;
        
        const actualReturn = baseReturn + volatilityAdjustment;
        monthlyGain = currentValue * actualReturn;
        currentValue += monthlyGain;
      }

      // Aggiungi contributo mensile
      if (month > 0) { // Non aggiungere contributo nel primo mese (già incluso nel capitale iniziale)
        currentValue += currentMonthlyContribution;
        totalContributions += currentMonthlyContribution;
      }

      // Calcola e sottrai costi di gestione
      const monthlyFee = currentValue * monthlyFees;
      currentValue -= monthlyFee;
      totalFees += monthlyFee;

      // Calcola tasse sui guadagni (solo se in guadagno)
      const totalGains = currentValue - totalContributions;
      let taxesThisMonth = 0;
      if (totalGains > 0 && config.taxRate > 0) {
        // Semplificazione: tasse applicate sui guadagni mensili
        if (monthlyGain > 0) {
          taxesThisMonth = monthlyGain * (config.taxRate / 100);
          currentValue -= taxesThisMonth;
          totalTaxes += taxesThisMonth;
        }
      }

      // Salva lo stato del mese
      simulation.push({
        month: month,
        totalValue: Math.max(0, currentValue),
        totalContributions: totalContributions,
        monthlyContribution: month === 0 ? config.initialCapital : currentMonthlyContribution,
        monthlyGain: monthlyGain,
        monthlyFees: monthlyFee,
        monthlyTaxes: taxesThisMonth,
        gains: Math.max(0, currentValue - totalContributions),
        taxes: totalTaxes,
        fees: totalFees
      });

      // Incrementa contributo annualmente
      if (month > 0 && month % 12 === 0 && config.contributionGrowth > 0) {
        currentMonthlyContribution *= (1 + config.contributionGrowth / 100);
      }
    }

    return {
      simulation: simulation,
      totalContributions: totalContributions,
      totalTaxes: totalTaxes,
      totalFees: totalFees,
      totalMonths: simulation.length,
      config: config
    };
  }

  // Simulazione Monte Carlo
  runMonteCarlo(config, iterations = 1000) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const modifiedConfig = { ...config };
      
      // Varia parametri chiave
      modifiedConfig.expectedReturn = this.varyParameter(config.expectedReturn, 0.3);
      modifiedConfig.volatility = this.varyParameter(config.volatility, 0.2);
      modifiedConfig.inflationRate = this.varyParameter(config.inflationRate, 0.2);
      
      // Abilita volatilità per Monte Carlo
      modifiedConfig.enableVolatility = true;
      
      const simulation = this.simulate(modifiedConfig);
      results.push(simulation.simulation);
    }
    
    return results;
  }

  // Genera aggiustamento per volatilità
  generateVolatilityAdjustment(volatility) {
    // Box-Muller transformation per distribuzione normale
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Scala per volatilità mensile
    return (z * volatility) / Math.sqrt(12);
  }

  // Varia un parametro per Monte Carlo
  varyParameter(baseValue, variationFactor) {
    const variation = (Math.random() - 0.5) * 2 * variationFactor;
    return baseValue * (1 + variation);
  }

  // Calcola il compound annual growth rate
  calculateCAGR(initialValue, finalValue, years) {
    if (initialValue <= 0 || finalValue <= 0 || years <= 0) return 0;
    return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
  }

  // Calcola il valore futuro con compound interest
  calculateFutureValue(presentValue, rate, periods) {
    return presentValue * Math.pow(1 + rate, periods);
  }

  // Calcola il valore presente
  calculatePresentValue(futureValue, rate, periods) {
    return futureValue / Math.pow(1 + rate, periods);
  }

  // Calcola l'annuità (payment mensile necessario)
  calculateAnnuity(presentValue, rate, periods) {
    if (rate === 0) return presentValue / periods;
    return presentValue * (rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);
  }

  // Simulazione con scenario di crisi
  simulateWithCrisis(config, crisisYears = []) {
    const simulation = [];
    let currentValue = config.initialCapital;
    let totalContributions = config.initialCapital;
    let totalTaxes = 0;
    let totalFees = 0;
    let currentMonthlyContribution = config.monthlyContribution;

    const monthlyReturn = config.expectedReturn / 100 / 12;
    const monthlyFees = config.managementFees / 100 / 12;

    for (let month = 0; month < config.investmentYears * 12; month++) {
      const currentYear = Math.floor(month / 12);
      const isCrisisYear = crisisYears.includes(currentYear);
      
      // Applica rendimento mensile
      let actualMonthlyReturn = monthlyReturn;
      
      if (isCrisisYear) {
        // Durante la crisi: -20% per l'anno
        actualMonthlyReturn = -0.20 / 12;
      }
      
      const monthlyGain = currentValue * actualMonthlyReturn;
      currentValue += monthlyGain;

      // Aggiungi contributo mensile
      if (month > 0) {
        currentValue += currentMonthlyContribution;
        totalContributions += currentMonthlyContribution;
      }

      // Costi di gestione
      const monthlyFee = currentValue * monthlyFees;
      currentValue -= monthlyFee;
      totalFees += monthlyFee;

      // Tasse
      let taxesThisMonth = 0;
      if (monthlyGain > 0 && config.taxRate > 0) {
        taxesThisMonth = monthlyGain * (config.taxRate / 100);
        currentValue -= taxesThisMonth;
        totalTaxes += taxesThisMonth;
      }

      simulation.push({
        month: month,
        totalValue: Math.max(0, currentValue),
        totalContributions: totalContributions,
        monthlyGain: monthlyGain,
        monthlyFees: monthlyFee,
        monthlyTaxes: taxesThisMonth,
        gains: Math.max(0, currentValue - totalContributions),
        taxes: totalTaxes,
        fees: totalFees,
        isCrisis: isCrisisYear
      });

      // Incrementa contributo annualmente
      if (month > 0 && month % 12 === 0 && config.contributionGrowth > 0) {
        currentMonthlyContribution *= (1 + config.contributionGrowth / 100);
      }
    }

    return {
      simulation: simulation,
      totalContributions: totalContributions,
      totalTaxes: totalTaxes,
      totalFees: totalFees,
      config: config
    };
  }

  // Calcola il tempo necessario per raggiungere un obiettivo
  calculateTimeToGoal(config, targetAmount) {
    let currentValue = config.initialCapital;
    let totalContributions = config.initialCapital;
    let month = 0;
    const monthlyReturn = config.expectedReturn / 100 / 12;
    const monthlyFees = config.managementFees / 100 / 12;
    let currentMonthlyContribution = config.monthlyContribution;

    while (currentValue < targetAmount && month < 600) { // Max 50 anni
      // Rendimento
      const monthlyGain = currentValue * monthlyReturn;
      currentValue += monthlyGain;

      // Contributo
      if (month > 0) {
        currentValue += currentMonthlyContribution;
        totalContributions += currentMonthlyContribution;
      }

      // Costi
      currentValue -= currentValue * monthlyFees;

      // Tasse sui guadagni
      if (monthlyGain > 0) {
        currentValue -= monthlyGain * (config.taxRate / 100);
      }

      month++;

      // Incrementa contributo annualmente
      if (month > 0 && month % 12 === 0 && config.contributionGrowth > 0) {
        currentMonthlyContribution *= (1 + config.contributionGrowth / 100);
      }
    }

    return {
      months: month,
      years: Math.floor(month / 12),
      achievable: currentValue >= targetAmount,
      finalValue: currentValue,
      totalContributions: totalContributions
    };
  }

  // Calcola il contributo necessario per raggiungere un obiettivo
  calculateRequiredContribution(config, targetAmount) {
    const trials = [];
    let low = 0;
    let high = 10000;
    let bestContribution = 0;

    // Binary search per trovare il contributo ottimale
    for (let i = 0; i < 50; i++) {
      const testContribution = (low + high) / 2;
      const testConfig = { ...config, monthlyContribution: testContribution };
      const result = this.simulate(testConfig);
      const finalValue = result.simulation[result.simulation.length - 1].totalValue;

      if (Math.abs(finalValue - targetAmount) < targetAmount * 0.01) {
        bestContribution = testContribution;
        break;
      }

      if (finalValue < targetAmount) {
        low = testContribution;
      } else {
        high = testContribution;
        bestContribution = testContribution;
      }
    }

    return {
      requiredContribution: bestContribution,
      achievable: bestContribution <= 5000, // Limite ragionevole
      finalValue: this.simulate({ ...config, monthlyContribution: bestContribution }).simulation.slice(-1)[0].totalValue
    };
  }

  // Analisi di sensibilità
  runSensitivityAnalysis(baseConfig) {
    const parameters = [
      { name: 'expectedReturn', values: [-2, -1, 0, 1, 2] },
      { name: 'volatility', values: [-5, -2.5, 0, 2.5, 5] },
      { name: 'inflationRate', values: [-1, -0.5, 0, 0.5, 1] },
      { name: 'taxRate', values: [-5, -2.5, 0, 2.5, 5] },
      { name: 'managementFees', values: [-0.1, -0.05, 0, 0.05, 0.1] }
    ];

    const results = {};

    parameters.forEach(param => {
      results[param.name] = [];
      param.values.forEach(variation => {
        const modifiedConfig = { ...baseConfig };
        modifiedConfig[param.name] += variation;
        
        const simulation = this.simulate(modifiedConfig);
        const finalValue = simulation.simulation[simulation.simulation.length - 1].totalValue;
        
        results[param.name].push({
          variation: variation,
          finalValue: finalValue,
          impact: ((finalValue - baseConfig.initialCapital) / baseConfig.initialCapital) * 100
        });
      });
    });

    return results;
  }

  // Calcola statistiche di base
  calculateBasicStats(data) {
    const values = data.map(point => point.totalValue);
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      median: sorted[Math.floor(sorted.length / 2)],
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      q1: sorted[Math.floor(sorted.length * 0.25)],
      q3: sorted[Math.floor(sorted.length * 0.75)]
    };
  }

  // Calcola la correlazione tra due serie di dati
  calculateCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// Inizializza il calculator globale
window.Calculator = new Calculator();
