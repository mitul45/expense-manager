(function() {
  const monthlyDetailsEl = document.querySelector('.monthly-details');
  const chartCtx = {};
  const utils = window.expenseManager.utils;

  function formatExpensesByMonth(allExpenses) {
    const monthlyData = {};
    allExpenses.forEach(expense => {
      const date = expense[0];
      const category = expense[3];
      const isTransfer = expense[6];
      const expenseAmount = expense[4];
      const incomeAmount = expense[5];

      const key = `${date.getMonth()} - ${date.getFullYear()}`;

      monthlyData[key] = monthlyData[key] || {
        chartData: {},
        expenses: [],
        incomes: [],
        expenseAmount: 0,
        incomeAmount: 0,
        transferAmount: 0,
      };
      if (isTransfer) {
        monthlyData[key].transferAmount += expenseAmount;
      } else if (expenseAmount > 0) {
        monthlyData[key].expenses.push({
          date,
          category,
          isTransfer,
          expenseAmount,
          title: expense[1],
        });

        monthlyData[key].chartData[`${category}`] = monthlyData[key].chartData[`${category}`] || 0;
        monthlyData[key].chartData[`${category}`] += expenseAmount;
        monthlyData[key].expenseAmount += expenseAmount;
      } else if (incomeAmount > 0) {
        monthlyData[key].incomes.push({
          date,
          category,
          isTransfer,
          incomeAmount,
          title: expense[1],
        });

        monthlyData[key].incomeAmount += incomeAmount;
      }
    });
    return monthlyData;
  }

  function getChartJSData(data, month, year) {
    const categories = Object.keys(data.chartData).sort();
    const chartJSData = {
      data: [],
      labels: categories,
    };
    categories.forEach(category => {
      chartJSData.data.push(data.chartData[category]);
    });
    return chartJSData;
  }

  function plotPieChart(data, month, year) {
    const chartData = getChartJSData(data, month, year);
    new Chart(document.getElementById(`${month}-${year}`).getContext('2d'), {
      type: 'doughnut',
      options: {
        legend: {
          position: 'bottom',
        },
      },
      data: {
        datasets: [
          {
            data: chartData.data,
            backgroundColor: '#ED5E59',
            borderWidth: 1,
          },
        ],
        labels: chartData.labels,
      },
    });
  }

  function init(allExpenses) {
    const monthlyData = formatExpensesByMonth(allExpenses);
    const indexDate = new Date();

    for (let i = 0; i < 12; i++) {
      const data = monthlyData[`${indexDate.getMonth()} - ${indexDate.getFullYear()}`];
      if (data) {
        const topExpenses = data.expenses.sort((a, b) => b.expenseAmount - a.expenseAmount).slice(0, 10);
        monthlyDetailsEl.innerHTML += `
          <h3 class="monthly-details__title">
            ${utils.months[indexDate.getMonth()]} – ${indexDate.getFullYear()}
            <span class="montly-details__title__small">
              (<span class="green"> + ${data.incomeAmount.toFixed(2)}</span>, 
               <span class="red">– ${data.expenseAmount.toFixed(2)}</span>, 
               <span class="orange">&plusmn; ${data.transferAmount.toFixed(2)}</span> )
            </span>
          </h3>
          <div class="monthly-details__month-block">
            <div class="monthly-details__top-expenses">
              <table class="mdl-data-table monthly-details__top-expenses__table" id="expenses-${indexDate.getMonth()}-${indexDate.getFullYear()}">
              </table>
            </div>
            <canvas id="${indexDate.getMonth()}-${indexDate.getFullYear()}" width="50vw;"></canvas>
          </div>
          `;

        const expenseTable = document.getElementById(`expenses-${indexDate.getMonth()}-${indexDate.getFullYear()}`);
        topExpenses.map(expense => {
          expenseTable.appendChild(
            utils.createTR([
              {
                value: expense.title,
                className: 'mdl-data-table__cell--non-numeric',
              },
              {
                value: expense.expenseAmount,
              },
            ]),
          );
        });

        setTimeout(plotPieChart.bind(null, data, indexDate.getMonth(), indexDate.getFullYear()));
      }

      indexDate.setMonth(indexDate.getMonth() - 1);
    }
  }

  window.expenseManager.monthlyDetails = {
    init,
  };
})();
