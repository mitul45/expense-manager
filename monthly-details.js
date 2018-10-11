(function() {
  const monthlyDetailsEl = document.querySelector('.monthly-details');
  const chartCtx = {};
  const utils = window.expenseManager.utils;

  function init(transactions) {
    const monthlyData = formatTransactionsByMonth(transactions);
    const indexDate = new Date();

    for (let i = 0; i < 12; i++) {
      const data = monthlyData[`${indexDate.getMonth()} - ${indexDate.getFullYear()}`];
      if (data) {
        monthlyDetailsEl.innerHTML += `
            <h4 class="monthly-details__title">
              ${utils.months[indexDate.getMonth()]} – ${indexDate.getFullYear()}
              <span class="montly-details__title__small">
                (<span class="green"> + ${data.incomeAmount.toFixed(2)}</span>, 
                 <span class="red">– ${data.expenseAmount.toFixed(2)}</span>, 
                 <span class="orange">&plusmn; ${data.transferAmount.toFixed(2)}</span> )
              </span>
            </h4>
          <div class="monthly-details__charts">
            <div class="montly-details__charts__category">
                <canvas id="categories-${indexDate.getMonth()}-${indexDate.getFullYear()}"></canvas>
            </div>
            <div class="montly-details__charts__account">
                <canvas id="accounts-${indexDate.getMonth()}-${indexDate.getFullYear()}"></canvas>
            </div>
          </div>
          </div>

          <details>
            <summary>
              All Transactions
            </summary>
            <div class="monthly-details__table">
              <table class="mdl-data-table monthly-expense-table" id="transactions-${indexDate.getMonth()}-${indexDate.getFullYear()}">
              </table>
            </div>
          </details>
          `;

        const transactionTable = document.getElementById(
          `transactions-${indexDate.getMonth()}-${indexDate.getFullYear()}`,
        );
        const monthlyTransactions = [
          ...data.incomes.sort(utils.sortBy.bind(null, 'incomeAmount')),
          ...data.transfers.sort(utils.sortBy.bind(null, 'transferAmount')),
          ...data.expenses.sort(utils.sortBy.bind(null, 'expenseAmount')),
        ];

        monthlyTransactions.forEach(transaction => {
          const row = utils.isMobileDevice()
            ? utils.createTR([
                {
                  value: transaction.title ? transaction.title : '–',
                  className: 'mdl-data-table__cell--non-numeric',
                },
                {
                  value: transaction.expenseAmount
                    ? transaction.expenseAmount
                    : transaction.incomeAmount
                      ? transaction.incomeAmount
                      : transaction.transferAmount,
                  className: transaction.expenseAmount
                    ? 'red'
                    : transaction.incomeAmount ? 'green' : 'orange',
                },
              ])
            : utils.createTR([
                {
                  value: `${transaction.date.getDate()}/${transaction.date.getMonth() +
                    1}/${transaction.date.getFullYear()}`,
                  className: 'mdl-data-table__cell--non-numeric',
                },
                {
                  value: transaction.title ? transaction.title : '–',
                  className: 'mdl-data-table__cell--non-numeric',
                },
                {
                  value: transaction.category,
                  className: 'mdl-data-table__cell--non-numeric',
                },
                {
                  value: transaction.account,
                  className: 'mdl-data-table__cell--non-numeric',
                },
                {
                  value: transaction.expenseAmount
                    ? transaction.expenseAmount
                    : transaction.incomeAmount
                      ? transaction.incomeAmount
                      : transaction.transferAmount,
                  className: transaction.expenseAmount
                    ? 'red'
                    : transaction.incomeAmount ? 'green' : 'orange',
                },
              ]);
          transactionTable.appendChild(row);
        });
        setTimeout(plotPieChart.bind(null, data, indexDate.getMonth(), indexDate.getFullYear()));
      }

      indexDate.setMonth(indexDate.getMonth() - 1);
    }
  }

  function formatTransactionsByMonth(transactions) {
    const monthlyData = {};
    transactions.forEach(expense => {
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
          account,
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
          account,
        });

        monthlyData[key].chartData.byCategory[category] =
          monthlyData[key].chartData.byCategory[category] || 0;
        monthlyData[key].chartData.byAccount[account] =
          monthlyData[key].chartData.byAccount[account] || 0;

        monthlyData[key].chartData.byCategory[category] += expenseAmount;
        monthlyData[key].chartData.byAccount[account] += expenseAmount;
        monthlyData[key].expenseAmount += expenseAmount;
      } else if (!isTransfer && incomeAmount > 0) {
        monthlyData[key].incomes.push({
          date,
          category,
          account,
          incomeAmount,
          title,
        });

        monthlyData[key].incomeAmount += incomeAmount;
      }
    });
    return monthlyData;
  }

  function plotPieChart(data, month, year) {
    const chartData = getChartJSData(data);

    new Chart(document.getElementById(`categories-${month}-${year}`).getContext('2d'), {
      type: 'doughnut',
      options: {
        title: {
          display: true,
          text: 'By category',
        },
        legend: {
          display: utils.isMobileDevice() ? false : true,
          position: 'right',
        },
        tooltips: {
          enabled: false,
          custom: function(tooltipModel) {
            customTooltip.apply(this, [tooltipModel, 'categories', data.expenses]);
          },
        },
      },
      data: {
        datasets: [
          {
            data: chartData.categoryTotal,
            backgroundColor: utils.getColorsForCategories(chartData.categories),
            borderWidth: 0.5,
            borderColor: '#333',
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
          display: utils.isMobileDevice() ? false : true,
          position: 'right',
        },
        tooltips: {
          enabled: false,
          custom: function(tooltipModel) {
            customTooltip.apply(this, [tooltipModel, 'accounts', data.expenses]);
          },
        },
      },
      data: {
        datasets: [
          {
            data: chartData.accountTotal,
            backgroundColor: utils.getColorsForAccounts(chartData.accounts),
            borderWidth: 0.5,
            borderColor: '#333',
          },
        ],
        labels: chartData.accounts,
      },
    });
  }

  function customTooltip(tooltipModel, chartType, expenses) {
    // Tooltip Element
    var tooltipEl = document.getElementById('chartjs-tooltip');

    // Create element on first render
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'chartjs-tooltip';
      tooltipEl.innerHTML = '<table></table>';
      document.body.appendChild(tooltipEl);
    }

    // Hide if no tooltip
    if (tooltipModel.opacity === 0) {
      tooltipEl.style.opacity = 0;
      tooltipEl.style.zIndex = 0;
      return;
    }

    // Set caret Position
    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltipModel.yAlign) {
      tooltipEl.classList.add(tooltipModel.yAlign);
    } else {
      tooltipEl.classList.add('no-transform');
    }

    // Set Text
    if (tooltipModel.body) {
      const title = tooltipModel.body[0].lines[0].split(':')[0];
      const amount = tooltipModel.body[0].lines[0].split(': ')[1];
      let rows = [];
      let innerHtml = `<thead>`;
      innerHtml += `<tr><th> ${title} </th><th>${amount}</th></tr>`;
      innerHtml += `</thead><tbody>`;

      if (chartType === 'categories') {
        rows = expenses
          .filter(expense => expense.category === title)
          .sort(utils.sortBy.bind(null, 'expenseAmount'))
          .slice(0, 7);
      } else if (chartType === 'accounts') {
        rows = expenses
          .filter(expense => expense.account === title)
          .sort(utils.sortBy.bind(null, 'expenseAmount'))
          .slice(0, 7);
      }

      innerHtml += rows
        .map(row => `<tr><td>${row.title}</td><td>${row.expenseAmount}</td></tr>`)
        .join('');

      innerHtml += '</tbody>';

      var tableRoot = tooltipEl.querySelector('table');
      tableRoot.innerHTML = innerHtml;
    }

    // `this` will be the overall tooltip
    var position = this._chart.canvas.getBoundingClientRect();

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.zIndex = 1;
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.left = position.left + tooltipModel.caretX + 'px';
    tooltipEl.style.top = position.top + tooltipModel.caretY + 'px';
    tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
    tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
    tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
    tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
  }

  function getChartJSData(data) {
    const categories = Object.keys(data.chartData.byCategory);
    const accounts = Object.keys(data.chartData.byAccount);
    const chartJSData = {
      categoryTotal: [],
      accountTotal: [],
      categories,
      accounts,
    };
    categories.forEach(category =>
      chartJSData.categoryTotal.push(data.chartData.byCategory[category].toFixed(2)),
    );
    accounts.forEach(account =>
      chartJSData.accountTotal.push(data.chartData.byAccount[account].toFixed(2)),
    );
    return chartJSData;
  }

  window.expenseManager.monthlyDetails = {
    init,
  };
})();
