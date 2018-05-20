(function() {
  const monthlyDetailsEl = document.querySelector('.monthly-details');
  const chartCtx = {};
  const utils = window.expenseManager.utils;

  function formatExpensesByMonth(allExpenses) {
    const monthlyData = {};
    allExpenses.forEach(expense => {
      const [date, title, account, category, expenseAmount, incomeAmount, isTransfer] = expense;
      const key = `${date.getMonth()} - ${date.getFullYear()}`;

      monthlyData[key] = monthlyData[key] || {
        chartData: {
          byCategory: {},
          byAccount: {},
        },
        expenses: [],
        incomes: [],
        transfers: [],
        expenseAmount: 0,
        incomeAmount: 0,
        transferAmount: 0,
      };
      if (isTransfer && expenseAmount > 0) {
        monthlyData[key].transfers.push({
          date,
          category,
          transferAmount: expenseAmount,
          title,
        });

        monthlyData[key].transferAmount += expenseAmount;
      } else if (!isTransfer && expenseAmount > 0) {
        monthlyData[key].expenses.push({
          date,
          category,
          expenseAmount,
          title,
        });

        monthlyData[key].chartData.byCategory[category] = monthlyData[key].chartData.byCategory[category] || 0;
        monthlyData[key].chartData.byAccount[account] = monthlyData[key].chartData.byAccount[account] || 0;
        monthlyData[key].chartData.byCategory[category] += expenseAmount;
        monthlyData[key].chartData.byAccount[account] += expenseAmount;
        monthlyData[key].expenseAmount += expenseAmount;
      } else if (!isTransfer && incomeAmount > 0) {
        monthlyData[key].incomes.push({
          date,
          category,
          incomeAmount,
          title,
        });

        monthlyData[key].incomeAmount += incomeAmount;
      }
    });
    return monthlyData;
  }

  function getChartJSData(data, month, year) {
    const categories = Object.keys(data.chartData.byCategory).sort();
    const accounts = Object.keys(data.chartData.byAccount).sort();
    const chartJSData = {
      categoryTotal: [],
      accountTotal: [],
      categories,
      accounts,
    };
    categories.forEach(category => chartJSData.categoryTotal.push(data.chartData.byCategory[category].toFixed(2)));
    accounts.forEach(account => chartJSData.accountTotal.push(data.chartData.byAccount[account].toFixed(2)));
    return chartJSData;
  }

  function plotPieChart(data, month, year) {
    const chartData = getChartJSData(data, month, year);
    new Chart(document.getElementById(`categories-${month}-${year}`).getContext('2d'), {
      type: 'doughnut',
      options: {
        title: {
          display: true,
          text: 'By category',
        },
        legend: {
          display: false,
          position: 'bottom',
        },
      },
      data: {
        datasets: [
          {
            data: chartData.categoryTotal,
            backgroundColor: '#ED5E59',
            borderWidth: 1,
          },
        ],
        labels: chartData.categories,
      },
    });
    new Chart(document.getElementById(`accounts-${month}-${year}`).getContext('2d'), {
      type: 'doughnut',
      options: {
        title: {
          display: true,
          text: 'By account',
        },
        legend: {
          display: false,
          position: 'bottom',
        },
      },
      data: {
        datasets: [
          {
            data: chartData.accountTotal,
            backgroundColor: '#ED5E59',
            borderWidth: 1,
          },
        ],
        labels: chartData.accounts,
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
        const incomes = data.incomes.sort((a, b) => b.incomeAmount - a.incomeAmount).slice(0, 10);
        const transfers = data.transfers.sort((a, b) => b.expenseAmount - a.expenseAmount).slice(0, 10);

        monthlyDetailsEl.innerHTML += `
          <div>
            <h3 class="monthly-details__title">
              ${utils.months[indexDate.getMonth()]} – ${indexDate.getFullYear()}
              <span class="montly-details__title__small">
                (<span class="green"> + ${data.incomeAmount.toFixed(2)}</span>, 
                 <span class="red">– ${data.expenseAmount.toFixed(2)}</span>, 
                 <span class="orange">&plusmn; ${data.transferAmount.toFixed(2)}</span> )
              </span>
            </h3>
            <div class="monthly-details__charts">
              <div class="montly-details__charts__category">
                  <canvas id="categories-${indexDate.getMonth()}-${indexDate.getFullYear()}"></canvas>
              </div>
              <div class="montly-details__charts__account">
                  <canvas id="accounts-${indexDate.getMonth()}-${indexDate.getFullYear()}"></canvas>
              </div>
            </div>
            </div>
            <div class="monthly-details__tables">
              <table class="mdl-data-table" id="expenses-${indexDate.getMonth()}-${indexDate.getFullYear()}">
                <thead><tr><th colspan="2">
                  Top expenses
                </th></tr></thead>
              </table>
              <table class="mdl-data-table" id="incomes-${indexDate.getMonth()}-${indexDate.getFullYear()}">
                <thead><tr><th colspan="2">
                  Incomes
                </th></tr></thead>
              </table>
              <table class="mdl-data-table" id="transfers-${indexDate.getMonth()}-${indexDate.getFullYear()}">
                <thead><tr><th colspan="2">
                  Transfers
                </th></tr></thead>
              </table>
            </div>
          </div>
          `;

        const expenseTable = document.getElementById(`expenses-${indexDate.getMonth()}-${indexDate.getFullYear()}`);
        const incomeTable = document.getElementById(`incomes-${indexDate.getMonth()}-${indexDate.getFullYear()}`);
        const transferTable = document.getElementById(`transfers-${indexDate.getMonth()}-${indexDate.getFullYear()}`);

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

        incomes.map(income => {
          incomeTable.appendChild(
            utils.createTR([
              {
                value: income.title,
                className: 'mdl-data-table__cell--non-numeric',
              },
              {
                value: income.incomeAmount,
              },
            ]),
          );
        });

        transfers.map(transfer => {
          transferTable.appendChild(
            utils.createTR([
              {
                value: transfer.title,
                className: 'mdl-data-table__cell--non-numeric',
              },
              {
                value: transfer.transferAmount,
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
