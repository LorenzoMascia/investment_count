const TableManager = {
    // Update table with results
    updateTable: function(results) {
        const tableBody = document.getElementById('detailsTable');
        if (!results || !results.baseProjection) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No data available</td>
                </tr>
            `;
            return;
        }
        const finalYear = results.baseProjection[results.baseProjection.length - 1];
        const metrics = [
            {
                metric: "Final Value",
                value: `€${finalYear.value.toLocaleString('it-IT', { maximumFractionDigits: 2 })}`,
                details: "Total final investment after taxes and fees",
                rating: this.getRating(finalYear.value / finalYear.totalInvested)
            },
            {
                metric: "Total Invested Capital",
                value: `€${finalYear.totalInvested.toLocaleString('it-IT', { maximumFractionDigits: 2 })}`,
                details: "SInitial sum plus accumulated monthly contributions",
                rating: this.getRating(finalYear.totalInvested / finalYear.value)
            },
            {
                metric: "Net Gain",
                value: `€${(finalYear.value - finalYear.totalInvested).toLocaleString('it-IT', { maximumFractionDigits: 2 })}`,
                details: "Gross earnings minus taxes paid",
                rating: this.getRating((finalYear.value - finalYear.totalInvested) / finalYear.totalInvested)
            },
            {
                metric: "Compound Annual Growth Rate (CAGR)",
                value: `${(results.cagr * 100).toFixed(2)}%`,
                details: "Average annual percentage of compound growth",
                rating: this.getRating(results.cagr * 100)
            },
            {
                metric: "Effective Volatility",
                value: `${(results.actualVolatility * 100).toFixed(2)}%`,
                details: "Standard deviation of annual returns",
                rating: this.getRating(results.actualVolatility * 100)
            },
            {
                metric: "Maximum Drawdown",
                value: `${(results.maxDrawdown * 100).toFixed(2)}%`,
                details: "Maximum loss compared to historical peak",
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
    // Evaluates a value and returns an evaluation
    getRating: function(value) {
        let ratingClass, ratingText;
        if (typeof value === 'string') {
            value = parseFloat(value.replace(/[^0-9.-]/g, ''));
        }
        if (value > 0 && value <= 10) {
            ratingClass = 'success';
            ratingText = 'Excellent';
        } else if (value <= 25) {
            ratingClass = 'primary';
            ratingText = 'Good';
        } else if (value <= 50) {
            ratingClass = 'warning';
            ratingText = 'Medium';
        } else {
            ratingClass = 'danger';
            ratingText = 'Low';
        }
        return { class: ratingClass, text: ratingText };
    }
};