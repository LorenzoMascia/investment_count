const Calculator = {
    // Calcola l'investimento
    calculateInvestment: function(params) {
        // Calcola il percorso base
        const baseProjection = this.calculateBaseProjection(params);
        
        // Se richiesto, calcola anche la simulazione Monte Carlo
        let monteCarloResults = null;
        if (params.enableMonteCarloMode) {
            monteCarloResults = this.runMonteCarloSimulation(params, 100);
        }
        
        // Calcola le milestone
        const milestones = this.calculateMilestones(baseProjection);
        
        // Calcola le metriche riassuntive
        const metrics = this.calculateMetrics(baseProjection, params);
        
        return {
            params: params,
            baseProjection: baseProjection,
            monteCarloResults: monteCarloResults,
            milestones: milestones,
            ...metrics
        };
    },
    
    // Calcola la proiezione base
    calculateBaseProjection: function(params) {
        const projection = [];
        let currentValue = params.initialCapital;
        let currentContribution = params.monthlyContribution;
        let totalInvested = 0;
        let totalTaxesPaid = 0;
        let previousYearValue = params.initialCapital;
        
        // Data di inizio
        let currentDate = new Date(params.startDate || new Date());
        
        for (let year = 1; year <= params.years; year++) {
            let yearlyGain = 0;
            let yearlyContributions = 0;
            let yearlyFees = 0;
            let yearlyTaxes = 0;
            
            // Simula ogni mese
            for (let month = 1; month <= 12; month++) {
                // Aggiungi il contributo mensile
                yearlyContributions += currentContribution;
                totalInvested += currentContribution;
                currentValue += currentContribution;
                
                // Calcola il rendimento mensile con volatilità
                const monthlyReturn = this.calculateMonthlyReturn(params.expectedReturn, params.volatility);
                const monthlyGain = currentValue * monthlyReturn;
                
                yearlyGain += monthlyGain;
                currentValue += monthlyGain;
                
                // Calcola e sottrai le commissioni di gestione mensili
                const monthlyFee = currentValue * (params.managementFees / 12);
                yearlyFees += monthlyFee;
                currentValue -= monthlyFee;
                
                // Aggiorna la data
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            
            // Calcola e paga le tasse sui guadagni (solo se ci sono plusvalenze)
            const yearEndValueBeforeTax = currentValue;
            const yearlyNetGain = yearEndValueBeforeTax - previousYearValue - yearlyContributions;
            
            if (yearlyNetGain > 0) {
                yearlyTaxes = yearlyNetGain * params.taxRate;
                currentValue -= yearlyTaxes;
                totalTaxesPaid += yearlyTaxes;
            }
            
            // Aggiusta per l'inflazione se richiesto
            let inflationAdjustedValue = currentValue;
            if (params.includeInflationAdjustment) {
                inflationAdjustedValue = currentValue / Math.pow(1 + params.inflationRate, year);
            }
            
            // Aumenta il contributo mensile per l'anno successivo in base alla crescita
            if (params.contributionGrowth > 0) {
                currentContribution *= (1 + params.contributionGrowth);
            }
            
            // Salva i dati annuali
            projection.push({
                year: year,
                date: new Date(currentDate),
                value: currentValue,
                inflationAdjustedValue: inflationAdjustedValue,
                contributions: yearlyContributions,
                totalInvested: totalInvested,
                gain: yearlyGain,
                fees: yearlyFees,
                taxes: yearlyTaxes,
                totalTaxesPaid: totalTaxesPaid,
                returnPercentage: (yearEndValueBeforeTax - previousYearValue - yearlyContributions) / previousYearValue * 100
            });
            
            previousYearValue = yearEndValueBeforeTax;
        }
        
        return projection;
    },
    
    // Calcola il rendimento mensile con volatilità
    calculateMonthlyReturn: function(expectedAnnualReturn, volatility) {
        // Converti i parametri annuali in mensili
        const expectedMonthlyReturn = Math.pow(1 + expectedAnnualReturn, 1/12) - 1;
        const monthlyVolatility = volatility / Math.sqrt(12);
        
        // Simula un rendimento casuale con distribuzione normale
        let monthlyReturn;
        do {
            // Usa il metodo Box-Muller per generare una distribuzione normale
            let u1 = Math.random();
            let u2 = Math.random();
            let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            
            monthlyReturn = expectedMonthlyReturn + z0 * monthlyVolatility;
        } while (monthlyReturn < -0.5); // Evita perdite eccessive in un mese
        
        return monthlyReturn;
    },
    
    // Esegue una simulazione Monte Carlo
    runMonteCarloSimulation: function(params, simulationsCount = 100) {
        const results = [];
        
        for (let i = 0; i < simulationsCount; i++) {
            const simulation = this.calculateBaseProjection(params);
            results.push({
                finalValue: simulation[simulation.length - 1].value,
                minValue: Math.min(...simulation.map(y => y.value)),
                maxDrawdown: this.calculateMaxDrawdown(simulation.map(y => y.value))
            });
        }
        
        // Ordina i risultati per valore finale
        results.sort((a, b) => a.finalValue - b.finalValue);
        
        return {
            simulations: results,
            percentiles: this.calculatePercentiles(results.map(r => r.finalValue))
        };
    },
    
    // Calcola il massimo drawdown
    calculateMaxDrawdown: function(values) {
        let peak = values[0];
        let maxDrawdown = 0;
        
        for (let i = 1; i < values.length; i++) {
            if (values[i] > peak) {
                peak = values[i];
            } else {
                const drawdown = (peak - values[i]) / peak;
                if (drawdown > maxDrawdown) {
                    maxDrawdown = drawdown;
                }
            }
        }
        
        return maxDrawdown;
    },
    
    // Calcola i percentili
    calculatePercentiles: function(values) {
        return {
            p5: values[Math.floor(values.length * 0.05)],
            p25: values[Math.floor(values.length * 0.25)],
            p50: values[Math.floor(values.length * 0.5)],
            p75: values[Math.floor(values.length * 0.75)],
            p95: values[Math.floor(values.length * 0.95)]
        };
    },
    
    // Calcola le milestone significative
    calculateMilestones: function(projection) {
        const milestones = [];
        const finalValue = projection[projection.length - 1].value;
        
        // Aggiungi milestone per raddoppi, triplo, etc. del capitale iniziale
        const initialCapital = projection[0].contributions;
        for (let multiple = 2; multiple <= 10; multiple++) {
            const target = initialCapital * multiple;
            const milestone = this.findMilestone(projection, target, `${multiple}x Capitale Iniziale`);
            if (milestone) milestones.push(milestone);
        }
        
        // Aggiungi milestone per valori tondi (100k, 250k, 500k, 1M, etc.)
        const roundValues = [50000, 100000, 250000, 500000, 750000, 1000000, 1500000, 2000000];
        for (const value of roundValues) {
            if (value < finalValue) {
                const milestone = this.findMilestone(projection, value, `€${(value/1000).toFixed(0)}k`);
                if (milestone) milestones.push(milestone);
            }
        }
        
        // Aggiungi milestone per metà del valore finale
        const halfFinal = finalValue / 2;
        if (halfFinal > initialCapital) {
            const milestone = this.findMilestone(projection, halfFinal, "50% del Valore Finale");
            if (milestone) milestones.push(milestone);
        }
        
        return milestones.sort((a, b) => a.year - b.year);
    },
    
    // Trova una milestone specifica nella proiezione
    findMilestone: function(projection, targetValue, name) {
        for (const yearData of projection) {
            if (yearData.value >= targetValue) {
                return {
                    name: name,
                    year: yearData.year,
                    value: yearData.value,
                    percentage: (yearData.value / projection[projection.length - 1].value * 100).toFixed(1)
                };
            }
        }
        return null;
    },
    
    // Calcola le metriche riassuntive
    calculateMetrics: function(projection, params) {
        const finalYear = projection[projection.length - 1];
        const initialCapital = params.initialCapital;
        const totalInvested = finalYear.totalInvested + initialCapital;
        const finalValue = finalYear.value;
        const netProfit = finalValue - totalInvested;
        
        // Calcola il CAGR (Compound Annual Growth Rate)
        const cagr = Math.pow(finalValue / initialCapital, 1 / params.years) - 1;
        
        // Calcola il rendimento medio annuo
        const annualReturns = projection.map(y => y.returnPercentage);
        const averageReturn = annualReturns.reduce((sum, r) => sum + r, 0) / annualReturns.length;
        
        // Calcola la volatilità effettiva (deviazione standard dei rendimenti)
        const squaredDiffs = annualReturns.map(r => Math.pow(r - averageReturn, 2));
        const variance = squaredDiffs.reduce((sum, sd) => sum + sd, 0) / squaredDiffs.length;
        const actualVolatility = Math.sqrt(variance);
        
        // Calcola il rapporto rischio/rendimento (Sharpe ratio semplificato)
        const sharpeRatio = (averageReturn - (params.inflationRate * 100)) / actualVolatility;
        
        return {
            finalValue: finalValue,
            totalInvested: totalInvested,
            netProfit: netProfit,
            totalTaxesPaid: finalYear.totalTaxesPaid,
            totalFees: projection.reduce((sum, y) => sum + y.fees, 0),
            cagr: cagr,
            averageReturn: averageReturn / 100,
            actualVolatility: actualVolatility / 100,
            sharpeRatio: sharpeRatio,
            maxDrawdown: this.calculateMaxDrawdown(projection.map(y => y.value))
        };
    }
};