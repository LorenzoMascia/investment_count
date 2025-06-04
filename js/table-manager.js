const TableManager = {
    // Aggiorna la tabella con i risultati
    updateTable: function(results) {
        const tableBody = document.getElementById('detailsTable');
        if (!results || !results.baseProjection) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">Nessun dato disponibile</td>
                </tr>
            `;
            return;
        }
        const finalYear = results.baseProjection[results.baseProjection.length - 1];
        const metrics = [
            {
                metric: "Valore Finale",
                value: `€${finalYear.value.toLocaleString('it-IT', { maximumFractionDigits: 2 })}`,
                details: "Totale investimento finale dopo tasse e commissioni",
                rating: this.getRating(finalYear.value / finalYear.totalInvested)
            },
            {
                metric: "Capitale Investito Totale",
                value: `€${finalYear.totalInvested.toLocaleString('it-IT', { maximumFractionDigits: 2 })}`,
                details: "Somma iniziale più contributi mensili accumulati",
                rating: this.getRating(finalYear.totalInvested / finalYear.value)
            },
            {
                metric: "Guadagno Netto",
                value: `€${(finalYear.value - finalYear.totalInvested).toLocaleString('it-IT', { maximumFractionDigits: 2 })}`,
                details: "Guadagno lordo meno tasse pagate",
                rating: this.getRating((finalYear.value - finalYear.totalInvested) / finalYear.totalInvested)
            },
            {
                metric: "Tasso Crescita Annuale Composto (CAGR)",
                value: `${(results.cagr * 100).toFixed(2)}%`,
                details: "Percentuale media annua di crescita composta",
                rating: this.getRating(results.cagr * 100)
            },
            {
                metric: "Volatilità Effettiva",
                value: `${(results.actualVolatility * 100).toFixed(2)}%`,
                details: "Deviazione standard dei rendimenti annuali",
                rating: this.getRating(results.actualVolatility * 100)
            },
            {
                metric: "Massimo Drawdown",
                value: `${(results.maxDrawdown * 100).toFixed(2)}%`,
                details: "Massima perdita rispetto al picco storico",
                rating: this.getRating(results.maxDrawdown * 100)
            }
        ];
        tableBody.innerHTML = '';
        metrics.forEach(metric => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${metric.metric}</td>
                <td>${metric.value}</td>
                <td>${metric.details}</td>
                <td><span class="badge bg-${metric.rating.class}">${metric.rating.text}</span></td>
            `;
            tableBody.appendChild(row);
        });
    },
    // Resetta la tabella
    resetTable: function() {
        document.getElementById('detailsTable').innerHTML = '';
    },
    // Esporta i dati della tabella in formato CSV
    exportToCSV: function() {
        const table = document.querySelector('.comparison-table');
        let csv = [];
        const rows = table.querySelectorAll('tr');
        for (let row of rows) {
            let cols = row.querySelectorAll('td, th');
            let rowData = [];
            for (let col of cols) {
                rowData.push(`"${col.innerText.trim()}"`);
            }
            csv.push(rowData.join(','));
        }
        const csvString = csv.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'report_simulazione.csv');
        link.click();
    },
    // Valuta un valore e restituisce una valutazione
    getRating: function(value) {
        let ratingClass, ratingText;
        if (typeof value === 'string') {
            value = parseFloat(value.replace(/[^0-9.-]/g, ''));
        }
        if (value > 0 && value <= 10) {
            ratingClass = 'success';
            ratingText = 'Eccellente';
        } else if (value <= 25) {
            ratingClass = 'primary';
            ratingText = 'Buono';
        } else if (value <= 50) {
            ratingClass = 'warning';
            ratingText = 'Medio';
        } else {
            ratingClass = 'danger';
            ratingText = 'Basso';
        }
        return { class: ratingClass, text: ratingText };
    }
};